// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Something went wrong on our end.' : err.message,
  });
}
