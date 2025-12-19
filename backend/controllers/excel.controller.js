const db = require("../models");
const ExcelService = require("../services/excel.service");

// Khởi tạo service
const excelService = new ExcelService(db);

/**
 * Generic import handler
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

    const results = await excelService.importFromExcel(
      entityType,
      req.file.buffer
    );

    return res.json({
      success: true,
      message: `Import hoàn tất: ${results.success.length}/${results.total} thành công`,
      data: results,
    });
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

  // Resource
  importResourceExcel,
  exportResourceExcel,
  exportResourceTemplate,

  // Generic functions (có thể dùng cho entity mới)
  importExcel,
  exportExcel,
  exportTemplate,
};
