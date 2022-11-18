import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleWare, videoUpload } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);

videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleWare)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleWare)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleWare)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);

export default videoRouter;
