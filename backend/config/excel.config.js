const bcrypt = require("bcrypt");
const generator = require("generate-password");

// Cấu hình cho từng entity
const excelConfigs = {
  // ==================== USER CONFIG ====================
  user: {
    modelName: "User",
    sheetName: "Users",
    fileName: "users",

    // Định nghĩa các cột trong Excel
    columns: [
      {
        excelKey: "fullName",
        dbField: "fullName",
        displayName: "Họ và tên",
        required: true,
        width: 25,
      },
      {
        excelKey: "personalEmail",
        dbField: "personalEmail",
        displayName: "Email cá nhân",
        required: true,
        width: 30,
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => value.trim().toLowerCase(),
      },
      {
        excelKey: "role",
        dbField: "role",
        displayName: "Vai trò",
        required: false,
        width: 15,
        validate: (value) => {
          const validRoles = ["ADMIN", "ACCOUNTANT", "EMPLOYEE"];
          return !value || validRoles.includes(value.toUpperCase());
        },
        transform: (value) => value?.toUpperCase() || "EMPLOYEE",
      },
      {
        excelKey: "teamName",
        dbField: "team",
        displayName: "Team",
        required: false,
        width: 20,
        isReference: true,
        referenceModel: "Team",
        referenceField: "name",
        referenceKey: "_id",
      },
    ],

    // Export columns (có thể khác với import)
    exportColumns: [
      { key: "stt", displayName: "STT", width: 5 },
      { key: "fullName", displayName: "Họ và tên", width: 25 },
      { key: "personalEmail", displayName: "Email cá nhân", width: 30 },
      { key: "loginEmail", displayName: "Email đăng nhập", width: 30 },
      { key: "role", displayName: "Vai trò", width: 12 },
      { key: "status", displayName: "Trạng thái", width: 12 },
      { key: "teamName", displayName: "Team", width: 20 },
      { key: "accountIsActive", displayName: "Tài khoản hoạt động", width: 15 },
      { key: "isFirstLogin", displayName: "Lần đăng nhập đầu", width: 15 },
      { key: "joinedAt", displayName: "Ngày tham gia", width: 15 },
    ],

    // Template data mẫu
    templateData: [
      {
        fullName: "Nguyễn Văn A",
        personalEmail: "nguyenvana@gmail.com",
        role: "EMPLOYEE",
        teamName: "Team Marketing",
      },
      {
        fullName: "Trần Thị B",
        personalEmail: "tranthib@gmail.com",
        role: "EMPLOYEE",
        teamName: "Team Content",
      },
    ],

    // Hướng dẫn cho template
    instructions: [
      {
        column: "fullName",
        description: "Họ và tên đầy đủ",
        required: "Có",
      },
      {
        column: "personalEmail",
        description: "Email cá nhân (duy nhất)",
        required: "Có",
      },
      {
        column: "role",
        description: "ADMIN / ACCOUNTANT / EMPLOYEE",
        required: "Không (mặc định EMPLOYEE)",
      },
      {
        column: "teamName",
        description: "Tên team trong hệ thống",
        required: "Không",
      },
    ],

    // Xử lý sau khi import thành công
    afterImport: async (record, session, models) => {
      // Tạo account cho user
      const loginEmail = `${record.personalEmail.split("@")[0]}@company.com`;
      const tempPassword = generator.generate({
        length: 10,
        numbers: true,
        uppercase: true,
        lowercase: true,
        symbols: false,
        strict: true,
      });

      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await models.Account.create(
        [
          {
            email: loginEmail,
            password: hashedPassword,
            user: record._id,
            isActive: false,
          },
        ],
        { session }
      );

      return { loginEmail, tempPassword };
    },

    // Xử lý dữ liệu trước khi export
    prepareExportData: async (records, models) => {
      const results = await Promise.all(
        records.map(async (user, index) => {
          const account = await models.Account.findOne({
            user: user._id,
          }).lean();

          return {
            stt: index + 1,
            fullName: user.fullName,
            personalEmail: user.personalEmail,
            loginEmail: account?.email || "",
            role: user.role,
            status: user.status,
            teamName: user.team?.name || "",
            accountIsActive: account?.isActive ? "Có" : "Không",
            isFirstLogin: user.isFirstLogin ? "Có" : "Không",
            joinedAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
          };
        })
      );
      return results;
    },

    // Default values khi tạo record
    defaults: {
      status: "ACTIVE",
      isFirstLogin: true,
    },
  },

  // ==================== TEAM CONFIG ====================
  team: {
    modelName: "Team",
    sheetName: "Teams",
    fileName: "teams",

    columns: [
      {
        excelKey: "name",
        dbField: "name",
        displayName: "Tên team",
        required: true,
        width: 25,
      },
      {
        excelKey: "leaderEmail",
        dbField: "leader",
        displayName: "Email Leader",
        required: false,
        width: 30,
        isReference: true,
        referenceModel: "User",
        referenceField: "personalEmail",
        referenceKey: "_id",
      },
      {
        excelKey: "memberEmails",
        dbField: "members",
        displayName: "Email Members",
        required: false,
        width: 50,
        isArray: true,
        delimiter: ",",
        isReference: true,
        referenceModel: "User",
        referenceField: "personalEmail",
        referenceKey: "_id",
      },
      {
        excelKey: "status",
        dbField: "status",
        displayName: "Trạng thái",
        required: false,
        width: 15,
        validate: (value) => {
          const validStatuses = ["AVAILABLE", "UNAVAILABLE"];
          return !value || validStatuses.includes(value.toUpperCase());
        },
        transform: (value) => value?.toUpperCase() || "AVAILABLE",
      },
    ],

    exportColumns: [
      { key: "stt", displayName: "STT", width: 5 },
      { key: "name", displayName: "Tên Team", width: 25 },
      { key: "status", displayName: "Trạng thái", width: 15 },
      { key: "leaderName", displayName: "Leader", width: 25 },
      { key: "leaderEmail", displayName: "Email Leader", width: 30 },
      { key: "memberCount", displayName: "Số thành viên", width: 15 },
      { key: "memberNames", displayName: "Danh sách thành viên", width: 50 },
      { key: "memberEmails", displayName: "Email thành viên", width: 50 },
      { key: "createdAt", displayName: "Ngày tạo", width: 15 },
    ],

    templateData: [
      {
        name: "Team Marketing",
        leaderEmail: "nguyenvana@gmail.com",
        memberEmails: "tranthib@gmail.com,levanc@gmail.com",
        status: "AVAILABLE",
      },
      {
        name: "Team Content",
        leaderEmail: "phamthid@gmail.com",
        memberEmails: "hoangvane@gmail.com",
        status: "AVAILABLE",
      },
    ],

    instructions: [
      { column: "name", description: "Tên team", required: "Có" },
      {
        column: "leaderEmail",
        description: "Email của leader (phải tồn tại trong hệ thống)",
        required: "Không",
      },
      {
        column: "memberEmails",
        description: "Email các thành viên, phân cách bằng dấu phẩy",
        required: "Không",
      },
      {
        column: "status",
        description: "AVAILABLE / UNAVAILABLE (mặc định AVAILABLE)",
        required: "Không",
      },
    ],

    afterImport: async (record, session, models) => {
      // Gán team cho users
      const userIds = [record.leader, ...(record.members || [])].filter(
        Boolean
      );

      if (userIds.length > 0) {
        await models.User.updateMany(
          { _id: { $in: userIds } },
          { team: record._id },
          { session }
        );
      }
    },

    prepareExportData: async (records) => {
      return records.map((team, index) => ({
        stt: index + 1,
        name: team.name,
        status: team.status,
        leaderName: team.leader?.fullName || "",
        leaderEmail: team.leader?.personalEmail || "",
        memberCount: team.members?.length || 0,
        memberNames: team.members?.map((m) => m.fullName).join(", ") || "",
        memberEmails:
          team.members?.map((m) => m.personalEmail).join(", ") || "",
        createdAt: new Date(team.createdAt).toLocaleDateString("vi-VN"),
      }));
    },

    defaults: {
      status: "AVAILABLE",
      members: [],
    },
  },

  // ==================== RESOURCE CONFIG ====================
  resource: {
    modelName: "Resource",
    sheetName: "Resources",
    fileName: "resources",

    columns: [
      {
        excelKey: "email",
        dbField: "email",
        displayName: "Email",
        required: true,
        width: 35,
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => value.trim().toLowerCase(),
      },
      {
        excelKey: "password",
        dbField: "defaultPassword",
        displayName: "Password",
        required: true,
        width: 20,
        transform: async (value) => {
          return await bcrypt.hash(value, 10);
        },
      },
      {
        excelKey: "recoveryEmail",
        dbField: "recoveryEmail",
        displayName: "Recovery Email",
        required: true,
        width: 35,
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => value.trim().toLowerCase(),
      },
      {
        excelKey: "assignedUserEmail",
        dbField: "assignedUser",
        displayName: "User được gán",
        required: false,
        width: 35,
        isReference: true,
        referenceModel: "User",
        referenceField: "personalEmail",
        referenceKey: "_id",
      },
      {
        excelKey: "note",
        dbField: "note",
        displayName: "Ghi chú",
        required: false,
        width: 40,
      },
    ],

    exportColumns: [
      { key: "stt", displayName: "STT", width: 5 },
      { key: "email", displayName: "Email", width: 35 },
      { key: "recoveryEmail", displayName: "Recovery Email", width: 35 },
      { key: "status", displayName: "Trạng thái", width: 15 },
      { key: "assignedUserName", displayName: "User được gán", width: 25 },
      { key: "assignedUserEmail", displayName: "Email User", width: 35 },
      {
        key: "assignedChannelName",
        displayName: "Channel được gán",
        width: 30,
      },
      { key: "assignedChannelLink", displayName: "Link Channel", width: 50 },
      { key: "note", displayName: "Ghi chú", width: 40 },
      { key: "createdAt", displayName: "Ngày tạo", width: 15 },
    ],

    templateData: [
      {
        email: "resource1@gmail.com",
        password: "YourPassword123",
        recoveryEmail: "recovery1@gmail.com",
        assignedUserEmail: "nguyenvana@gmail.com",
        note: "Resource dùng để tạo kênh",
      },
      {
        email: "resource2@gmail.com",
        password: "YourPassword456",
        recoveryEmail: "recovery2@gmail.com",
        assignedUserEmail: "",
        note: "Resource quản lý kênh",
      },
    ],

    instructions: [
      {
        column: "email",
        description: "Email của resource (bắt buộc, duy nhất)",
        required: "Có",
      },
      {
        column: "password",
        description: "Mật khẩu của resource (bắt buộc)",
        required: "Có",
      },
      {
        column: "recoveryEmail",
        description: "Email khôi phục (bắt buộc)",
        required: "Có",
      },
      {
        column: "assignedUserEmail",
        description: "Email của user được gán (phải tồn tại trong hệ thống)",
        required: "Không",
      },
      {
        column: "note",
        description: "Ghi chú bổ sung",
        required: "Không",
      },
    ],

    prepareExportData: async (records) => {
      return records.map((resource, index) => ({
        stt: index + 1,
        email: resource.email,
        recoveryEmail: resource.recoveryEmail,
        status: resource.status,
        assignedUserName: resource.assignedUser?.fullName || "",
        assignedUserEmail: resource.assignedUser?.personalEmail || "",
        assignedChannelName: resource.assignedChannel?.name || "",
        assignedChannelLink: resource.assignedChannel?.link || "",
        note: resource.note || "",
        createdAt: new Date(resource.createdAt).toLocaleDateString("vi-VN"),
      }));
    },

    defaults: {
      status: "AVAILABLE",
      note: "",
    },

    // Custom logic để set status khi có assignedUser
    beforeCreate: (data) => {
      if (data.assignedUser) {
        data.status = "ASSIGNED";
      }
      return data;
    },
  },

  // ==================== NETWORK CONFIG ====================
  network: {
    modelName: "Network",
    sheetName: "Networks",
    fileName: "networks",

    columns: [
      {
        excelKey: "employmentEmail",
        dbField: "assignedUser",
        displayName: "Email nhân viên",
        required: true,
        width: 30,
        isReference: true,
        referenceModel: "User",
        referenceField: "personalEmail",
        referenceKey: "_id",
      },
      {
        excelKey: "reminder",
        dbField: "reminderDate",
        displayName: "Ngày nhắc nhở",
        required: false,
        width: 15,
        transform: (value) => (value ? new Date(value) : null),
      },
      {
        excelKey: "profileAdsenseId",
        dbField: "profileAdsenseId",
        displayName: "Profile AdSense ID",
        required: true,
        width: 25,
        transform: (value) => value.trim(),
      },
      {
        excelKey: "emailAddress",
        dbField: "emailAddress",
        displayName: "Email Address",
        required: true,
        width: 30,
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => value.trim().toLowerCase(),
      },
      {
        excelKey: "recoveryEmail",
        dbField: "recoveryEmail",
        displayName: "Recovery Email",
        required: false,
        width: 30,
        validate: (value) => {
          if (!value) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => (value ? value.trim().toLowerCase() : ""),
      },
      {
        excelKey: "creationDate",
        dbField: "creationDate",
        displayName: "Ngày tạo email",
        required: true,
        width: 15,
        transform: (value) => new Date(value),
      },
      {
        excelKey: "taxName",
        dbField: "taxName",
        displayName: "Tax Name",
        required: false,
        width: 25,
        transform: (value) => value || "",
      },
      {
        excelKey: "location",
        dbField: "location",
        displayName: "Vị trí",
        required: false,
        width: 15,
        validate: (value) => {
          const validLocations = ["HOME", "OFFICE", "OTHER"];
          return !value || validLocations.includes(value.toUpperCase());
        },
        transform: (value) => value?.toUpperCase() || "OFFICE",
      },
      {
        excelKey: "linkedChannel",
        dbField: "linkedChannelUrl",
        displayName: "Linked Channel",
        required: false,
        width: 50,
        transform: (value) => value || "",
      },
      {
        excelKey: "emailChannel",
        dbField: "emailChannel",
        displayName: "Email Channel",
        required: false,
        width: 30,
        validate: (value) => {
          if (!value) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => (value ? value.trim().toLowerCase() : ""),
      },
      {
        excelKey: "joinDate",
        dbField: "channelJoinDate",
        displayName: "Ngày tạo kênh",
        required: false,
        width: 15,
        transform: (value) => (value ? new Date(value) : null),
      },
      {
        excelKey: "country",
        dbField: "country",
        displayName: "Quốc gia",
        required: false,
        width: 10,
        transform: (value) => value || "VN",
      },
    ],

    exportColumns: [
      { key: "stt", displayName: "STT", width: 5 },
      { key: "assignedUserName", displayName: "Nhân viên", width: 25 },
      { key: "assignedUserEmail", displayName: "Email nhân viên", width: 30 },
      { key: "profileAdsenseId", displayName: "Profile AdSense ID", width: 20 },
      { key: "emailAddress", displayName: "Email Address", width: 30 },
      { key: "recoveryEmail", displayName: "Recovery Email", width: 30 },
      { key: "creationDate", displayName: "Ngày tạo Email", width: 15 },
      { key: "taxName", displayName: "Tax Name", width: 25 },
      { key: "location", displayName: "Vị trí", width: 15 },
      { key: "linkedChannelUrl", displayName: "Linked Channel", width: 50 },
      { key: "emailChannel", displayName: "Email Channel", width: 30 },
      { key: "channelJoinDate", displayName: "Join Date", width: 15 },
      { key: "country", displayName: "Quốc gia", width: 10 },
      { key: "status", displayName: "Trạng thái", width: 15 },
      { key: "reminderDate", displayName: "Nhắc nhở", width: 15 },
      { key: "note", displayName: "Ghi chú", width: 30 },
    ],

    templateData: [
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
    ],

    instructions: [
      {
        column: "employmentEmail",
        description: "Email nhân viên (phải tồn tại trong hệ thống)",
        required: "Có",
      },
      {
        column: "reminder",
        description: "Ngày nhắc nhở (YYYY-MM-DD)",
        required: "Không",
      },
      {
        column: "profileAdsenseId",
        description: "Mã Profile AdSense (duy nhất)",
        required: "Có",
      },
      {
        column: "emailAddress",
        description: "Email của Profile AdSense",
        required: "Có",
      },
      {
        column: "recoveryEmail",
        description: "Email khôi phục",
        required: "Không",
      },
      {
        column: "creationDate",
        description: "Ngày tạo email (YYYY-MM-DD)",
        required: "Có",
      },
      {
        column: "taxName",
        description: "Tên thuế",
        required: "Không",
      },
      {
        column: "location",
        description: "HOME / OFFICE / OTHER",
        required: "Không",
      },
      {
        column: "linkedChannel",
        description: "URL kênh YouTube",
        required: "Không",
      },
      {
        column: "emailChannel",
        description: "Email brand account của kênh",
        required: "Không",
      },
      {
        column: "joinDate",
        description: "Ngày tạo kênh (YYYY-MM-DD)",
        required: "Không",
      },
      {
        column: "country",
        description: "Mã quốc gia (VN, US, UK...)",
        required: "Không",
      },
    ],

    prepareExportData: async (records) => {
      return records.map((network, index) => ({
        stt: index + 1,
        assignedUserName: network.assignedUser?.fullName || "",
        assignedUserEmail: network.assignedUser?.personalEmail || "",
        profileAdsenseId: network.profileAdsenseId,
        emailAddress: network.emailAddress,
        recoveryEmail: network.recoveryEmail,
        creationDate: network.creationDate
          ? new Date(network.creationDate).toLocaleDateString("vi-VN")
          : "",
        taxName: network.taxName,
        location: network.location,
        linkedChannelUrl: network.linkedChannelUrl,
        emailChannel: network.emailChannel,
        channelJoinDate: network.channelJoinDate
          ? new Date(network.channelJoinDate).toLocaleDateString("vi-VN")
          : "",
        country: network.country,
        status: network.status,
        reminderDate: network.reminderDate
          ? new Date(network.reminderDate).toLocaleDateString("vi-VN")
          : "",
        note: network.note || "",
      }));
    },

    defaults: {
      status: "ACTIVE",
      note: "",
      location: "OFFICE",
      country: "VN",
    },
  },
};

module.exports = excelConfigs;
