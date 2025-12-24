const XLSX = require("xlsx");
const excelConfigs = require("../config/excel.config");

class ExcelService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Import data từ Excel
   * @param {string} entityType - Loại entity (user, team, resource, network)
   * @param {Buffer} fileBuffer - Buffer của file Excel
   * @returns {Promise<Object>} - Kết quả import
   */
  async importFromExcel(entityType, fileBuffer) {
    const config = excelConfigs[entityType];
    if (!config) {
      throw new Error(`Entity type "${entityType}" không được hỗ trợ`);
    }

    // Đọc file Excel
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new Error("File Excel không có dữ liệu!");
    }

    const Model = this.db[config.modelName];

    const results = {
      success: [],
      errors: [],
      total: data.length,
    };

    // Xử lý từng row một cách độc lập (không dùng transaction)
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validate và transform data
        const processedData = await this._processRowData(row, config, null);

        if (processedData.error) {
          results.errors.push({
            row: rowNumber,
            error: processedData.error,
            data: row,
          });
          continue;
        }

        // Kiểm tra duplicate
        const duplicateCheck = await this._checkDuplicate(
          Model,
          processedData.data,
          config,
          null
        );

        if (duplicateCheck) {
          results.errors.push({
            row: rowNumber,
            error: duplicateCheck,
            data: row,
          });
          continue;
        }

        // Apply defaults
        const finalData = {
          ...config.defaults,
          ...processedData.data,
        };

        // beforeCreate hook
        const dataToCreate = config.beforeCreate
          ? config.beforeCreate(finalData)
          : finalData;

        // Tạo record
        const newRecord = await Model.create(dataToCreate);

        // afterImport hook
        let extraData = {};
        if (config.afterImport) {
          extraData = await config.afterImport(newRecord, null, this.db);
        }

        results.success.push({
          row: rowNumber,
          id: newRecord._id,
          ...this._getSuccessInfo(newRecord, config),
          ...extraData,
        });
      } catch (err) {
        results.errors.push({
          row: rowNumber,
          error: err.message,
          data: row,
        });
      }
    }

    if (results.success.length === 0) {
      console.error("IMPORT FAILED - ALL ROWS INVALID");
      console.error("ERROR DETAILS:", JSON.stringify(results.errors, null, 2));
      throw new Error("Không có bản ghi hợp lệ để import");
    }

    return results;
  }

  /**
   * Export data ra Excel
   * @param {string} entityType - Loại entity
   * @param {Object} filter - Filter để query data
   * @returns {Promise<Buffer>} - Buffer của file Excel
   */
  async exportToExcel(entityType, filter = {}) {
    const config = excelConfigs[entityType];
    if (!config) {
      throw new Error(`Entity type "${entityType}" không được hỗ trợ`);
    }

    const Model = this.db[config.modelName];

    // Build query với populate
    let query = Model.find(filter);

    // Auto populate references
    config.columns
      .filter((col) => col.isReference && col.dbField)
      .forEach((col) => {
        const populateField = col.dbField;
        const selectFields = this._getPopulateFields(col.referenceModel);
        query = query.populate(populateField, selectFields);
      });

    const records = await query.sort({ createdAt: -1 }).lean();

    // Prepare export data
    const exportData = config.prepareExportData
      ? await config.prepareExportData(records, this.db)
      : this._defaultPrepareExportData(records, config);

    // Tạo worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = config.exportColumns.map((col) => ({
      wch: col.width || 15,
    }));
    worksheet["!cols"] = columnWidths;

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);

    // Export buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return buffer;
  }

  /**
   * Export template Excel
   * @param {string} entityType - Loại entity
   * @returns {Promise<Buffer>} - Buffer của file Excel template
   */
  async exportTemplate(entityType) {
    const config = excelConfigs[entityType];
    if (!config) {
      throw new Error(`Entity type "${entityType}" không được hỗ trợ`);
    }

    // Tạo worksheet từ template data
    const worksheet = XLSX.utils.json_to_sheet(config.templateData);

    // Set column widths
    const columnWidths = config.columns.map((col) => ({
      wch: col.width || 15,
    }));
    worksheet["!cols"] = columnWidths;

    // Tạo sheet hướng dẫn
    const instructionSheet = XLSX.utils.json_to_sheet(config.instructions);
    instructionSheet["!cols"] = [
      { wch: 25 }, // Cột
      { wch: 60 }, // Mô tả
      { wch: 15 }, // Bắt buộc
    ];

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Hướng dẫn");

    // Export buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return buffer;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Xử lý và validate data từ một row
   */
  async _processRowData(row, config, session) {
    const processedData = {};
    let error = null;

    // Kiểm tra required fields
    for (const col of config.columns) {
      const value = row[col.excelKey];

      // Check required
      if (col.required && !value) {
        error = `Thiếu thông tin bắt buộc: ${col.displayName}`;
        break;
      }

      if (!value) continue;

      // Validate
      if (col.validate && !col.validate(value)) {
        error = `Giá trị không hợp lệ cho ${col.displayName}`;
        break;
      }

      // Transform
      let transformedValue = value;
      if (col.transform) {
        transformedValue = await col.transform(value);
      }

      // Handle reference
      if (col.isReference) {
        const refValue = await this._resolveReference(
          col,
          transformedValue,
          session
        );
        if (col.required && !refValue) {
          error = `Không tìm thấy ${col.referenceModel} với ${col.referenceField}: ${value}`;
          break;
        }
        processedData[col.dbField] = refValue;
      } else {
        processedData[col.dbField] = transformedValue;
      }
    }

    return { data: processedData, error };
  }

  /**
   * Resolve reference (tìm ID từ reference field)
   */
  async _resolveReference(col, value, session) {
    const RefModel = this.db[col.referenceModel];

    if (col.isArray) {
      // Handle array of references
      const values = value.split(col.delimiter || ",").map((v) => v.trim());
      const query = {};
      query[col.referenceField] = { $in: values };

      const refs = await RefModel.find(query).lean();
      return refs.map((ref) => ref[col.referenceKey]);
    } else {
      // Handle single reference
      const query = {};
      query[col.referenceField] = value;

      const ref = await RefModel.findOne(query).lean();
      return ref ? ref[col.referenceKey] : null;
    }
  }

  /**
   * Kiểm tra duplicate record
   */
  async _checkDuplicate(Model, data, config, session) {
    // Tìm unique field (thường là email hoặc field đầu tiên required)
    const uniqueField = config.columns.find(
      (col) => col.required && !col.isReference
    );

    if (!uniqueField) return null;

    const query = {};
    query[uniqueField.dbField] = data[uniqueField.dbField];

    const existing = await Model.findOne(query);
    if (existing) {
      return `${uniqueField.displayName} đã tồn tại: ${
        data[uniqueField.dbField]
      }`;
    }

    return null;
  }

  /**
   * Lấy thông tin success từ record
   */
  _getSuccessInfo(record, config) {
    const info = {};
    config.columns.slice(0, 3).forEach((col) => {
      if (!col.isReference && record[col.dbField]) {
        info[col.dbField] = record[col.dbField];
      }
    });
    return info;
  }

  /**
   * Lấy fields để populate
   */
  _getPopulateFields(modelName) {
    // Common fields for each model
    const fieldMap = {
      User: "fullName personalEmail role team",
      Team: "name",
      Channel: "name link status",
      Network: "profileAdsenseId emailAddress status",
    };
    return fieldMap[modelName] || "name";
  }

  /**
   * Default prepare export data
   */
  _defaultPrepareExportData(records, config) {
    return records.map((record, index) => {
      const row = { stt: index + 1 };

      config.exportColumns.forEach((col) => {
        if (col.key === "stt") return;

        const value = this._getNestedValue(record, col.key);
        row[col.displayName] = value || "";
      });

      return row;
    });
  }

  /**
   * Get nested value từ object
   */
  _getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}

module.exports = ExcelService;
