# YouTube Integration Testing Guide - Postman

Hướng dẫn test đầy đủ flow tích hợp YouTube Analytics từ A-Z trên Postman.

---

## 📋 Chuẩn Bị

### 1. Yêu Cầu Hệ Thống

- Node.js (v14+)
- MongoDB đang chạy
- Google Cloud Project với YouTube Data API v3 và YouTube Analytics API đã enable
- OAuth 2.0 credentials (Client ID, Client Secret, Redirect URI)

### 2. Setup Environment trong Postman

Tạo Environment mới tên `YouTube Management - Local` với các biến:

```
BASE_URL = http://localhost:9999/api/v1
FRONTEND_URL = http://localhost:3000

# Sẽ được set tự động sau khi login
ADMIN_TOKEN =
EMPLOYEE_TOKEN =
ADMIN_USER_ID =
EMPLOYEE_USER_ID =

# Sẽ được set tự động sau khi tạo
CHANNEL_ID =
NETWORK_ID =
MAIN_CHANNEL_ID =
```

### 3. Khởi Động Server

```bash
# Clone và install dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cấu hình .env
MONGODB_URI=mongodb://localhost:27017/youtube-management
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:9999/api/v1/youtube-auth/callback
FRONTEND_URL=http://localhost:3000

# Chạy server
npm start
# Server running at http://localhost:9999
```

### 4. Seed Dữ Liệu Admin (Nếu chưa có)

Chạy script để tạo admin account:

```bash
npm run seed:admin
```

Hoặc tạo thủ công qua MongoDB:

```javascript
// Admin User
{
  fullName: "Admin User",
  personalEmail: "admin@example.com",
  role: "ADMIN",
  status: "ACTIVE",
  isFirstLogin: false
}

// Admin Account
{
  email: "admin@company.com",
  password: "$2b$10$...", // bcrypt hash của "admin123"
  user: ObjectId("admin_user_id"),
  isActive: true
}
```

---

## 🔐 BƯỚC 1: XÁC THỰC (AUTHENTICATION)

### 1.1. Login Admin

**Request:**

```
POST {{BASE_URL}}/accounts/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response Thành Công (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "accountId": "507f1f77bcf86cd799439011",
    "email": "admin@company.com",
    "isActive": true,
    "user": {
      "userId": "507f1f77bcf86cd799439012",
      "fullName": "Admin User",
      "role": "ADMIN",
      "personalEmail": "admin@example.com",
      "isFirstLogin": false,
      "status": "ACTIVE"
    }
  }
}
```

**Action (trong Tests tab của Postman):**

```javascript
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  pm.environment.set("ADMIN_TOKEN", jsonData.token);
  pm.environment.set("ADMIN_USER_ID", jsonData.data.user.userId);
  console.log("✅ Admin login successful");
}
```

**Possible Errors:**

- `404`: Email không tồn tại
- `401`: Sai mật khẩu
- `403`: Tài khoản bị vô hiệu hóa

---

## 👥 BƯỚC 2: TẠO EMPLOYEE

### 2.1. Tạo Employee Mới (by Admin)

**Request:**

```
POST {{BASE_URL}}/users/create-by-admin
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "fullName": "Nguyen Van A",
  "personalEmail": "nguyenvana@gmail.com",
  "role": "EMPLOYEE",
  "team": null
}
```

**Response Thành Công (201):**

```json
{
  "success": true,
  "message": "Tạo nhân viên thành công!",
  "data": {
    "user": {
      "_id": "67890abcd1234567890",
      "fullName": "Nguyen Van A",
      "personalEmail": "nguyenvana@gmail.com",
      "role": "EMPLOYEE",
      "status": "ACTIVE",
      "team": null,
      "isFirstLogin": true,
      "createdAt": "2024-12-09T10:00:00.000Z"
    },
    "account": {
      "email": "nguyenvana@company.com"
    }
  }
}
```

**Auto-generated:**

- Login email: `{personalEmail_username}@company.com`
- Temporary password: Gửi qua email `personalEmail` (random 10 chars)
- Account status: `isActive: false` (phải đổi password lần đầu)

**Action:**

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("EMPLOYEE_USER_ID", jsonData.data.user._id);
  console.log("✅ Employee created:", jsonData.data.account.email);
}
```

### 2.2. Employee Đổi Password Lần Đầu

**⚠️ Quan trọng:** Employee phải đổi password trước khi sử dụng hệ thống

**Request:**

```
PUT {{BASE_URL}}/accounts/change-password/:accountId
Authorization: Bearer {{EMPLOYEE_TOKEN}}
Content-Type: application/json

