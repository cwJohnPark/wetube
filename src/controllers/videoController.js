const videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 1,
  },
  {
    rating: 5,
    title: "Second Video",
    comments: 2,
    createdAt: "10 minutes ago",
    views: 59,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 2,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 229,
    id: 3,
  },
];

export const trending = (req, res) =>
  res.render("home", { pageTitle: "Home", videos: videos });

export const watch = (req, res) => {
  const video = getVideo(req);
  return res.render("watch", {
    pageTitle: `Watching ${video.title}`,
    video: video,
  });
};

export const getEdit = (req, res) => {
  const video = getVideo(req);
  return res.render("edit", { pageTitle: "Edit", video: video });
};
export const postEdit = (req, res) => {
  const { title } = req.body;
  const { id } = req.params;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title: title,
    rating: 1,
    comments: 0,
    createdAt: "Just now",
    views: 1,
    id: 4,
  };
  addVideo(newVideo);
  console.log(`Upload "${title}"`);
  return res.redirect("/");
};

export const deleteVideo = (req, res) => {
  return res.send("Delete Video");
};

function getVideo(req) {
  const { id } = req.params;
  return videos[id - 1];
}

function addVideo(video) {
  videos.push(video);
}
