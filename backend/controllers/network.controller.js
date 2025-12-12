const mongoose = require("mongoose");
const db = require("../models");
const Network = db.Network;
const Channel = db.Channel;
const User = db.User;
const XLSX = require("xlsx");

// Tạo Network mới
const createNew = async (req, res, next) => {
  try {
    const {
      assignedUser,
      reminderDate,
      reminderNote,
      profileAdsenseId,
      emailAddress,
      recoveryEmail,
      creationDate,
      taxName,
      location,
      mainChannel,
      linkedChannelUrl,
      emailChannel,
      channelJoinDate,
      country,
      status,
      note,
    } = req.body;

    // Validate required fields
    if (!assignedUser || !profileAdsenseId || !emailAddress || !creationDate) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc (assignedUser, profileAdsenseId, emailAddress, creationDate)!",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(assignedUser);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên!",
      });
    }

    // Kiểm tra profileAdsenseId đã tồn tại chưa
    const existingNetwork = await Network.findOne({ profileAdsenseId });
    if (existingNetwork) {
      return res.status(400).json({
        success: false,
        message: "Profile AdSense ID này đã tồn tại!",
      });
    }

    // Kiểm tra mainChannel nếu có
    if (mainChannel) {
      const channel = await Channel.findById(mainChannel);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy kênh chính!",
        });
      }
    }

    const newNetwork = await Network.create({
      assignedUser,
      reminderDate: reminderDate || null,
      reminderNote: reminderNote || "",
      profileAdsenseId,
      emailAddress,
      recoveryEmail: recoveryEmail || "",
      creationDate,
      taxName: taxName || "",
      location: location || "OFFICE",
      mainChannel: mainChannel || null,
      linkedChannelUrl: linkedChannelUrl || "",
      emailChannel: emailChannel || "",
      channelJoinDate: channelJoinDate || null,
      country: country || "VN",
      status: status || "ACTIVE",
      note: note || "",
    });

    const populatedNetwork = await Network.findById(newNetwork._id)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("mainChannel", "name link")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo network thành công!",
      data: populatedNetwork,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả Networks
