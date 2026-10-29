require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ceritaRoutes = require("./routes/ceritaRoutes");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (req, res) => {res.json({ message: "Cerita RESTful API aktif", endpoints: ["/cerita"] });});
app.use("/cerita", ceritaRoutes);
app.use((req, res, next) => {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404));
});
app.use(errorHandler);
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI belum diatur. Salin .env.example menjadi .env lalu isi koneksi MongoDB.");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Terhubung ke MongoDB");
    app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
  } catch (error) {
    console.error("Gagal menjalankan server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) startServer();
module.exports = app;
