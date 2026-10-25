
const mongoose = require("mongoose");

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
    enum: [
      "Romance",
      "Fantasy",
      "Horror",
      "Mystery",
      "Action",
      "Comedy",
      "Drama"
    ]
  },

  sinopsis: {
    type: String,
    required: [true, "Sinopsis wajib diisi"],
    trim: true
  },

  status: {
    type: String,
    enum: ["ongoing", "completed"],
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

module.exports = mongoose.model("Cerita", ceritaSchema);
