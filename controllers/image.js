import Clarifai from "clarifai";

import db from "../db";

const key = process.env.CLARIFAI_KEY;

const app = new Clarifai.App({
  apiKey: key,
});

const recognizeImage = (req, res) => {
  const { url } = req.body;
  app.models
    .predict(Clarifai.CELEBRITY_MODEL, url)
    .then((data) => {
      const celebs = data.outputs[0].data.regions.map((field) => ({
        id: field.id,
        name: field.data.concepts[0].name,
        prediction: field.data.concepts[0].value,
        boundingBox: {
          topRow: field.region_info.bounding_box.top_row,
          leftCol: field.region_info.bounding_box.left_col,
          bottomRow: 1 - field.region_info.bounding_box.bottom_row,
          rightCol: 1 - field.region_info.bounding_box.right_col,
        },
      }));
      res.json(celebs);
    })
    .catch((err) =>
      res.status(400).json({ message: "This Image contains no face" })
    );
};

// TO IMPROVE: should have 3 table: images, celebrities, image_celebrity
const addImage = (req, res) => {
  const { celebs, url } = req.body;
  db.select("*")
    .from("images")
    .where("url", "=", url)
    .then((images) => {
      if (images.length > 0)
        return res
          .status(400)
          .json({ message: "Image is existed, I will not add new" });
      else {
        const fieldToInsert = celebs.map((celeb) => ({
          celebrity: celeb,
          url: url,
        }));
        return db("images")
          .insert(fieldToInsert)
          .then((data) => {
            res.json({ message: "Add image successfull" });
          })
          .catch((err) => {
            res.status(400).json({ message: "Add image unsuccessful" });
          });
      }
    })
    .catch((err) => {
      res.status(400).json({ message: "Failed to query image" });
    });
};

const getImagesByCelebrity = (req, res) => {
  const { top, celeb } = req.body;
  db("images")
    .select("id", "url")
    .where("celebrity", "=", celeb)
    .orderBy("id", "desc")
    .limit(top)
    .offset(0)
    .then((images) => {
      res.json(images.map((image) => image.url));
    })
    .catch((err) => {
      res.status(400).json({ message: "Failed to get images" });
    });
};

const getAllCelebrities = (req, res) => {
  db("images")
    .select("celebrity")
    .groupBy("celebrity")
    .then((celebrities) => {
      res.json(celebrities.map((val) => val.celebrity));
    })
    .catch((err) => {
      res.status(400).json({ message: "Failed to get celebrities" });
    });
};

const getImageCountByCelebrity = (req, res) => {
  db("images")
    .select("celebrity", db.raw("Count(*)"))
    .groupByRaw("celebrity")
    .orderBy(db.raw("Count(*)"), "desc")
    .then((celebrities) => {
      res.json(
        celebrities.map((celebrity, index) => ({ id: index + 1, ...celebrity }))
      );
    })
    .catch((err) => {
      res.status(400).json({ message: "Failed to get celebrities" });
    });
};

export default {
  recognizeImage,
  addImage,
  getImagesByCelebrity,
  getAllCelebrities,
  getImageCountByCelebrity,
};
