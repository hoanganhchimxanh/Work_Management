const { google } = require("googleapis");
const { YoutubeAuth, ChannelAnalytics } = require("../models");

class YouTubeService {
  async syncChannelAnalytics(channelId) {
    // 1. Lấy auth token
    const auth = await YoutubeAuth.findOne({
      channel: channelId,
      status: "ACTIVE",
    });

    if (!auth) throw new Error("Channel not authorized");

    // 2. Refresh token nếu cần
    const oauth2Client = new google.auth.OAuth2(/* ... */);
    oauth2Client.setCredentials({
      access_token: auth.accessToken,
      refresh_token: auth.refreshToken,
    });

    // 3. Call YouTube Reporting API
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const youtubeReporting = google.youtubereporting({
      version: "v1",
      auth: oauth2Client,
    });

    // 4. Lấy và lưu data
    // ... implementation

    // 5. Update lastSyncedAt
    auth.lastSyncedAt = new Date();
    await auth.save();
  }
}

module.exports = new YouTubeService();
