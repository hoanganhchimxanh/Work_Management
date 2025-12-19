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
        description: "Email các thành viên, phân cách bằng dấu phấy",
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
        excelKey: "type",
        dbField: "type",
        displayName: "Loại",
        required: false,
        width: 20,
        validate: (value) => {
          const validTypes = ["CHANNEL_CREATION", "CHANNEL_MANAGER", "BACKUP"];
          return !value || validTypes.includes(value.toUpperCase());
        },
        transform: (value) => value?.toUpperCase() || "CHANNEL_CREATION",
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
      { key: "type", displayName: "Loại", width: 20 },
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
        type: "CHANNEL_CREATION",
        assignedUserEmail: "nguyenvana@gmail.com",
        note: "Resource dùng để tạo kênh",
      },
      {
        email: "resource2@gmail.com",
        password: "YourPassword456",
        recoveryEmail: "recovery2@gmail.com",
        type: "CHANNEL_MANAGER",
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
        column: "type",
        description: "CHANNEL_CREATION / CHANNEL_MANAGER / BACKUP",
        required: "Không (mặc định CHANNEL_CREATION)",
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
        type: resource.type,
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
};

module.exports = excelConfigs;
