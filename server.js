import express from "express";
import multer from "multer";
import path, { join } from "path";
import dotenv from "dotenv";

import {
  getData,
  initialize,
  addAndProcessDataEntry,
  processTranscriptForDataEntry,
} from "./data/data-manager.js";

dotenv.config();

// SERVER SETUP
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage });

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static("files"));
app.use(express.static("data"));

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`));

// ROUTES
app.get("/get_initial_data", async (req, res) => {
  const data = await getData();
  res.send({ data });
});

if (process.env.NODE_ENV === "production") {
  // set static folder
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.post("/add_data_entry", (req, res) => {
  const dataEntry = req.body;
  addAndProcessDataEntry(dataEntry)
    .then((processedDataEntry) => {
      if (!processedDataEntry) {
        res.send({ ok: false });
        throw new Error(`failed to add and process data entry: ${dataEntry}`);
      }
      console.log("data entry added and processed: ", processedDataEntry);
      res.send({ ok: true, dataEntry: processedDataEntry });
      return processedDataEntry;
    })
    .then((processedDataEntry) =>
      processTranscriptForDataEntry(processedDataEntry)
    )
    .catch((err) => {
      console.error("addAndProcessDataEntry caught error: ", err);
    });
});

app.post(
  "/upload_recording",
  upload.single("recording"),
  function (req, res, next) {
    console.log("posting upload_recording!", req.file);
    res.send({ ok: true });
  }
);

// DATABASE INITIALIZATION
await initialize();
console.log("data update", await getData());