{
  "newPassword": "NewSecurePass123!"
}
```

**Response:**

```json
{
  "message": "Đổi mật khẩu thành công!"
}
```

**Side effects:**

- `account.isActive` → `true`
- `user.isFirstLogin` → `false`

### 2.3. Login Employee

**Request:**

```
POST {{BASE_URL}}/accounts/login
Content-Type: application/json

{
  "email": "nguyenvana@company.com",
  "password": "NewSecurePass123!"
}
```

**Action:**

```javascript
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  pm.environment.set("EMPLOYEE_TOKEN", jsonData.token);
  console.log("✅ Employee login successful");
}
```

---

## 📺 BƯỚC 3: TẠO CHANNELS

### 3.1. Tạo Main Channel cho Network

**⚠️ Lưu ý:** Network bắt buộc phải có `mainChannel` trước khi tạo

**Request:**

```
POST {{BASE_URL}}/channels/add-new
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "name": "Main Network Channel",
  "link": "https://youtube.com/@mainnetwork",
  "owner": "{{ADMIN_USER_ID}}",
  "status": "ACTIVE",
  "subscriber": 50000,
  "isMainChannel": true,
  "isBrandAccount": true
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Thêm kênh thành công!",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Main Network Channel",
    "link": "https://youtube.com/@mainnetwork",
    "owner": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Admin User",
      "personalEmail": "admin@example.com"
    },
    "network": null,
    "status": "ACTIVE",
    "subscriber": 50000,
    "bktEnabled": false,
    "isMainChannel": true,
    "isBrandAccount": true,
    "createdAt": "2024-12-09T10:05:00.000Z"
  }
}
```

**Action:**

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("MAIN_CHANNEL_ID", jsonData.data._id);
  console.log("✅ Main channel created");
}
```

### 3.2. Tạo Channel Thường cho Employee

**Request:**

```
POST {{BASE_URL}}/channels/add-new
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "name": "Tech Review Channel",
  "link": "https://youtube.com/@techreview",
  "owner": "{{EMPLOYEE_USER_ID}}",
  "status": "ACTIVE",
  "subscriber": 1500,
  "bktEnabled": false
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Thêm kênh thành công!",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Tech Review Channel",
    "link": "https://youtube.com/@techreview",
    "owner": {
      "_id": "67890abcd1234567890",
      "fullName": "Nguyen Van A",
      "personalEmail": "nguyenvana@gmail.com"
    },
    "network": null,
    "status": "ACTIVE",
    "subscriber": 1500,
    "bktEnabled": false,
    "isMainChannel": false,
    "isBrandAccount": false
  }
}
```

**Action:**

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("CHANNEL_ID", jsonData.data._id);
  console.log("✅ Tech channel created");
}
```

### 3.3. Verify Channels

**Request:**

```
GET {{BASE_URL}}/channels/get-all
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Main Network Channel",
      "owner": {...},
      "network": null,
      "isMainChannel": true
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Tech Review Channel",
      "owner": {...},
      "network": null,
      "isMainChannel": false
    }
  ]
}
```

---

## 🌐 BƯỚC 4: TẠO NETWORK VÀ GÁN CHANNELS

### 4.1. Tạo Network

**Request:**

```
POST {{BASE_URL}}/networks/create-new
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "name": "Tech Network A",
  "mainChannel": "{{MAIN_CHANNEL_ID}}",
  "primaryAccountEmail": "networkprimary@gmail.com",
  "status": "ACTIVE",
  "note": "Network chính của công ty"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Tạo network thành công!",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Tech Network A",
    "primaryAccountEmail": "networkprimary@gmail.com",
    "status": "ACTIVE",
    "note": "Network chính của công ty",
    "mainChannel": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Main Network Channel",
      "link": "https://youtube.com/@mainnetwork"
    },
    "createdAt": "2024-12-09T10:10:00.000Z"
  }
}
```

**Side effects:**

- `mainChannel.isMainChannel` → `true`
- `mainChannel.network` → `network._id`

**Action:**

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("NETWORK_ID", jsonData.data._id);
  console.log("✅ Network created");
}
```

### 4.2. Gán Channel vào Network

**Request:**

```
POST {{BASE_URL}}/networks/assign-channel/{{NETWORK_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "channelId": "{{CHANNEL_ID}}"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Gán kênh vào network thành công!"
}
```

**Side effects:**

- `channel.network` → `network._id`

### 4.3. Verify Network với Channels

**Request:**

```
GET {{BASE_URL}}/networks/get-by-id/{{NETWORK_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Tech Network A",
    "status": "ACTIVE",
    "primaryAccountEmail": "networkprimary@gmail.com",
    "mainChannel": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Main Network Channel",
      "status": "ACTIVE",
      "subscriber": 50000
    },
    "channels": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Main Network Channel",
        "owner": {...},
        "isMainChannel": true
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Tech Review Channel",
        "owner": {...},
        "isMainChannel": false
      }
    ],
    "channelCount": 2
  }
}
```