const getAll = async (req, res, next) => {
  try {
    const { status, assignedUser, country, location } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (assignedUser) filter.assignedUser = assignedUser;
    if (country) filter.country = country;
    if (location) filter.location = location;

    const networks = await Network.find(filter)
      .populate("assignedUser", "fullName personalEmail role team")
      .populate("mainChannel", "name link status")
      .sort({ createdAt: -1 })
      .lean();

    // Đếm số kênh thuộc mỗi network
    const networksWithCount = await Promise.all(
      networks.map(async (network) => {
        const channelCount = await Channel.countDocuments({
          network: network._id,
        });

        return {
          ...network,
          channelCount,
        };
      })
    );

    res.json({
      success: true,
      count: networksWithCount.length,
      data: networksWithCount,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin Network theo ID
const getById = async (req, res, next) => {
  try {
    const networkId = req.params.id;

    const network = await Network.findById(networkId)
      .populate("assignedUser", "fullName personalEmail role team")
      .populate("mainChannel", "name link status")
      .lean();

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels thuộc network này
    const channels = await Channel.find({ network: networkId })
      .populate("assignedUser", "fullName personalEmail")
      .lean();

    res.json({
      success: true,
      data: {
        ...network,
        channels,
        channelCount: channels.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin Network
const updateNetwork = async (req, res, next) => {
  try {
    const networkId = req.params.id;
    const updateData = req.body;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Kiểm tra profileAdsenseId nếu thay đổi
    if (
      updateData.profileAdsenseId &&
      updateData.profileAdsenseId !== network.profileAdsenseId
    ) {
      const existingNetwork = await Network.findOne({
        profileAdsenseId: updateData.profileAdsenseId,
        _id: { $ne: networkId },
      });

      if (existingNetwork) {
        return res.status(400).json({
          success: false,
          message: "Profile AdSense ID này đã được sử dụng!",
        });
      }
    }

    // Kiểm tra user nếu thay đổi
    if (updateData.assignedUser) {
      const user = await User.findById(updateData.assignedUser);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân viên!",
        });
      }
    }

    // Kiểm tra mainChannel nếu thay đổi
    if (updateData.mainChannel) {
      const channel = await Channel.findById(updateData.mainChannel);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy kênh chính!",
        });
      }

      // Đánh dấu channel là main channel
      channel.isMainChannel = true;
      channel.network = networkId;
      await channel.save();

      // Bỏ đánh dấu channel cũ
      if (
        network.mainChannel &&
        network.mainChannel.toString() !== updateData.mainChannel
      ) {
        await Channel.updateOne(
          { _id: network.mainChannel },
          { isMainChannel: false }
        );
      }
    }

    // Cập nhật các field
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        network[key] = updateData[key];
      }
    });

    await network.save();

    const updatedNetwork = await Network.findById(networkId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("mainChannel", "name link")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật network thành công!",
      data: updatedNetwork,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa Network
const deleteNetwork = async (req, res, next) => {
  try {
    const networkId = req.params.id;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Kiểm tra xem có kênh nào đang thuộc network này không
    const channelCount = await Channel.countDocuments({ network: networkId });
    if (channelCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa network vì còn ${channelCount} kênh đang thuộc network này!`,
      });
    }

    await Network.findByIdAndDelete(networkId);

    res.json({
      success: true,
      message: "Xóa network thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Gán kênh vào Network
const assignChannel = async (req, res, next) => {
  try {
    const networkId = req.params.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu channelId!",
      });
    }

    const [network, channel] = await Promise.all([
      Network.findById(networkId),
      Channel.findById(channelId),
    ]);

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Gán network cho channel
    channel.network = networkId;
    await channel.save();

    res.json({
      success: true,
      message: "Gán kênh vào network thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Gỡ kênh khỏi Network
const removeChannel = async (req, res, next) => {
  try {
    const networkId = req.params.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu channelId!",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Không cho phép gỡ kênh chính
    if (channel.isMainChannel) {
      return res.status(400).json({
        success: false,
        message: "Không thể gỡ kênh chính khỏi network!",
      });
    }

    channel.network = null;
    await channel.save();

    res.json({
      success: true,
      message: "Gỡ kênh khỏi network thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Thống kê Network
const getNetworkStats = async (req, res, next) => {
  try {
    const networkId = req.params.id;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels
    const channels = await Channel.find({ network: networkId });

    // Đếm theo status
    const statusStats = channels.reduce((acc, ch) => {
      acc[ch.status] = (acc[ch.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        networkId: network._id,
        profileAdsenseId: network.profileAdsenseId,
        emailAddress: network.emailAddress,
        totalChannels: channels.length,
        statusBreakdown: statusStats,
        assignedUser: network.assignedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Import networks từ Excel
const importNetworkExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng upload file Excel!" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "File Excel không có dữ liệu!" });
    }

    const session = await Network.startSession();
    session.startTransaction();

    const results = { success: [], errors: [], total: data.length };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validate required fields
        if (!row.profileAdsenseId || !row.emailAddress || !row.creationDate) {
          results.errors.push({
            row: rowNumber,
            error: "Thiếu thông tin bắt buộc",
            data: row,
          });
          continue;
        }

        // Kiểm tra profileAdsenseId đã tồn tại
        const exist = await Network.findOne({
          profileAdsenseId: row.profileAdsenseId,
        }).session(session);

        if (exist) {
          results.errors.push({
            row: rowNumber,
            error: `Profile AdSense ID ${row.profileAdsenseId} đã tồn tại`,
            data: row,
          });
          continue;
        }

        // Tìm user theo email
        let userId = null;
        if (row.employmentEmail) {
          const user = await User.findOne({
            personalEmail: row.employmentEmail.trim().toLowerCase(),
          }).session(session);

          if (!user) {
            results.errors.push({
              row: rowNumber,
              error: `Không tìm thấy nhân viên với email ${row.employmentEmail}`,
              data: row,
            });
            continue;
          }
          userId = user._id;
        }

        if (!userId) {
          results.errors.push({
            row: rowNumber,
            error: "Thiếu thông tin nhân viên",
            data: row,
          });
          continue;
        }

        const newNetwork = await Network.create(
          [
            {
              assignedUser: userId,
              reminderDate: row.reminder ? new Date(row.reminder) : null,
              profileAdsenseId: row.profileAdsenseId,
              emailAddress: row.emailAddress.trim().toLowerCase(),
              recoveryEmail: row.recoveryEmail
                ? row.recoveryEmail.trim().toLowerCase()
                : "",
              creationDate: new Date(row.creationDate),
              taxName: row.taxName || "",
              location: row.location?.toUpperCase() || "OFFICE",
              linkedChannelUrl: row.linkedChannel || "",
              emailChannel: row.emailChannel
                ? row.emailChannel.trim().toLowerCase()
                : "",
              channelJoinDate: row.joinDate ? new Date(row.joinDate) : null,
              country: row.country || "VN",
              status: "ACTIVE",
            },
          ],
          { session }
        );

        results.success.push({
          row: rowNumber,
          networkId: newNetwork[0]._id,
          profileAdsenseId: newNetwork[0].profileAdsenseId,
          emailAddress: newNetwork[0].emailAddress,
        });
      } catch (err) {
        results.errors.push({ row: rowNumber, error: err.message, data: row });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: `Import hoàn tất: ${results.success.length}/${results.total} thành công`,
      data: results,
    });
  } catch (err) {
    return next(err);
  }
};

// Export networks ra Excel
const exportNetworkExcel = async (req, res, next) => {
  try {
    const { status, assignedUser, country } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (assignedUser) filter.assignedUser = assignedUser;
    if (country) filter.country = country;

    const networks = await Network.find(filter)
      .populate("assignedUser", "fullName personalEmail")
      .populate("mainChannel", "name link")
      .sort({ createdAt: -1 })
      .lean();

    const excelData = networks.map((network, index) => ({
      STT: index + 1,
      "Nhân viên": network.assignedUser?.fullName || "",
      "Email nhân viên": network.assignedUser?.personalEmail || "",
      "Profile AdSense ID": network.profileAdsenseId,
      "Email Address": network.emailAddress,
      "Recovery Email": network.recoveryEmail,
      "Ngày tạo Email": network.creationDate
        ? new Date(network.creationDate).toLocaleDateString("vi-VN")
        : "",
      "Tax Name": network.taxName,
      "Vị trí": network.location,
      "Linked Channel": network.linkedChannelUrl,
      "Email Channel": network.emailChannel,
      "Join Date": network.channelJoinDate
        ? new Date(network.channelJoinDate).toLocaleDateString("vi-VN")
        : "",
      "Quốc gia": network.country,
      "Trạng thái": network.status,
      "Nhắc nhở": network.reminderDate
        ? new Date(network.reminderDate).toLocaleDateString("vi-VN")
        : "",
      "Ghi chú": network.note,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Networks");

    const columnWidths = [
      { wch: 5 }, // STT
      { wch: 25 }, // Nhân viên
      { wch: 30 }, // Email nhân viên
      { wch: 20 }, // Profile AdSense ID
      { wch: 30 }, // Email Address
      { wch: 30 }, // Recovery Email
      { wch: 15 }, // Ngày tạo Email
      { wch: 25 }, // Tax Name
      { wch: 15 }, // Vị trí
      { wch: 50 }, // Linked Channel
      { wch: 30 }, // Email Channel
      { wch: 15 }, // Join Date
      { wch: 10 }, // Quốc gia
      { wch: 15 }, // Trạng thái
      { wch: 15 }, // Nhắc nhở
      { wch: 30 }, // Ghi chú
    ];
    worksheet["!cols"] = columnWidths;

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `networks_${new Date().toISOString().split("T")[0]}.xlsx`;
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

// Export template Excel
const exportNetworkTemplate = async (req, res, next) => {
  try {
    const templateData = [
      {
        employmentEmail: "nguyenvana@gmail.com",
        reminder: "2025-12-31",
        profileAdsenseId: "pub-1234567890123456",
        emailAddress: "adsense@gmail.com",
        recoveryEmail: "recovery@gmail.com",
        creationDate: "2024-01-01",
        taxName: "NGUYEN VAN A",
        location: "OFFICE",
        linkedChannel: "https://youtube.com/@channelname",
        emailChannel: "channel@gmail.com",
        joinDate: "2024-01-15",
        country: "VN",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    const instructionData = [
      {
        Cột: "employmentEmail",
        "Mô tả": "Email nhân viên (phải tồn tại trong hệ thống)",
        "Bắt buộc": "Có",
      },
      {
        Cột: "reminder",
        "Mô tả": "Ngày nhắc nhở (YYYY-MM-DD)",
        "Bắt buộc": "Không",
      },
      {
        Cột: "profileAdsenseId",
        "Mô tả": "Mã Profile AdSense (duy nhất)",
        "Bắt buộc": "Có",
      },
      {
        Cột: "emailAddress",
        "Mô tả": "Email của Profile AdSense",
        "Bắt buộc": "Có",
      },
      {
        Cột: "recoveryEmail",
        "Mô tả": "Email khôi phục",
        "Bắt buộc": "Không",
      },
      {
        Cột: "creationDate",
        "Mô tả": "Ngày tạo email (YYYY-MM-DD)",
        "Bắt buộc": "Có",
      },
      {
        Cột: "taxName",
        "Mô tả": "Tên thuế",
        "Bắt buộc": "Không",
      },
      {
        Cột: "location",
        "Mô tả": "HOME / OFFICE / OTHER",
        "Bắt buộc": "Không",
      },
      {
        Cột: "linkedChannel",
        "Mô tả": "URL kênh YouTube",
        "Bắt buộc": "Không",
      },
      {
        Cột: "emailChannel",
        "Mô tả": "Email brand account của kênh",
        "Bắt buộc": "Không",
      },
      {
        Cột: "joinDate",
        "Mô tả": "Ngày tạo kênh (YYYY-MM-DD)",
        "Bắt buộc": "Không",
      },
      {
        Cột: "country",
        "Mô tả": "Mã quốc gia (VN, US, UK...)",
        "Bắt buộc": "Không",
      },
    ];

    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "Hướng dẫn");

    worksheet["!cols"] = [
      { wch: 30 }, // employmentEmail
      { wch: 15 }, // reminder
      { wch: 25 }, // profileAdsenseId
      { wch: 30 }, // emailAddress
      { wch: 30 }, // recoveryEmail
      { wch: 15 }, // creationDate
      { wch: 25 }, // taxName
      { wch: 15 }, // location
      { wch: 50 }, // linkedChannel
      { wch: 30 }, // emailChannel
      { wch: 15 }, // joinDate
      { wch: 10 }, // country
    ];

    instructionSheet["!cols"] = [{ wch: 20 }, { wch: 50 }, { wch: 15 }];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="network_import_template.xlsx"'
    );

    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getById,
  updateNetwork,
  deleteNetwork,
  assignChannel,
  removeChannel,
  getNetworkStats,
  importNetworkExcel,
  exportNetworkExcel,
  exportNetworkTemplate,
};
