import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const pageTitle = "Join";
  const { name, username, email, password, password2, location } = req.body;

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match!",
    });
  }

  const exists = await User.exists({ $or: [{ username }, { email }] });

  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "The username/email is already exists!",
    });
  }

  try {
    await User.create({
      email,
      username,
      password,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    console.error("error", error._message);
    return res.render(500).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Username does not exists!",
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect("/");
};

export const getEdit = (req, res) => {
  res.render("edit-profile", {
    pageTitle: "Edit Profile",
  });
};

export const postEdit = async (req, res) => {
  const { _id, avatarUrl } = req.session.user;
  const { name, email, username, location } = req.body;
  const { file } = req;
  console.log("file=", file);
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    {
      new: true,
    }
  );
  req.session.user = updatedUser;

  res.redirect("/users/edit");
};

export const remove = (req, res) => res.send("Delete User");

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  if (!user) {
    return res.status(404).render("404", { pageTitle: `User not found` });
  }
  const videos = await Video.find({ owner: user._id });

  return res.render("users/profile", {
    pageTitle: `${user.name} Profile`,
    user,
  });
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";

  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    allow_singup: false,
    scope: "user:email read:user",
  };
  const params = new URLSearchParams(config).toString();
  const requestUrl = `${baseUrl}?${params}`;
  res.redirect(requestUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const requestUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(requestUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });

    if (!user) {
      console.log(
        `${emailObj.email} / ${userData.login} / ${userData.name} / ${userData.location}`
      );
      user = await User.create({
        email: emailObj.email,
        socialOnly: true,
        username: userData.login,
        name: userData.name,
        password: "",
        avatarUrl: userData.avatar_url,
        location: userData.location,
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const { _id, password } = req.session.user;
  const { oldPassword, newPassword, newPasswordConfirmation } = req.body;

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Password does not match!",
    });
  }
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "Current password is incorrect",
    });
  }
  const user = await User.findById(_id);
  user.password = await bcrypt.hash(newPassword, 5);
  await user.save();
  req.session.user.password = user.password;

  return res.redirect("/users/logout");
};
