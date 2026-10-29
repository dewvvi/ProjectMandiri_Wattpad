const mongoose = require("mongoose");

const GENRES = [
  "Romance",
  "Fantasy",
  "Horror",
  "Mystery",
  "Action",
  "Comedy",
  "Drama"
];
const STATUSES = ["ongoing", "completed"];

const ceritaSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: [true, "Judul cerita wajib diisi"],
    trim: true
  },
  penulis: {
    type: String,
    required: [true, "Nama penulis wajib diisi"],
    trim: true
  },
  genre: {
    type: String,
    required: [true, "Genre wajib diisi"],
    enum: {
      values: GENRES,
      message: `Genre harus salah satu dari: ${GENRES.join(", ")}`
    }
  },
  sinopsis: {
    type: String,
    required: [true, "Sinopsis wajib diisi"],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: STATUSES,
      message: "Status harus ongoing atau completed"
    },
    default: "ongoing"
  },
  jumlahBab: {
    type: Number,
    min: [0, "Jumlah bab tidak boleh negatif"],
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ceritaSchema.index({ createdAt: -1 });
ceritaSchema.index({ genre: 1, status: 1, createdAt: -1 });
ceritaSchema.index({ judul: 1 });
ceritaSchema.index({ penulis: 1 });
ceritaSchema.index({ jumlahBab: 1 });

const Cerita = mongoose.model("Cerita", ceritaSchema);
module.exports = Cerita;
module.exports.GENRES = GENRES;
module.exports.STATUSES = STATUSES;
