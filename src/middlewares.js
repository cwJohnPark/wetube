import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Wetube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  console.info("session:", req.session);
  next();
};

export const protectorMiddleWare = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  }
  return res.redirect("/login");
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  }
  return res.render("/");
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 300000,
  },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 100000000,
  },
});