### 4.4. Network Statistics

**Request:**

```
GET {{BASE_URL}}/networks/stats/{{NETWORK_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "networkId": "507f1f77bcf86cd799439015",
    "networkName": "Tech Network A",
    "totalChannels": 2,
    "totalSubscribers": 51500,
    "bktEnabledChannels": 0,
    "statusBreakdown": {
      "ACTIVE": 2,
      "HIDDEN": 0,
      "LOCKED": 0,
      "STRIKED": 0
    }
  }
}
```

---

## 👨‍💼 BƯỚC 5: QUẢN LÝ CHANNEL MANAGERS (Optional)

### 5.1. Thêm Primary Owner

**Request:**

```
POST {{BASE_URL}}/channel-managers/add-manager/{{CHANNEL_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "managerEmail": "primaryowner@gmail.com",
  "role": "PRIMARY_OWNER",
  "managerPassword": "optional_password_here",
  "note": "Chủ sở hữu chính của kênh"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Thêm tài khoản quản lý thành công!",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "channel": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Tech Review Channel",
      "link": "https://youtube.com/@techreview"
    },
    "managerEmail": "primaryowner@gmail.com",
    "role": "PRIMARY_OWNER",
    "status": "ACTIVE",
    "note": "Chủ sở hữu chính của kênh",
    "createdAt": "2024-12-09T10:15:00.000Z"
  }
}
```

**⚠️ Lưu ý về Security:**

- Password được lưu dạng plain text (không recommended)
- Nên implement encryption hoặc không lưu password

### 5.2. Thêm Manager/Owner

**Request:**

```
POST {{BASE_URL}}/channel-managers/add-manager/{{CHANNEL_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "managerEmail": "manager1@gmail.com",
  "role": "MANAGER",
  "note": "Quản lý hỗ trợ"
}
```

### 5.3. Xem Tất Cả Managers

**Request:**

```
GET {{BASE_URL}}/channel-managers/get-managers/{{CHANNEL_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "channel": "507f1f77bcf86cd799439013",
      "managerEmail": "primaryowner@gmail.com",
      "role": "PRIMARY_OWNER",
      "status": "ACTIVE",
      "note": "Chủ sở hữu chính của kênh"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "managerEmail": "manager1@gmail.com",
      "role": "MANAGER",
      "status": "ACTIVE"
    }
  ]
}
```

### 5.4. Thu Hồi Quyền Manager

**Request:**

```
PATCH {{BASE_URL}}/channel-managers/revoke/:managerId
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "message": "Thu hồi quyền thành công!"
}
```

**Side effects:**

- `manager.status` → `"REVOKED"`

---

## 🔗 BƯỚC 6: KẾT NỐI YOUTUBE OAUTH

**⚠️ QUAN TRỌNG:**

- Phải sử dụng **EMPLOYEE_TOKEN** (không phải ADMIN_TOKEN)
- Employee chỉ có thể authorize channel mà mình là owner
- Browser phải login đúng Google account có quyền quản lý YouTube channel

### 6.1. Employee Lấy OAuth URL

**Request:**

```
GET {{BASE_URL}}/youtube-auth/get-auth-url?channelId={{CHANNEL_ID}}
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Response (200):**

```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyt-analytics.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyt-analytics-monetary.readonly&state=eyJjaGFubmVsSWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTMiLCJ1c2VySWQiOiI2Nzg5MGFiY2QxMjM0NTY3ODkwIn0%3D&redirect_uri=http%3A%2F%2Flocalhost%3A9999%2Fapi%2Fv1%2Fyoutube-auth%2Fcallback&response_type=code&client_id=your_client_id&prompt=consent"
}
```

**OAuth Scopes được yêu cầu:**

1. `youtube.readonly` - Đọc thông tin channel
2. `yt-analytics.readonly` - Đọc analytics data
3. `yt-analytics-monetary.readonly` - Đọc revenue data

**Possible Errors:**

- `400`: Thiếu channelId
- `403`: User không phải owner của channel
- `404`: Channel không tồn tại

### 6.2. Authorize trên Google (Manual Step)

**Hướng dẫn chi tiết:**

1. **Copy authUrl** từ response trên
2. **Paste vào browser** (Chrome/Firefox recommended)
3. **Select Google Account** - Chọn account có quyền quản lý YouTube channel
4. **Review Permissions:**
   ```
   YouTube Management System wants to:
   - View your YouTube account
   - View YouTube Analytics reports
   - View monetary and non-monetary YouTube Analytics reports
   ```
5. **Click "Allow"** để cấp quyền
6. **Redirect flow:**

   ```
   Google OAuth → Backend Callback → Frontend Dashboard

   Redirect URLs:
   ✓ https://accounts.google.com (OAuth)
   ✓ http://localhost:9999/api/v1/youtube-auth/callback (Backend)
   ✓ http://localhost:3000/dashboard/channels?auth=success (Frontend)
   ```

**Backend xử lý tự động:**

- Exchange authorization code → access token & refresh token
- Lấy thông tin YouTube channel từ API
- Lưu tokens vào database (YoutubeAuth collection)
- Redirect về frontend với success/error status

### 6.3. Kiểm Tra Authorization Status

**Request:**

```
GET {{BASE_URL}}/youtube-auth/check-status/{{CHANNEL_ID}}
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Response (Authorized):**

