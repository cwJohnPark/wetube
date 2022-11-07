import mongoose from "mongoose";

const url = `mongodb://localhost:27017/wetube`;

mongoose.connect(url);

const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB 📦");
const handleError = (error) => console.log("DB ERROR ❌", error);

db.on("error", handleError);
db.once("open", handleOpen);
