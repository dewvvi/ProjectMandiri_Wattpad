const isProduction = process.env.NODE_ENV === "production";

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Terjadi kesalahan pada server";
  let errors;

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Format JSON pada body request tidak valid";
  }
  if (err.name === "CastError" || err.name === "BSONError") {
    statusCode = 400;
    message =
      err.path === "_id"
        ? "Format ID cerita tidak valid"
        : `Nilai untuk field '${err.path}' tidak valid`;
  }
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Validasi data gagal";
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = "Data dengan nilai unik tersebut sudah ada";
  }

  if (statusCode >= 500) console.error(err);
  if (isProduction && statusCode >= 500) message = "Terjadi kesalahan pada server";

  const body = { success: false, statusCode, message };
  if (errors) body.errors = errors;
  if (!isProduction && statusCode >= 500) body.stack = err.stack;
  res.status(statusCode).json(body);
};
