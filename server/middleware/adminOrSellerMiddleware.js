const adminOrSellerMiddleware = (req, res, next) => {
  if (
    req.user.role !== "admin" &&
    req.user.role !== "seller"
  ) {
    return res.status(403).json({
      message: "Admin or seller access required",
    });
  }

  next();
};

module.exports = adminOrSellerMiddleware;