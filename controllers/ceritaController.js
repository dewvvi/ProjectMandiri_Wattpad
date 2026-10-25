
const mongoose = require("mongoose");
const Cerita = require("../models/ceritaModel");

// GET /cerita
// Filtering, pagination, sorting, projection
exports.getAll = async (req, res, next) => {
  try {
    const {
      judul,
      penulis,
      genre,
      status,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      order = "desc",
      fields
    } = req.query;

    // Validasi pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      const err = new Error(
        "Page dan limit harus berupa bilangan bulat positif"
      );
      err.statusCode = 400;
      throw err;
    }

    // Batas maksimal 100 data per halaman
    const safeLimit = Math.min(limitNumber, 100);

    // Filtering
    const filter = {};

    if (judul) {
      filter.judul = {
        $regex: judul,
        $options: "i"
      };
    }

    if (penulis) {
      filter.penulis = {
        $regex: penulis,
        $options: "i"
      };
    }

    if (genre) filter.genre = genre;
    if (status) filter.status = status;

    // Sorting
    const allowedSortFields = [
      "judul",
      "penulis",
      "genre",
      "jumlahBab",
      "createdAt"
    ];

    if (!allowedSortFields.includes(sortBy)) {
      const err = new Error("Field sorting tidak diizinkan");
      err.statusCode = 400;
      throw err;
    }

    if (!["asc", "desc"].includes(order)) {
      const err = new Error("Order harus asc atau desc");
      err.statusCode = 400;
      throw err;
    }

    const sort = {
      [sortBy]: order === "asc" ? 1 : -1
    };

    // Projection
    const allowedFields = [
      "judul",
      "penulis",
      "genre",
      "sinopsis",
      "status",
      "jumlahBab",
      "createdAt"
    ];

    let projection;

    if (fields) {
      const selectedFields = fields.split(",");

      if (
        selectedFields.some(
          field => !allowedFields.includes(field)
        )
      ) {
        const err = new Error(
          "Field projection tidak diizinkan"
        );
        err.statusCode = 400;
        throw err;
      }

      projection = selectedFields.join(" ");
    }

    // Pagination
    const skip = (pageNumber - 1) * safeLimit;

    const [data, total] = await Promise.all([
      Cerita.find(filter)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Cerita.countDocuments(filter)
    ]);

    res.json({
      success: true,
      pagination: {
        total,
        page: pageNumber,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit)
      },
      data
    });
  } catch (err) {
    next(err);
  }
};

// GET /cerita/:id
exports.getById = async (req, res, next) => {
  try {
    const data = await Cerita.findById(req.params.id);

    if (!data) {
      const err = new Error("Cerita tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

// POST /cerita
exports.create = async (req, res, next) => {
  try {
    const data = await Cerita.create(req.body);

    res.status(201).json({
      success: true,
      message: "Cerita berhasil ditambahkan",
      data
    });
  } catch (err) {
    next(err);
  }
};

// PUT /cerita/:id
exports.update = async (req, res, next) => {
  try {
    const data = await Cerita.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!data) {
      const err = new Error("Cerita tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      message: "Cerita berhasil diperbarui",
      data
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /cerita/:id
exports.remove = async (req, res, next) => {
  try {
    const data = await Cerita.findByIdAndDelete(
      req.params.id
    );

    if (!data) {
      const err = new Error("Cerita tidak ditemukan");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: "Cerita berhasil dihapus"
    });
  } catch (err) {
    next(err);
  }
};