```json
{
  "success": true,
  "data": {
    "isAuthorized": true,
    "status": "ACTIVE",
    "expiresAt": "2024-12-10T10:20:00.000Z",
    "lastSyncedAt": null
  }
}
```

**Response (Not Authorized):**

```json
{
  "success": true,
  "data": {
    "isAuthorized": false
  }
}
```

**Response (Expired):**

```json
{
  "success": true,
  "data": {
    "isAuthorized": false,
    "status": "EXPIRED",
    "expiresAt": "2024-12-08T10:20:00.000Z"
  }
}
```

### 6.4. Xem Channels Đã Authorize của Mình

**Request:**

```
GET {{BASE_URL}}/youtube-auth/my-channels
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "channelId": "507f1f77bcf86cd799439013",
      "channelName": "Tech Review Channel",
      "channelLink": "https://youtube.com/@techreview",
      "subscriber": 1500,
      "status": "ACTIVE",
      "youtubeChannelId": "UCxxxxxxxxxxxxxxxx",
      "isAuthorized": true,
      "expiresAt": "2024-12-10T10:20:00.000Z",
      "lastSyncedAt": null
    }
  ]
}
```

### 6.5. [ADMIN] Xem Tất Cả Channels Đã Authorize

**Request:**

```
GET {{BASE_URL}}/youtube-auth/all-channels
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "userId": "67890abcd1234567890",
      "userName": "Nguyen Van A",
      "userEmail": "nguyenvana@gmail.com",
      "channelId": "507f1f77bcf86cd799439013",
      "channelName": "Tech Review Channel",
      "channelLink": "https://youtube.com/@techreview",
      "subscriber": 1500,
      "status": "ACTIVE",
      "youtubeChannelId": "UCxxxxxxxxxxxxxxxx",
      "expiresAt": "2024-12-10T10:20:00.000Z",
      "lastSyncedAt": null
    }
  ]
}
```

---

## 📊 BƯỚC 7: SYNC YOUTUBE ANALYTICS DATA

**⚠️ Prerequisites:**

- Channel đã được authorize (Bước 6)
- Token chưa expired (auto refresh nếu có refresh token)
- Date range không quá 180 ngày (YouTube API limit)

### 7.1. Sync Analytics cho 1 Channel

**Request:**

