import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

import userController from "./controllers/user";
import imageController from "./controllers/image";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) =>
  res.send(
    "<div><h1>Hello there!!!</h1><p>Welcome to me, smart T-Rex</p></div>"
  )
);

app.get("/users", userController.getAllUsers);

app.post("/register", userController.register);
app.post("/login", userController.login);
app.put("/user/increaseEntry", userController.increaseEntry);

app.post("/image/recognize", imageController.recognizeImage);
app.post("/image", imageController.addImage);
app.post("/image/getImagesByCelebrity", imageController.getImagesByCelebrity);
app.get("/image/getAllCelebrities", imageController.getAllCelebrities);
app.get(
  "/image/getImageCountByCelebrity",
  imageController.getImageCountByCelebrity
);

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
