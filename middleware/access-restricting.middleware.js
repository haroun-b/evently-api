function restrictAccess(req, res, next) {
  try {
    if (!req.user) {
      res.status(401).json({ message: `To continue, please authenticate` });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}


module.exports = restrictAccess;