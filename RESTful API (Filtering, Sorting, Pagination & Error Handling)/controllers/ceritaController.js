const Cerita = require("../models/ceritaModel");
const AppError = require("../utils/AppError");

const { GENRES, STATUSES } = Cerita;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const ALLOWED_SORT_FIELDS = ["judul", "penulis", "genre", "status", "jumlahBab", "createdAt"];
const ALLOWED_FIELDS = ["judul", "penulis", "genre", "sinopsis","status", "jumlahBab", "createdAt"];
const BODY_FIELDS = ["judul", "penulis", "genre", "sinopsis", "status", "jumlahBab"];

const asString = (value, name) => {
  if (typeof value !== "string") {
    throw new AppError(`Parameter '${name}' harus berupa teks tunggal`, 400);
  }
  return value.trim();
};
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parsePositiveInt = (value, name) => {
  const number = Number(asString(value, name));
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new AppError(`Parameter '${name}' harus berupa bilangan bulat positif`, 400);
  }
  return number;
};

const parseNonNegativeInt = (value, name) => {
  const number = Number(asString(value, name));
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new AppError(`Parameter '${name}' harus berupa bilangan bulat >= 0`, 400);
  }
  return number;
};

exports.getAll = async (req, res, next) => {
  try {
    const {
      judul,
      penulis,
      genre,
      status,
      minBab,
      maxBab,
      page,
      limit,
      sortBy,
      order,
      fields
    } = req.query;

    const pageNumber = page === undefined ? 1 : parsePositiveInt(page, "page");
    const requestedLimit =
      limit === undefined ? DEFAULT_LIMIT : parsePositiveInt(limit, "limit");
    const limitNumber = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (pageNumber - 1) * limitNumber;

    if (!Number.isSafeInteger(skip)) {
      throw new AppError("Kombinasi page dan limit terlalu besar", 400);
    }

    const filter = {};
    if (judul !== undefined) {
      filter.judul = { $regex: escapeRegex(asString(judul, "judul")), $options: "i" };
    }
    if (penulis !== undefined) {
      filter.penulis = { $regex: escapeRegex(asString(penulis, "penulis")), $options: "i" };
    }
    if (genre !== undefined) {
      const value = asString(genre, "genre");
      if (!GENRES.includes(value)) {
        throw new AppError(`Genre tidak valid. Pilihan: ${GENRES.join(", ")}`, 400);
      }
      filter.genre = value;
    }
    if (status !== undefined) {
      const value = asString(status, "status");
      if (!STATUSES.includes(value)) {
        throw new AppError(`Status tidak valid. Pilihan: ${STATUSES.join(", ")}`, 400);
      }
      filter.status = value;
    }
    if (minBab !== undefined || maxBab !== undefined) {
      filter.jumlahBab = {};
      if (minBab !== undefined) {
        filter.jumlahBab.$gte = parseNonNegativeInt(minBab, "minBab");
      }
      if (maxBab !== undefined) {
        filter.jumlahBab.$lte = parseNonNegativeInt(maxBab, "maxBab");
      }
      if (
        filter.jumlahBab.$gte !== undefined &&
        filter.jumlahBab.$lte !== undefined &&
        filter.jumlahBab.$gte > filter.jumlahBab.$lte
      ) {
        throw new AppError("minBab tidak boleh lebih besar dari maxBab", 400);
      }
    }

    const sortField = sortBy === undefined ? "createdAt" : asString(sortBy, "sortBy");
    const sortOrder = order === undefined ? "desc" : asString(order, "order").toLowerCase();
    if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
      throw new AppError(
        `Field sorting tidak diizinkan. Pilihan: ${ALLOWED_SORT_FIELDS.join(", ")}`,
        400
      );
    }
    if (!["asc", "desc"].includes(sortOrder)) {
      throw new AppError("Order harus asc atau desc", 400);
    }

    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1, _id: 1 };

    let projection;
    if (fields !== undefined) {
      const selected = asString(fields, "fields")
        .split(",")
        .map((field) => field.trim())
        .filter(Boolean);
      if (selected.length === 0) {
        throw new AppError("Parameter 'fields' tidak boleh kosong", 400);
      }
      const invalid = selected.filter((field) => !ALLOWED_FIELDS.includes(field));
      if (invalid.length > 0) {
        throw new AppError(
          `Field projection tidak diizinkan: ${invalid.join(", ")}. Pilihan: ${ALLOWED_FIELDS.join(", ")}`,
          400
        );
      }
      projection = selected.join(" ");
    }

    const [data, total] = await Promise.all([
      Cerita.find(filter).select(projection).sort(sort).skip(skip).limit(limitNumber).lean(),
      Cerita.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      success: true,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      },
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await Cerita.findById(req.params.id);
    if (!data) throw new AppError("Cerita tidak ditemukan", 404);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const pickBody = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Body request harus berupa objek JSON", 400);
  }
  return Object.fromEntries(
    BODY_FIELDS.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
  );
};

exports.create = async (req, res, next) => {
  try {
    const data = await Cerita.create(pickBody(req.body));
    res.status(201).json({
      success: true,
      message: "Cerita berhasil ditambahkan",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await Cerita.findByIdAndUpdate(req.params.id, pickBody(req.body), {
      new: true,
      runValidators: true
    });
    if (!data) throw new AppError("Cerita tidak ditemukan", 404);
    res.json({
      success: true,
      message: "Cerita berhasil diperbarui",
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await Cerita.findByIdAndDelete(req.params.id);
    if (!data) throw new AppError("Cerita tidak ditemukan", 404);
    res.status(200).json({
      success: true,
      message: "Cerita berhasil dihapus"
    });
  } catch (err) {
    next(err);
  }
};
