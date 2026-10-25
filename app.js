
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const ceritaRoutes = require("./routes/ceritaRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Route cerita Wattpad
app.use("/cerita", ceritaRoutes);

// Endpoint tidak ditemukan
app.use((req, res, next) => {
  const err = new Error("Endpoint tidak ditemukan");
  err.statusCode = 404;
  next(err);
});

// Error handler harus paling akhir
app.use(errorHandler);

// Koneksi MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Terhubung ke MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(
        `Server berjalan di http://localhost:${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error("Gagal terhubung:", err.message);
  });