```
POST {{BASE_URL}}/youtube-analytics/sync/{{CHANNEL_ID}}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Query Parameters:**

- `startDate`: **Required** - Format: YYYY-MM-DD
- `endDate`: **Required** - Format: YYYY-MM-DD
- Max range: 180 days

**⏱️ Processing Time:** 10-30 giây (tùy số ngày)

**Response (200):**

```json
{
  "success": true,
  "message": "Đã sync 31 bản ghi analytics!",
  "data": {
    "recordCount": 31,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }
}
```

**What Happens:**

1. Check authorization status
2. Refresh token if expired
3. Call YouTube Analytics API với metrics:
   - `views` - Lượt xem
   - `estimatedRevenue` - Doanh thu ước tính
   - `estimatedMinutesWatched` - Phút xem
   - `subscribersGained` - Subscriber tăng
   - `subscribersLost` - Subscriber giảm
   - `likes` - Lượt thích
   - `comments` - Bình luận
   - `shares` - Chia sẻ
4. Upsert data vào database (update nếu đã có, create nếu chưa)
5. Update `lastSyncedAt` timestamp

**Possible Errors:**

- `400`: Thiếu startDate/endDate
- `401`: Channel chưa authorize
- `403`: User không phải owner
- `500`: YouTube API error (quota, permissions, etc.)

### 7.2. Lấy Analytics từ Database

**Request:**

```
GET {{BASE_URL}}/youtube-analytics/get-analytics/{{CHANNEL_ID}}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "analytics": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "channel": "507f1f77bcf86cd799439013",
        "date": "2024-01-01T00:00:00.000Z",
        "views": 1250,
        "estimatedRevenue": 45.75,
        "watchTime": 5600,
        "subscribers": 1500,
        "metrics": {},
        "syncedAt": "2024-12-09T10:25:00.000Z",
        "createdAt": "2024-12-09T10:25:00.000Z"
      },
      {
        "date": "2024-01-02T00:00:00.000Z",
        "views": 1180,
        "estimatedRevenue": 42.3,
        "watchTime": 5200
      }
      // ... 29 records nữa
    ],
    "totals": {
      "totalViews": 38500,
      "totalRevenue": 1420.25,
      "totalWatchTime": 172800,
      "totalSubsGained": 0,
      "totalSubsLost": 0,
      "totalLikes": 0,
      "totalComments": 0,
      "totalShares": 0
    },
    "recordCount": 31
  }
}
```

**Permission Check:**

- Employee: Chỉ xem channel của mình
- Admin/Accountant: Xem tất cả channels

### 7.3. [ADMIN] Sync Tất Cả Channels

**⚠️ Resource Intensive:** Tốn thời gian và YouTube API quota

**Request:**

```
POST {{BASE_URL}}/youtube-analytics/sync-all?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {{ADMIN_TOKEN}}
```

**⏱️ Processing Time:** 30 giây - 5 phút (tùy số channel)

**Response (200):**

```json
{
  "success": true,
  "message": "Đã sync 3 channels!",
  "data": {
    "successful": [
      {
        "channelId": "507f1f77bcf86cd799439013",
        "channelName": "Tech Review Channel",
        "recordCount": 31,
        "success": true
      },
      {
        "channelId": "507f1f77bcf86cd799439014",
        "channelName": "Main Network Channel",
        "recordCount": 31,
        "success": true
      }
    ],
    "failed": [
      {
        "channelId": "507f1f77bcf86cd799439015",
        "channelName": "Gaming Channel",
        "error": "Token expired and refresh failed"
      }
    ],
    "totalChannels": 3
  }
}
```

**Best Practices:**

- Chạy lúc off-peak hours
- Monitor YouTube API quota
- Setup cron job để sync tự động hàng ngày

### 7.4. [ADMIN/ACCOUNTANT] Xem Analytics Tất Cả Channels

**Request:**

```
GET {{BASE_URL}}/youtube-analytics/get-all-analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "channelId": "507f1f77bcf86cd799439013",
        "channelName": "Tech Review Channel",
        "channelOwner": "Nguyen Van A",
        "network": "Tech Network A",
        "totalViews": 38500,
        "totalRevenue": 1420.25,
        "totalWatchTime": 172800,
        "totalSubsGained": 465,
        "totalSubsLost": 92,
        "totalLikes": 2610,
        "totalComments": 689,
        "totalShares": 356,
        "recordCount": 31
      },
      {
        "channelId": "507f1f77bcf86cd799439014",
        "channelName": "Main Network Channel",
        "channelOwner": "Admin User",
        "network": "Tech Network A",
        "totalViews": 125000,
        "totalRevenue": 4850.5,
        "totalWatchTime": 520000,
        "recordCount": 31
      }
    ],
    "grandTotals": {
      "totalViews": 163500,
      "totalRevenue": 6270.75,
      "totalWatchTime": 692800,
      "totalSubsGained": 1250,
      "totalSubsLost": 185,
      "totalLikes": 8750,
      "totalComments": 2340,
      "totalShares": 1120
    },
    "channelCount": 2
  }
}
```

**Use Cases:**

- Dashboard tổng quan
- Báo cáo doanh thu
- So sánh performance các channel
- Export data cho kế toán

---

## 🔄 BƯỚC 8: QUẢN LÝ AUTHORIZATION

### 8.1. Thu Hồi Quyền Truy Cập

**Khi nào cần revoke:**

- Employee nghỉ việc
- Đổi channel owner
- Security concerns
- Re-authorize với permissions mới

**Request:**

```
DELETE {{BASE_URL}}/youtube-auth/revoke/{{CHANNEL_ID}}
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Thu hồi quyền truy cập thành công!"
}
```

**What Happens:**

1. Revoke token trên Google (best effort)
2. Update status → `"REVOKED"`
3. Cannot sync analytics anymore
4. Cần authorize lại để sử dụng

### 8.2. Re-authorize Channel

**Sau khi revoke, để authorize lại:**

1. Gọi lại `/youtube-auth/get-auth-url`
2. Thực hiện OAuth flow
3. New tokens sẽ ghi đè tokens cũ

---

## ✅ BƯỚC 9: VERIFICATION & TESTING

### 9.1. Verify Complete Setup

**Checklist:**

```
✓ Admin logged in
✓ Employee created & logged in
✓ Main Channel created
✓ Tech Channel created
✓ Network created with mainChannel
✓ Tech Channel assigned to Network
✓ Channel Managers added (optional)
✓ Tech Channel authorized via OAuth
✓ Analytics synced successfully
✓ Data visible in database
```

### 9.2. Test Analytics Data Quality

**Request:**

```
GET {{BASE_URL}}/youtube-analytics/get-analytics/{{CHANNEL_ID}}?startDate=2024-01-01&endDate=2024-01-01
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

