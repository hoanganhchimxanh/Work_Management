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
   * @param {Object} options - Additional options (assignedUser, originalFileName)
   * @returns {Promise<Object>} - Kết quả import
   */
  async importFromExcel(entityType, fileBuffer, options = {}) {
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
      batchId: null, // Thêm batchId để trả về
    };

    // Array để lưu IDs của các records được tạo thành công (cho ResourceBatch)
    const createdResourceIds = [];

    // --- MỚI: PREFETCH DATA ---
    const cache = await this._prefetchReferencesAndDuplicates(Model, data, config);

    let validDataToInsert = [];
    let validProcessedData = [];
    let validRows = [];

    // Xử lý từng row một cách độc lập
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validate và transform data
        const processedData = await this._processRowDataWithCache(row, config, cache);

        if (processedData.error) {
          results.errors.push({
            row: rowNumber,
            error: processedData.error,
            data: row,
          });
          continue;
        }

        // Kiểm tra duplicate
        const duplicateCheck = this._checkDuplicateWithCache(
          processedData.data,
          config,
          cache
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

        validDataToInsert.push(dataToCreate);
        validProcessedData.push(processedData.data);
        validRows.push(rowNumber);
      } catch (err) {
        results.errors.push({
          row: rowNumber,
          error: err.message,
          data: row,
        });
      }
    }

    if (results.success.length === 0 && validDataToInsert.length === 0) {
      console.error("IMPORT FAILED - ALL ROWS INVALID");
      console.error("ERROR DETAILS:", JSON.stringify(results.errors, null, 2));
      throw new Error("Không có bản ghi hợp lệ để import");
    }

    // --- MỚI: BULK INSERT & AFTER IMPORT ---
    if (validDataToInsert.length > 0) {
      try {
        const insertedRecords = await Model.insertMany(validDataToInsert);

        for (let i = 0; i < insertedRecords.length; i++) {
          const newRecord = insertedRecords[i];
          const rowNumber = validRows[i];
          const processedRawData = validProcessedData[i];

          let extraData = {};
          if (config.afterImport) {
            try {
              extraData = await config.afterImport(
                newRecord,
                null,
                this.db,
                processedRawData,
              );
            } catch (afterImportErr) {
              console.error(`Lỗi afterImport ở dòng ${rowNumber}:`, afterImportErr);
            }
          }

          results.success.push({
            row: rowNumber,
            id: newRecord._id,
            ...this._getSuccessInfo(newRecord, config),
            ...extraData,
          });

          // ✅ Lưu ID cho ResourceBatch (chỉ với entity type = resource)
          if (entityType === "resource") {
            createdResourceIds.push(newRecord._id);
          }
        }
      } catch (insertErr) {
        console.error("Bulk Insert Failed:", insertErr);
        throw new Error("Lỗi insert dữ liệu vào mongDB. Vui lòng kiểm tra lại định dạng dữ liệu: " + insertErr.message);
      }
    }

    // ✅ TẠO RESOURCE BATCH (chỉ cho resource imports)
    if (entityType === "resource" && createdResourceIds.length > 0) {
      try {
        const ResourceBatch = this.db.ResourceBatch;

        // Lấy originalFileName từ options hoặc tạo tên mặc định
        const excelFileName =
          options.originalFileName ||
          `Import_${new Date().toISOString().split("T")[0]}_${Date.now()}.xlsx`;

        const newBatch = await ResourceBatch.create({
          excelFileName,
          resources: createdResourceIds,
          assignedUser: options.assignedUser || null,
          status: "ACTIVE",
        });

        results.batchId = newBatch._id;

        console.log(
          `✅ Created ResourceBatch: ${newBatch._id} with ${createdResourceIds.length} resources`,
        );
      } catch (batchError) {
        console.error("❌ Error creating ResourceBatch:", batchError);
        // Không throw error để không làm fail cả quá trình import
        // Chỉ log lỗi và tiếp tục
        results.batchError = batchError.message;
      }
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

  async _processRowDataWithCache(row, config, cache) {
    const processedData = {};
    let error = null;

    for (const col of config.columns) {
      let value = row[col.excelKey];

      if (value === undefined && col.altExcelKey) {
        value = row[col.altExcelKey];
      }

      if (col.required && !value) {
        error = `Thiếu thông tin bắt buộc: ${col.displayName}`;
        break;
      }

      if (!value) continue;

      if (col.validate && !col.validate(value)) {
        error = `Giá trị không hợp lệ cho ${col.displayName}`;
        break;
      }

      let transformedValue = value;
      if (col.transform) {
        transformedValue = await col.transform(value);
      }

      if (col.isReference) {
        const refValue = this._resolveReferenceWithCache(col, transformedValue, cache);
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

  _resolveReferenceWithCache(col, value, cache) {
    if (!cache.references[col.dbField]) return null;

    if (col.isArray) {
      const values = value.toString().split(col.delimiter || ",").map((v) => v.trim());
      const refs = [];
      for (const v of values) {
         const id = cache.references[col.dbField].get(v);
         if (id) refs.push(id);
      }
      return refs;
    } else {
      return cache.references[col.dbField].get(value.toString().trim());
    }
  }

  _checkDuplicateWithCache(data, config, cache) {
    let uniqueFieldCol = null;
    if (config.uniqueField) {
      uniqueFieldCol = config.columns.find(
        (col) => col.dbField === config.uniqueField,
      );
    }

    if (!uniqueFieldCol) {
      uniqueFieldCol = config.columns.find(
        (col) => col.required && !col.isReference,
      );
    }

    if (!uniqueFieldCol) return null;

    const value = data[uniqueFieldCol.dbField];
    if (!value) return null;

    if (cache.duplicates.has(value)) {
      return `${uniqueFieldCol.displayName} đã tồn tại: ${value}`;
    }

    cache.duplicates.add(value);
    return null;
  }

  async _prefetchReferencesAndDuplicates(Model, data, config) {
    const cache = { duplicates: new Set(), references: {} };

    // 1. Prefetch duplicates
    let uniqueFieldCol = null;
    if (config.uniqueField) {
       uniqueFieldCol = config.columns.find((c) => c.dbField === config.uniqueField);
    }
    if (!uniqueFieldCol) {
       uniqueFieldCol = config.columns.find((c) => c.required && !c.isReference);
    }
    
    if (uniqueFieldCol) {
       const uniqueValues = data
         .map(row => row[uniqueFieldCol.excelKey] || row[uniqueFieldCol.altExcelKey])
         .filter(Boolean);

       if (uniqueValues.length > 0) {
         const query = { [uniqueFieldCol.dbField]: { $in: uniqueValues } };
         const existingRecords = await Model.find(query).select(uniqueFieldCol.dbField).lean();
         existingRecords.forEach(r => cache.duplicates.add(r[uniqueFieldCol.dbField]));
       }
    }

    // 2. Prefetch references
    for (const col of config.columns) {
       if (col.isReference && col.referenceModel) {
          const RefModel = this.db[col.referenceModel];
          cache.references[col.dbField] = new Map();
          
          let values = [];
          data.forEach(row => {
            const val = row[col.excelKey] || row[col.altExcelKey];
            if (val) {
               if (col.isArray) {
                 values.push(...val.toString().split(col.delimiter || ",").map(v => v.trim()));
               } else {
                 values.push(val.toString().trim());
               }
            }
          });
          
          values = [...new Set(values)];
          if (values.length > 0) {
             const query = { [col.referenceField]: { $in: values } };
             const selectFields = `${col.referenceField} ${col.referenceKey}`;
             const refs = await RefModel.find(query).select(selectFields).lean();
             refs.forEach(r => {
                 cache.references[col.dbField].set(r[col.referenceField], r[col.referenceKey]);
             });
          }
       }
    }

    return cache;
  }

  _getSuccessInfo(record, config) {
    const info = {};
    config.columns.slice(0, 3).forEach((col) => {
      if (!col.isReference && record[col.dbField]) {
        info[col.dbField] = record[col.dbField];
      }
    });
    return info;
  }

  _getPopulateFields(modelName) {
    const fieldMap = {
      User: "fullName phoneNumber role team",
      Team: "name",
      Channel: "name link status",
      Network: "profileAdsenseId emailAddress status",
    };
    return fieldMap[modelName] || "name";
  }

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

  _getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}

module.exports = ExcelService;
