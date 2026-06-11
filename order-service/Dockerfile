# Menggunakan image Node.js versi ringan
FROM node:20-alpine

# Menentukan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menyalin file package.json dan menginstal dependency
COPY package*.json ./
RUN npm install

# Menyalin seluruh kodingan ke dalam container
COPY . .

# Menjalankan aplikasi
CMD ["node", "index.js"]