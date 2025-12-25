# Sử dụng cùng phiên bản Node với máy bạn để đồng bộ
FROM node:22.12-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy các file cấu hình thư viện trước để tối ưu cache
COPY package*.json ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code backend vào container
COPY . .

# Expose cổng 9999 (Cổng backend)
EXPOSE 9999

# Lệnh khởi chạy backend
CMD ["npm", "start"]