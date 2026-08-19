const sellerMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "seller") {
      return res.status(403).json({
        message: "Seller access required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = sellerMiddleware;