**Verify:**

- `views` > 0
- `estimatedRevenue` có giá trị hợp lý
- `watchTime` tương ứng với views
- `syncedAt` là thời gian gần đây

### 9.3. Test Permissions

**Test Employee không xem được channel khác:**

```
GET {{BASE_URL}}/youtube-analytics/get-analytics/{{OTHER_CHANNEL_ID}}
Authorization: Bearer {{EMPLOYEE_TOKEN}}

Expected: 403 Forbidden
```

**Test Admin xem được tất cả:**

```
GET {{BASE_URL}}/youtube-analytics/get-all-analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {{ADMIN_TOKEN}}

Expected: 200 OK with all channels
```

### 9.4. Monitor System Health

**Check Channel Status:**

```
GET {{BASE_URL}}/channels/get-by-id/{{CHANNEL_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Check Network Stats:**

```
GET {{BASE_URL}}/networks/stats/{{NETWORK_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Check Authorization Status:**

```
GET {{BASE_URL}}/youtube-auth/check-status/{{CHANNEL_ID}}
Authorization: Bearer {{EMPLOYEE_TOKEN}}
```

---

## 🐛 TROUBLESHOOTING

### Error 1: "Channel chưa được authorize!"

**Symptoms:**

```json
{
  "success": false,
  "message": "Channel chưa được authorize!"
}
```

**Solutions:**

1. ✅ Kiểm tra authorization status
2. ✅ Thực hiện OAuth flow (Bước 6)
3. ✅ Verify Google account có quyền quản lý channel

### Error 2: "Token expired"

**Symptoms:**

```json
{
  "error": "invalid_grant",
  "error_description": "Token has been expired or revoked."
}
```

**Solutions:**

1. **Auto refresh:** Backend tự động refresh nếu có refresh token
2. **Manual refresh:** Re-authorize nếu refresh token cũng hết hạn
3. **Prevention:** Đảm bảo `prompt: consent` trong OAuth URL

### Error 3: "Insufficient permissions"

**Symptoms:**

```json
{
  "error": {
    "code": 403,
    "message": "Insufficient Permission"
  }
}
```

**Solutions:**

1. ✅ Verify OAuth scopes đầy đủ (youtube.readonly, yt-analytics.readonly, yt-analytics-monetary.readonly)
2. ✅ Re-authorize với `prompt: consent`
3. ✅ Check Google account có quyền "View YouTube Analytics reports"

### Error 4: "Không tìm thấy kênh!"

**Symptoms:**

```json
{
  "success": false,
  "message": "Không tìm thấy kênh!"
}
```

**Solutions:**

1. ✅ Verify `CHANNEL_ID` trong environment
2. ✅ Check channel tồn tại: `GET /channels/get-by-id/{{CHANNEL_ID}}`
3. ✅ Check channel chưa bị xóa

### Error 5: "Bạn không có quyền xem analytics của kênh này!"

**Symptoms:**

```json
{
  "success": false,
  "message": "Bạn không có quyền xem analytics của kênh này!"
}
```

**Solutions:**

1. ✅ Employee chỉ xem channel của mình (owner)
2. ✅ Admin/Accountant xem tất cả
3. ✅ Verify `channel.owner` === `userId` trong token

### Error 6: "Daily quota exceeded"

**Symptoms:**

```json
{
  "error": {
    "code": 403,
    "message": "The request cannot be completed because you have exceeded your quota."
  }
}
```

**Solutions:**

1. ✅ Check Google Cloud Console → APIs & Services → YouTube Data API v3 → Quotas
2. ✅ Default quota: 10,000 units/day
3. ✅ Reduce sync frequency
4. ✅ Request quota increase nếu cần

### Error 7: "Invalid date range"

**Symptoms:**

```json
{
  "success": false,
  "message": "Thiếu startDate hoặc endDate!"
}
```

**Solutions:**

1. ✅ Format: YYYY-MM-DD
2. ✅ endDate >= startDate
3. ✅ Max range: 180 days
4. ✅ startDate không quá xa trong quá khứ (YouTube limit: ~2 years)

---

## 📦 POSTMAN COLLECTION STRUCTURE

Đề xuất cấu trúc folder:

```
📁 YouTube Management System
│
├── 📁 00. Setup
│   └── GET Health Check
│
├── 📁 01. Authentication
│   ├── POST Login Admin
│   ├── POST Login Employee
│   ├── PUT Change Password
│   └── PUT Auto Reset Password
│
├── 📁 02. User Management
│   ├── POST Register by User
│   ├── POST Create by Admin
│   ├── POST Approve User
│   ├── DELETE Reject User
│   ├── GET All Users
│   ├── GET User by ID
│   ├── PUT Update User
│   └── DELETE Delete User
│
├── 📁 03. Team Management
│   ├── POST Create Team
│   ├── GET All Teams
│   ├── GET Team by ID
│   ├── PUT Edit Team
│   └── DELETE Delete Team
│
├── 📁 04. Channel Management
│   ├── POST Create Channel
│   ├── POST Create Main Channel
│   ├── GET All Channels
│   ├── GET Channel by ID
│   ├── GET Channels by Owner
│   ├── GET Channels by Network
│   ├── PUT Edit Channel
│   ├── PUT Assign Owner
│   └── DELETE Delete Channel
│
├── 📁 05. Network Management
│   ├── POST Create Network
│   ├── GET All Networks
│   ├── GET Network by ID
│   ├── GET Network Stats
│   ├── POST Assign Channel to Network
│   ├── POST Remove Channel from Network
│   ├── PUT Update Network
│   └── DELETE Delete Network
│
├── 📁 06. Channel Managers
│   ├── POST Add Manager
│   ├── GET Managers by Channel
│   ├── GET Manager by ID
│   ├── GET Manager Stats
│   ├── PUT Update Manager
│   ├── PATCH Revoke Manager
│   └── DELETE Delete Manager
│
├── 📁 07. YouTube OAuth
│   ├── GET Get Auth URL
│   ├── GET Check Auth Status
│   ├── GET My Authorized Channels
│   ├── DELETE Revoke Auth
│   └── [ADMIN] GET All Authorized Channels
│
├── 📁 08. YouTube Analytics
│   ├── POST Sync Channel Analytics
│   ├── GET Get Channel Analytics
│   ├── [ADMIN] POST Sync All Channels
│   └── [ADMIN] GET Get All Analytics
│
├── 📁 09. Task Management
│   ├── POST Create Task
│   ├── GET All Tasks
│   ├── GET Task by ID
│   ├── GET My Tasks
│   ├── GET Team Tasks
│   ├── GET Task Stats
│   ├── PUT Update Task
│   ├── PATCH Update Task Status
│   └── DELETE Delete Task
│
└── 📁 10. KPI Management
    ├── POST Create KPI
    ├── GET All KPIs
    ├── GET KPI by ID
    ├── GET My KPIs
    ├── GET Team KPIs
    ├── PUT Update KPI
    └── DELETE Delete KPI
```

---

## 🎯 COMPLETE TEST FLOW SUMMARY

### Quick Start (15 phút):

1. ✅ **Authentication** (2 phút)

   - Login Admin → Save `ADMIN_TOKEN`
   - Create Employee → Save `EMPLOYEE_USER_ID`
   - Employee change password
   - Login Employee → Save `EMPLOYEE_TOKEN`

2. ✅ **Setup Channels** (2 phút)

   - Create Main Channel → Save `MAIN_CHANNEL_ID`
   - Create Tech Channel → Save `CHANNEL_ID`

3. ✅ **Setup Network** (1 phút)

   - Create Network with mainChannel → Save `NETWORK_ID`
   - Assign Tech Channel to Network

4. ✅ **YouTube Integration** (5 phút)

   - Get OAuth URL (Employee)
   - Authorize in Browser
   - Check Auth Status

5. ✅ **Sync Data** (3 phút)

   - Sync Analytics (30 days)
   - Get Analytics Data
   - Verify totals

6. ✅ **Verification** (2 phút)
   - Check Channel info
   - Check Network stats
   - Test permissions

### Full Test (30-45 phút):

- Thêm tất cả endpoints trong collection
- Test edge cases & error scenarios
- Test với nhiều users/channels/networks
- Performance testing với sync-all

---

## 💡 PRO TIPS

### 1. Environment Management

**Tạo multiple environments:**

```
- Local Development
- Staging
- Production
```

**Environment variables template:**

```javascript
{
  "BASE_URL": "{{protocol}}://{{host}}:{{port}}/api/v1",
  "protocol": "http",
  "host": "localhost",
  "port": "9999",
  "ADMIN_TOKEN": "",
  "EMPLOYEE_TOKEN": "",
  // ... other vars
}
```

### 2. Auto-Save Response Data

**Collection Pre-request Script:**

```javascript
// Auto add Authorization header
const role = pm.variables.get("currentRole") || "ADMIN";
const token = pm.environment.get(`${role}_TOKEN`);

if (token) {
  pm.request.headers.add({
    key: "Authorization",
    value: `Bearer ${token}`,
  });
}
```

**Collection Tests Script:**

```javascript
// Auto save IDs from responses
if (pm.response.code === 200 || pm.response.code === 201) {
  const jsonData = pm.response.json();

  // Auto detect and save IDs
  if (jsonData.data && jsonData.data._id) {
    const endpoint = pm.request.url.path.join("/");

    if (endpoint.includes("channels")) {
      if (jsonData.data.isMainChannel) {
        pm.environment.set("MAIN_CHANNEL_ID", jsonData.data._id);
      } else {
        pm.environment.set("CHANNEL_ID", jsonData.data._id);
      }
    } else if (endpoint.includes("networks")) {
      pm.environment.set("NETWORK_ID", jsonData.data._id);
    } else if (endpoint.includes("users")) {
      pm.environment.set("EMPLOYEE_USER_ID", jsonData.data.user._id);
    }
  }

  // Auto save tokens
  if (jsonData.token) {
    const role = jsonData.data.user.role;
    pm.environment.set(`${role}_TOKEN`, jsonData.token);
    pm.environment.set(`${role}_USER_ID`, jsonData.data.user.userId);

    console.log(`✅ ${role} logged in`);
  }
}

// Log errors
if (pm.response.code >= 400) {
  const jsonData = pm.response.json();
  console.error(`❌ Error ${pm.response.code}:`, jsonData.message);
}
```

### 3. Newman CLI Testing

**Run collection via command line:**

```bash
# Install newman
npm install -g newman

# Run collection
newman run YouTube_Management.postman_collection.json \
  -e Local.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html

# Run with iterations (load testing)
newman run collection.json -e env.json -n 10 --delay-request 500
```

### 4. API Documentation

**Generate from Postman:**

1. Collection → View Documentation
2. Publish documentation
3. Share link với team

**Or use Swagger:**

- Export collection as OpenAPI 3.0
- Import vào Swagger Editor
- Host documentation

### 5. Monitoring & Alerts

**Postman Monitoring:**

1. Collection → Monitors → Create Monitor
2. Schedule: Hourly/Daily
3. Email alerts on failures
4. Track API uptime & performance

### 6. Data Cleanup

**Tạo cleanup requests:**

```
📁 99. Cleanup
├── DELETE All Test Channels
├── DELETE All Test Networks
├── DELETE All Test Users
└── DELETE All Test Data
```

**Cleanup script:**

```javascript
// Get all test channels
pm.sendRequest(
  {
    url: pm.environment.get("BASE_URL") + "/channels/get-all",
    method: "GET",
    header: {
      Authorization: `Bearer ${pm.environment.get("ADMIN_TOKEN")}`,
    },
  },
  (err, res) => {
    const channels = res.json().data;
    channels.forEach((channel) => {
      if (channel.name.includes("Test")) {
        // Delete test channel
        pm.sendRequest({
          url: `${pm.environment.get("BASE_URL")}/channels/delete/${
            channel._id
          }`,
          method: "DELETE",
          header: {
            Authorization: `Bearer ${pm.environment.get("ADMIN_TOKEN")}`,
          },
        });
      }
    });
  }
);
```

---

## 📊 PERFORMANCE BENCHMARKS

### Expected Response Times:

| Endpoint                        | Method | Expected Time |
| ------------------------------- | ------ | ------------- |
| Login                           | POST   | < 300ms       |
| Get All Channels                | GET    | < 500ms       |
| Create Channel                  | POST   | < 400ms       |
| Sync Analytics (30 days)        | POST   | 10-30s        |
| Get Analytics                   | GET    | < 800ms       |
| Sync All Channels (10 channels) | POST   | 1-3 min       |

### Rate Limits:

| API                   | Limit              | Reset |
| --------------------- | ------------------ | ----- |
| YouTube Data API v3   | 10,000 units/day   | Daily |
| YouTube Analytics API | 50,000 queries/day | Daily |
| Custom API            | No limit           | -     |

---

## 🔒 SECURITY CHECKLIST

- [ ] JWT tokens có expiration (7 days)
- [ ] Password được hash với bcrypt (10 rounds)
- [ ] OAuth tokens được mã hóa trong database
- [ ] HTTPS trong production
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention
- [ ] Environment variables for secrets

---

## 📝 ADDITIONAL RESOURCES

### Documentation:

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [YouTube Analytics API](https://developers.google.com/youtube/analytics)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Postman Learning Center](https://learning.postman.com/)

### Tools:

- [JWT Debugger](https://jwt.io/)
- [JSON Formatter](https://jsonformatter.org/)
- [Regex Tester](https://regex101.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

---

**🎉 Happy Testing!**

**Last Updated:** December 9, 2024  
**Version:** 2.0  
**Author:** YouTube Management System Team
