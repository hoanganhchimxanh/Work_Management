const db = require("../models");
const ResourceBatch = db.ResourceBatch;
const Resource = db.Resource;
const mongoose = require("mongoose");

/**
 * Lấy tất cả các batch với filtering và pagination
 */
const getAllBatches = async (req, res) => {
  try {
    const { assignedUser, status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (assignedUser) filter.assignedUser = assignedUser;
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [batches, total] = await Promise.all([
      ResourceBatch.find(filter)
        .populate("resources", "email status assignedUser assignedChannel")
        .populate("assignedUser", "fullName personalEmail")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ResourceBatch.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
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
      .populate({
        path: "resources",
        select: "email status assignedUser assignedChannel recoveryEmail note",
        populate: [
          { path: "assignedUser", select: "fullName personalEmail" },
          { path: "assignedChannel", select: "name link" },
        ],
      })
      .populate("assignedUser", "fullName personalEmail role");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch",
      });
    }

    // Thêm thống kê
    const stats = {
      totalResources: batch.resources.length,
      availableResources: batch.resources.filter(
        (r) => r.status === "AVAILABLE"
      ).length,
      assignedResources: batch.resources.filter((r) => r.status === "ASSIGNED")
        .length,
      disabledResources: batch.resources.filter((r) => r.status === "DISABLED")
        .length,
    };

    res.status(200).json({
      success: true,
      data: {
        ...batch.toObject(),
        stats,
      },
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
 * Tạo mới một batch (thường dùng khi import Excel)
 */
const createBatch = async (req, res) => {
  try {
    const { excelFileName, resources, assignedUser, status } = req.body;

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

    // 1️⃣ Tìm batch
    const batch = await ResourceBatch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch để xóa",
      });
    }

    const resourceIds = batch.resources || [];

    // 2️⃣ Xóa resources thuộc batch
    if (resourceIds.length > 0) {
      await Resource.deleteMany({ _id: { $in: resourceIds } });
    }

    // 3️⃣ Xóa batch
    await ResourceBatch.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Đã xóa batch và toàn bộ resources liên quan",
      deletedResourcesCount: resourceIds.length,
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
    const { status, page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID batch không hợp lệ",
      });
    }

    const batch = await ResourceBatch.findById(id).select(
      "resources excelFileName assignedUser"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch",
      });
    }

    // Build filter cho resources
    const filter = { _id: { $in: batch.resources } };
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .populate("assignedUser", "fullName personalEmail")
        .populate("assignedChannel", "name link")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Resource.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        batchId: batch._id,
        excelFileName: batch.excelFileName,
        totalResources: batch.resources.length,
        filteredTotal: total,
        resources,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
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

/**
 * ✅ MỚI: Lấy batches của user hiện tại
 */
const getMyBatches = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { assignedUser: userId };
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [batches, total] = await Promise.all([
      ResourceBatch.find(filter)
        .populate("resources", "email status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ResourceBatch.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getMyBatches:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy batches của user",
      error: error.message,
    });
  }
};

/**
 * ✅ MỚI: Lấy thống kê batches
 */
const getBatchStats = async (req, res) => {
  try {
    const { assignedUser } = req.query;

    // Build filter
    const filter = {};
    if (assignedUser) filter.assignedUser = assignedUser;

    const stats = await ResourceBatch.aggregate([
      { $match: filter },
      {
        $facet: {
          statusBreakdown: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          totalResources: [{ $unwind: "$resources" }, { $count: "total" }],
          recentBatches: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "assignedUser",
                foreignField: "_id",
                as: "assignedUserData",
              },
            },
            { $unwind: "$assignedUserData" },
            {
              $project: {
                excelFileName: 1,
                createdAt: 1,
                resourceCount: { $size: "$resources" },
                assignedUserName: "$assignedUserData.fullName",
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];

    res.status(200).json({
      success: true,
      data: {
        totalBatches: result.statusBreakdown.reduce(
          (sum, item) => sum + item.count,
          0
        ),
        totalResources: result.totalResources[0]?.total || 0,
        statusBreakdown: result.statusBreakdown,
        recentBatches: result.recentBatches,
      },
    });
  } catch (error) {
    console.error("Error in getBatchStats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê batch",
      error: error.message,
    });
  }
};

const assignUserToBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, force = false } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID batch hoặc userId không hợp lệ",
      });
    }

    const batch = await ResourceBatch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy batch",
      });
    }

    const user = await db.User.findById(userId);
    if (!user || user.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "User không tồn tại hoặc không active",
      });
    }

    if (!force) {
      const assignedResources = await Resource.find({
        _id: { $in: batch.resources },
        assignedUser: { $ne: null },
      });

      if (assignedResources.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Một số resources đã được assigned. Sử dụng force=true để overwrite.",
        });
      }
    }

    // ✅ Update batch
    batch.assignedUser = userId;
    batch.status = "ACTIVE";
    await batch.save();

    // ✅ Bulk update resources
    await Resource.updateMany(
      { _id: { $in: batch.resources } },
      {
        $set: {
          assignedUser: userId,
          status: "ASSIGNED",
        },
      }
    );

    const updatedBatch = await ResourceBatch.findById(id)
      .populate("resources", "email status assignedUser assignedChannel")
      .populate("assignedUser", "fullName personalEmail");

    res.status(200).json({
      success: true,
      message: "Assign user cho batch thành công",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error in assignUserToBatch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi assign user cho batch",
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
  getMyBatches,
  getBatchStats,
  assignUserToBatch,
};
