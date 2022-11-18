import express from "express";
import {
  getEdit,
  postEdit,
  remove,
  see,
  logout,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../controllers/userController";

import {
  protectorMiddleWare,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleWare, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleWare)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter.get("/delete", remove);
userRouter.get("/:id", see);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter
  .route("/change-password")
  .all(protectorMiddleWare)
  .get(getChangePassword)
  .post(postChangePassword);

export default userRouter;
