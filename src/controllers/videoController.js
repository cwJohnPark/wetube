import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import session from "express-session";
import { startSession } from "mongoose";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  res.render("home", { pageTitle: "Home", videos: videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");

  if (!video) {
    req.flash("error", "Not found Video");
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  const { owner } = video;

  return res.render("watch", {
    pageTitle: video.title,
    video,
    owner,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "Video not found");
    return res.render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Unauthorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.exists({ _id: id });
  if (!video) {
    req.flash("error", "Video not found");
    return res.redirect("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Unauthorized");
    return res.status(403).redirect("/");
  }

  const { title, description, hashtags } = req.body;
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("info", "Changes saved");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;

  const { video, thumb } = req.files;

  const { title, description, hashtags } = req.body;
  console.log("HERE");
  console.log("video:::", video);
  console.log("thumb:::", thumb);
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
  } catch (error) {
    console.log(error._message);
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }

  return res.redirect("/");
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "Video not found");
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authroized");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: { $regex: new RegExp(`${keyword}$`, "i") },
    }).populate("owner");
  }

  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "Not found Video");
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    session: { user },
    body: { text },
  } = req;

  if (text === "") {
    return res.sendStatus(400);
  }

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  await video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: { user },
  } = req;

  const comment = await Comment.findById(id);
  if (String(user._id) !== String(comment.owner)) {
    return res.status(400);
  }
  const video = await Video.findById(comment.video);
  const owner = await User.findById(comment.owner);
  video.comments = video.comments.filter((it) => it._id != id);
  owner.comments = owner.comments.filter((it) => it._id != id);

  await comment.deleteOne();
  await video.save();
  await owner.save();
  return res.sendStatus(200);
};
