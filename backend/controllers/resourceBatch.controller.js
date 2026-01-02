// controllers/resourceBatch.controller.js

const db = require("../models");
const ResourceBatch = db.ResourceBatch;
const Resource = db.Resource; // Để validate resource IDs nếu cần
const mongoose = require("mongoose");

/**
 * Lấy tất cả các batch
 */
const getAllBatches = async (req, res) => {
  try {
    const batches = await ResourceBatch.find()
      .populate("resources", "email status assignedUser assignedChannel")
      .populate("assignedUser", "fullName personalEmail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: batches,
      total: batches.length,
    });
  } catch (error) {
    console.error("Error in getAllBatches:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách batch",
      error: error.message,
    });
  }
};

/**
 * Lấy một batch theo ID
 */
const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID batch không hợp lệ",
      });
    }

    const batch = await ResourceBatch.findById(id)
      .populate("resources", "email status assignedUser assignedChannel")
      .populate("assignedUser", "fullName personalEmail");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch",
      });
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error("Error in getBatchById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin batch",
      error: error.message,
    });
  }
};

/**
 * Tạo mới một batch
 */
const createBatch = async (req, res) => {
  try {
    const { excelFileName, resources, assignedUser, status, note } = req.body;

    if (!excelFileName || !assignedUser) {
      return res.status(400).json({
        success: false,
        message: "Thiếu excelFileName hoặc assignedUser",
      });
    }

    // Validate assignedUser là ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(assignedUser)) {
      return res.status(400).json({
        success: false,
        message: "assignedUser không hợp lệ",
      });
    }

    // Validate resources nếu có (mảng ObjectId)
    if (resources) {
      if (
        !Array.isArray(resources) ||
        resources.some((r) => !mongoose.Types.ObjectId.isValid(r))
      ) {
        return res.status(400).json({
          success: false,
          message: "Resources phải là mảng các ObjectId hợp lệ",
        });
      }
    }

    const newBatch = await ResourceBatch.create({
      excelFileName,
      resources: resources || [],
      assignedUser,
      status: status || "ACTIVE",
      note: note || "",
    });

    const populatedBatch = await ResourceBatch.findById(newBatch._id)
      .populate("resources", "email status assignedUser assignedChannel")
      .populate("assignedUser", "fullName personalEmail");

    res.status(201).json({
      success: true,
      message: "Tạo batch thành công",
      data: populatedBatch,
    });
  } catch (error) {
    console.error("Error in createBatch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo batch",
      error: error.message,
    });
  }
};

/**
 * Cập nhật batch
 */
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID batch không hợp lệ",
      });
    }

    const updateData = req.body;

    // Validate resources nếu có gửi lên
    if (updateData.resources) {
      if (
        !Array.isArray(updateData.resources) ||
        updateData.resources.some((r) => !mongoose.Types.ObjectId.isValid(r))
      ) {
        return res.status(400).json({
          success: false,
          message: "Resources phải là mảng các ObjectId hợp lệ",
        });
      }
    }

    // Validate assignedUser nếu có cập nhật
    if (
      updateData.assignedUser &&
      !mongoose.Types.ObjectId.isValid(updateData.assignedUser)
    ) {
      return res.status(400).json({
        success: false,
        message: "assignedUser không hợp lệ",
      });
    }

    const updatedBatch = await ResourceBatch.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("resources", "email status assignedUser assignedChannel")
      .populate("assignedUser", "fullName personalEmail");

    if (!updatedBatch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch để cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật batch thành công",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error in updateBatch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật batch",
      error: error.message,
    });
  }
};

/**
 * Xóa batch
 */
const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID batch không hợp lệ",
      });
    }

    const deletedBatch = await ResourceBatch.findByIdAndDelete(id);

    if (!deletedBatch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch để xóa",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa batch thành công",
      data: deletedBatch,
    });
  } catch (error) {
    console.error("Error in deleteBatch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa batch",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách resources thuộc một batch
 */
const getBatchResources = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID batch không hợp lệ",
      });
    }

    const batch = await ResourceBatch.findById(id).select(
      "resources excelFileName"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch",
      });
    }

    const resources = await Resource.find({ _id: { $in: batch.resources } })
      .populate("assignedUser", "fullName")
      .populate("assignedChannel", "name");

    res.status(200).json({
      success: true,
      data: {
        batchId: batch._id,
        excelFileName: batch.excelFileName,
        totalResources: resources.length,
        resources,
      },
    });
  } catch (error) {
    console.error("Error in getBatchResources:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy resources của batch",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchResources,
};
