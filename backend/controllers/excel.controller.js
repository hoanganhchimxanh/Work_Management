const db = require("../models");
const ExcelService = require("../services/excel.service");

// Khởi tạo service
const excelService = new ExcelService(db);

/**
 * Generic import handler với hỗ trợ ResourceBatch
 * @param {string} entityType - user, team, resource, etc.
 */
const importExcel = (entityType) => async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload file Excel!",
      });
    }

    // ✅ Chuẩn bị options cho import
    const options = {
      originalFileName: req.file.originalname, // Lấy tên file gốc
      userId: req.user.userId, // Lấy từ JWT token (admin đang import)
      assignedUser: req.user.userId, // User được gán quản lý batch
    };

    // Gọi service với options
    const results = await excelService.importFromExcel(
      entityType,
      req.file.buffer,
      options
    );

    // ✅ Response bao gồm cả batchId (nếu có)
    const response = {
      success: true,
      message: `Import hoàn tất: ${results.success.length}/${results.total} thành công`,
      data: results,
    };

    // Thêm thông tin về batch nếu có
    if (results.batchId) {
      response.message += ` | Batch ID: ${results.batchId}`;
      response.batchId = results.batchId;
    }

    // Cảnh báo nếu có lỗi tạo batch
    if (results.batchError) {
      response.warning = `Import thành công nhưng không tạo được batch: ${results.batchError}`;
    }

    return res.json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * Generic export handler
 * @param {string} entityType - user, team, resource, etc.
 */
const exportExcel = (entityType) => async (req, res, next) => {
  try {
    // Lấy filter từ query params
    const filter = { ...req.query };

    // Remove các params không phải filter
    delete filter.page;
    delete filter.limit;

    const buffer = await excelService.exportToExcel(entityType, filter);

    // Set headers
    const filename = `${entityType}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

/**
 * Generic template export handler
 * @param {string} entityType - user, team, resource, etc.
 */
const exportTemplate = (entityType) => async (req, res, next) => {
  try {
    const buffer = await excelService.exportTemplate(entityType);

    // Set headers
    const filename = `${entityType}_import_template.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// ==================== EXPORTED HANDLERS ====================

// User
const importUserExcel = importExcel("user");
const exportUserExcel = exportExcel("user");
const exportUserTemplate = exportTemplate("user");

// Team
const importTeamExcel = importExcel("team");
const exportTeamExcel = exportExcel("team");
const exportTeamTemplate = exportTemplate("team");

//Network
const importNetworkExcel = importExcel("network");
const exportNetworkExcel = exportExcel("network");
const exportNetworkTemplate = exportTemplate("network");

// Resource
const importResourceExcel = importExcel("resource");
const exportResourceExcel = exportExcel("resource");
const exportResourceTemplate = exportTemplate("resource");

module.exports = {
  // User
  importUserExcel,
  exportUserExcel,
  exportUserTemplate,

  // Team
  importTeamExcel,
  exportTeamExcel,
  exportTeamTemplate,

  //Network
  importNetworkExcel,
  exportNetworkExcel,
  exportNetworkTemplate,

  // Resource
  importResourceExcel,
  exportResourceExcel,
  exportResourceTemplate,

  // Generic functions (có thể dùng cho entity mới)
  importExcel,
  exportExcel,
  exportTemplate,
};
