import express from "express";
import multer from "multer";

import { getData, initialize, addDataEntry } from "./data/data-manager.js";

// SERVER SETUP
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "client/public/media/audio");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage });

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`));

// ROUTES
app.get("/express_backend", (req, res) => {
  console.log("hit server");
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.get("/get_initial_data", (req, res) => {
  const data = getData();
  res.send({ data });
});

app.post("/add_data_entry", (req, res) => {
  const dataEntry = req.body;
  addDataEntry(dataEntry);
  res.send({ ok: true });
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
console.log("data update", getData());
