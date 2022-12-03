const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteCommentBtn = document.querySelectorAll(
  ".video__comment span:last-child"
);

const addComment = (text, id) => {
  const videoComment = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  span.innerText = ` ${text}`;
  span2.innerHTML = ` ❌`;
  icon.className = "fas fa-comment";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  newComment.setAttribute("data-id", id);
  videoComment.prepend(newComment);
};

const deleteComment = (id) => {
  document.querySelector(`.video__comment[data-id='${id}']`).remove();
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  if (text === "") {
    return;
  }

  const {
    dataset: { video_id },
  } = videoContainer;

  const response = await fetch(`/api/videos/${video_id}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDeleteComment = async (e) => {
  const {
    dataset: { id },
  } = e.target.parentElement;
  console.log("delete id", id);

  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "DELETE",
  });

  if (response.status === 200) {
    console.log("DELETE!");
  }
  deleteComment(id);
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

deleteCommentBtn.forEach((btn) =>
  btn.addEventListener("click", handleDeleteComment)
);
