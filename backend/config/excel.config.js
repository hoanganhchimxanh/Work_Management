const bcrypt = require("bcrypt");
const generator = require("generate-password");

// Cấu hình cho từng entity
const excelConfigs = {
  // ==================== USER CONFIG ====================
  user: {
    modelName: "User",
    sheetName: "Users",
    fileName: "users",

    // ============== IMPORT ==============
    columns: [
      {
        excelKey: "fullName",
        dbField: "fullName",
        displayName: "Họ và tên",
        required: true,
        width: 25,
      },
      {
        excelKey: "phoneNumber",
        dbField: "phoneNumber",
        displayName: "Số điện thoại",
        required: true,
        width: 20,
        validate: (value) => {
          // Validate phone number format (basic)
          return value && value.toString().trim().length > 0;
        },
        transform: (value) => value.toString().trim(),
      },
      {
        excelKey: "facebookLink",
        dbField: "facebookLink",
        displayName: "Facebook Link",
        required: false,
        width: 40,
        transform: (value) => value?.trim() || null,
      },
      {
        excelKey: "bankName",
        dbField: "bankInfo.bankName",
        displayName: "Tên ngân hàng",
        required: false,
        width: 25,
        transform: (value) => value?.trim() || null,
      },
      {
        excelKey: "accountNumber",
        dbField: "bankInfo.accountNumber",
        displayName: "Số tài khoản",
        required: false,
        width: 20,
        transform: (value) => value?.toString().trim() || null,
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
        excelKey: "status",
        dbField: "status",
        displayName: "Trạng thái",
        required: false,
        width: 15,
        validate: (value) => {
          const validStatuses = ["PENDING", "ACTIVE", "QUIT"];
          return !value || validStatuses.includes(value.toUpperCase());
        },
        transform: (value) => value?.toUpperCase() || "ACTIVE",
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
      {
        excelKey: "joinDate",
        dbField: "joinDate",
        displayName: "Ngày vào làm",
        required: false,
        width: 15,
        transform: (value) => {
          if (!value) return null;
          // Handle Excel date format
          if (typeof value === "number") {
            // Excel serial date
            const date = new Date((value - 25569) * 86400 * 1000);
            return date;
          }
          return new Date(value);
        },
      },
      {
        excelKey: "responsibilities",
        dbField: "responsibilities",
        displayName: "Nhiệm vụ/Mảng",
        required: false,
        width: 30,
        transform: (value) => value?.trim() || null,
      },
      {
        excelKey: "note",
        dbField: "note",
        displayName: "Ghi chú",
        required: false,
        width: 40,
        transform: (value) => value?.trim() || null,
      },
      {
        excelKey: "loginEmail",
        dbField: "loginEmail",
        displayName: "Email đăng nhập",
        required: false,
        width: 30,
        validate: (value) => {
          if (!value) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        transform: (value) => value?.trim().toLowerCase() || null,
      },
    ],

    // ============== EXPORT ==============
    exportColumns: [
      { key: "stt", displayName: "STT", width: 5 },
      { key: "fullName", displayName: "Họ và tên", width: 25 },
      { key: "phoneNumber", displayName: "Số điện thoại", width: 20 },
      { key: "facebookLink", displayName: "Facebook Link", width: 40 },
      { key: "bankName", displayName: "Tên ngân hàng", width: 25 },
      { key: "accountNumber", displayName: "Số tài khoản", width: 20 },
      { key: "loginEmail", displayName: "Email đăng nhập", width: 30 },
      { key: "role", displayName: "Vai trò", width: 12 },
      { key: "status", displayName: "Trạng thái", width: 12 },
      { key: "teamName", displayName: "Team", width: 20 },
      { key: "accountIsActive", displayName: "TK hoạt động", width: 12 },
      { key: "isFirstLogin", displayName: "Lần đầu đăng nhập", width: 15 },
      { key: "joinDate", displayName: "Ngày vào làm", width: 15 },
      { key: "responsibilities", displayName: "Nhiệm vụ/Mảng", width: 30 },
      { key: "note", displayName: "Ghi chú", width: 40 },
      { key: "createdAt", displayName: "Ngày tạo", width: 15 },
    ],

    // ============== TEMPLATE ==============
    templateData: [
      {
        fullName: "Nguyễn Văn A",
        phoneNumber: "0123456789",
        facebookLink: "https://facebook.com/nguyenvana",
        bankName: "Vietcombank",
        accountNumber: "1234567890",
        role: "EMPLOYEE",
        status: "ACTIVE",
        teamName: "Team Marketing",
        joinDate: "2024-01-15",
        responsibilities: "Quản lý kênh YouTube",
        note: "Nhân viên mới",
        loginEmail: "nguyenvana@company.com",
      },
      {
        fullName: "Trần Thị B",
        phoneNumber: "0987654321",
        facebookLink: "",
        bankName: "Techcombank",
        accountNumber: "9876543210",
        role: "EMPLOYEE",
        status: "ACTIVE",
        teamName: "Team Content",
        joinDate: "2024-02-01",
        responsibilities: "Sáng tạo nội dung",
        note: "",
        loginEmail: "tranthib@company.com",
      },
    ],

    // ============== INSTRUCTIONS ==============
    instructions: [
      {
        column: "fullName",
        description: "Họ và tên đầy đủ",
        required: "Có",
      },
      {
        column: "phoneNumber",
        description: "Số điện thoại (duy nhất)",
        required: "Có",
      },
      {
        column: "facebookLink",
        description: "Link Facebook cá nhân",
        required: "Không",
      },
      {
        column: "bankName",
        description: "Tên ngân hàng",
        required: "Không",
      },
      {
        column: "accountNumber",
        description: "Số tài khoản ngân hàng",
        required: "Không",
      },
      {
        column: "role",
        description: "ADMIN / ACCOUNTANT / EMPLOYEE (mặc định EMPLOYEE)",
        required: "Không",
      },
      {
        column: "status",
        description: "PENDING / ACTIVE / QUIT (mặc định ACTIVE)",
        required: "Không",
      },
      {
        column: "teamName",
        description: "Tên team trong hệ thống (phải tồn tại)",
        required: "Không",
      },
      {
        column: "joinDate",
        description: "Ngày vào làm (YYYY-MM-DD)",
        required: "Không",
      },
      {
        column: "responsibilities",
        description: "Nhiệm vụ hoặc mảng công việc",
        required: "Không",
      },
      {
        column: "note",
        description: "Ghi chú bổ sung",
        required: "Không",
      },
      {
        column: "loginEmail",
        description:
          "Email đăng nhập hệ thống (sẽ được tạo tự động nếu để trống)",
        required: "Không",
      },
    ],

    // ============== HOOKS ==============
    afterImport: async (record, session, models) => {
      // Tạo account cho user
      let loginEmail = record.loginEmail;

      // Nếu không có loginEmail trong Excel, tạo tự động
      if (!loginEmail) {
        loginEmail = `${record.phoneNumber}@company.com`;
      }

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
            isActive: true, // Đổi thành true để user có thể login ngay
          },
        ],
        { session },
      );

      return { loginEmail, tempPassword };
    },

    prepareExportData: async (records, models) => {
      const results = await Promise.all(
        records.map(async (user, index) => {
          const account = await models.Account.findOne({
            user: user._id,
          }).lean();

          return {
            stt: index + 1,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            facebookLink: user.facebookLink || "",
            bankName: user.bankInfo?.bankName || "",
            accountNumber: user.bankInfo?.accountNumber || "",
            loginEmail: account?.email || "",
            role: user.role,
            status: user.status,
            teamName: user.team?.name || "",
            accountIsActive: account?.isActive ? "Có" : "Không",
            isFirstLogin: user.isFirstLogin ? "Có" : "Không",
            joinDate: user.joinDate
              ? new Date(user.joinDate).toLocaleDateString("vi-VN")
              : "",
            responsibilities: user.responsibilities || "",
            note: user.note || "",
            createdAt: new Date(user.createdAt).toLocaleDateString("vi-VN"),
          };
        }),
      );
      return results;
    },

    // ============== DEFAULTS ==============
    defaults: {
      status: "ACTIVE",
      isFirstLogin: true,
      role: "EMPLOYEE",
      bankInfo: {
        bankName: null,
        accountNumber: null,
      },
    },

    // ============== BEFORE CREATE ==============
    beforeCreate: (data) => {
      // Xử lý bankInfo - nếu có bankName hoặc accountNumber thì tạo object
      if (data["bankInfo.bankName"] || data["bankInfo.accountNumber"]) {
        data.bankInfo = {
          bankName: data["bankInfo.bankName"] || null,
          accountNumber: data["bankInfo.accountNumber"] || null,
        };
        delete data["bankInfo.bankName"];
        delete data["bankInfo.accountNumber"];
      }

      // Lưu loginEmail tạm để dùng trong afterImport
      if (data.loginEmail) {
        // Store it temporarily, will be used in afterImport
        data._tempLoginEmail = data.loginEmail;
        delete data.loginEmail; // Remove from user data
      }

      return data;
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
        referenceField: "phoneNumber",
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
        referenceField: "phoneNumber",
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
        Boolean,
      );

      if (userIds.length > 0) {
        await models.User.updateMany(
          { _id: { $in: userIds } },
          { team: record._id },
          { session },
        );
      }
    },

    prepareExportData: async (records) => {
      return records.map((team, index) => ({
        stt: index + 1,
        name: team.name,
        status: team.status,
        leaderName: team.leader?.fullName || "",
        leaderEmail: team.leader?.phoneNumber || "",
        memberCount: team.members?.length || 0,
        memberNames: team.members?.map((m) => m.fullName).join(", ") || "",
        memberEmails: team.members?.map((m) => m.phoneNumber).join(", ") || "",
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
      // Hỗ trợ cả 2 format: Google Workspace export và template tự tạo
      {
        excelKey: "Email Address [Required]", // Google Workspace format
        altExcelKey: "email", // Template format
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
        excelKey: "Password [Required]", // Google Workspace format
        altExcelKey: "password", // Template format
        dbField: "defaultPassword",
        displayName: "Password",
        required: true,
        width: 20,
        transform: async (value) => {
          return await bcrypt.hash(value, 10);
        },
      },
      {
        excelKey: "Recovery Email", // Google Workspace format
        altExcelKey: "recoveryEmail", // Template format
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
        referenceField: "phoneNumber",
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
        assignedUserEmail: resource.assignedUser?.phoneNumber || "",
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

    // EXPORT - Chỉ giữ lại phần export
    exportColumns: [
      { key: "stt", displayName: "STT", width: 5 },
      { key: "pubId", displayName: "PUB-ID", width: 25 },
      { key: "employmentName", displayName: "Nhân viên phụ trách", width: 30 },
      { key: "profileAdsenseId", displayName: "Profile AdSense ID", width: 25 },
      { key: "adSenseLocation", displayName: "Địa chỉ AdSense", width: 40 },
      { key: "emailAddress", displayName: "Email Address", width: 30 },
      { key: "recoveryEmail", displayName: "Recovery Email", width: 30 },
      { key: "twoFA", displayName: "2FA", width: 10 },
      { key: "creationDate", displayName: "Ngày tạo Profile", width: 15 },
      { key: "taxForm", displayName: "Tax Form", width: 20 },
      { key: "location", displayName: "Vị trí", width: 15 },
      { key: "linkedChannelUrl", displayName: "Linked Channel", width: 50 },
      { key: "status", displayName: "Trạng thái", width: 15 },
      { key: "note", displayName: "Ghi chú", width: 30 },
      { key: "reminderDate", displayName: "Ngày nhắc nhở", width: 15 },
      { key: "channelCount", displayName: "Số kênh", width: 10 },
    ],

    prepareExportData: async (records) => {
      return records.map((network, index) => ({
        stt: index + 1,
        pubId: network.pubId || "",
        employmentName: network.employment?.fullName || "",
        profileAdsenseId: network.profileAdsenseId,
        adSenseLocation: network.adSenseLocation || "",
        emailAddress: network.emailAddress || "",
        recoveryEmail: network.recoveryEmail || "",
        twoFA: network.twoFA ? "Yes" : "No",
        creationDate: network.creationDate
          ? new Date(network.creationDate).toLocaleDateString("vi-VN")
          : "",
        taxForm: network.taxForm || "",
        location: network.location || "",
        linkedChannelUrl: network.linkedChannelUrl || "",
        status: network.status || "",
        note: network.note || "",
        reminderDate: network.reminderDate
          ? new Date(network.reminderDate).toLocaleDateString("vi-VN")
          : "",
        channelCount: network.channelCount || 0,
      }));
    },
  },
};

module.exports = excelConfigs;
