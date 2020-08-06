// Admin authorization middleware
export const needsAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    res.status(403).send({ msg: "Admin permissions required" });
  } else {
    next();
  }
};

export const needsCanCreateRooms = (req, res, next) => {
  if (!req.user || !req.user.canCreateRooms) {
    res.status(403).send({ msg: "canCreateRooms permissions required" });
  } else {
    next();
  }
};
