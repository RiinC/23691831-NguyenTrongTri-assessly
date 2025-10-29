# Sử dụng image chính thức của Node.js
FROM node:18-slim

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép file package* 
COPY package*.json ./

# Cài đặt dependencies (bao gồm devDependencies để chạy test bên trong image)
RUN npm ci --include=dev

# Sao chép toàn bộ mã nguồn
COPY . .

# Expose port của service 
EXPOSE 3001

# Lệnh chạy ứng dụng
CMD ["node", "index.js"]