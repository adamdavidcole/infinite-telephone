import fs from "fs";
import AWS from "aws-sdk";

export const AWS_BUCKET_NAME = "infinite-telephone";

const DB_LOCAL_PATH = "./data/db.json";
const DB_AWS_PATH = "db/db.json";
const EMPTY_DB_PATH = "./data/empty-db.json";
// 5 minuets
const MILLIS_PER_MINUTE = 60000;
const DB_BACKUP_INTERVAL = 60 * MILLIS_PER_MINUTE;

// Set the Region
AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("AWS setup successfuly");
  }
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const uploadFileToS3 = ({ filepath, filename }) => {
  // Read content from the file
  const fileContent = fs.readFileSync(filepath);

  // Setting up S3 upload parameters
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: filename, // File name you want to save as in S3
    Body: fileContent,
    ACL: "public-read",
  };

  console.log("AWS: attempt to upload ", filename);

  return new Promise((resolve, reject) => {
    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
        return;
      }

      console.log(
        `AWS File uploaded successfully. filename: ${filename}, ${data.Location}`
      );
      resolve(data);
    });
  });
};

export function backupDB() {
  console.log("Updating DB");
  uploadFileToS3({ filepath: DB_LOCAL_PATH, filename: DB_AWS_PATH });
}

export function clearDB() {
  // maybe backup existing DB?

  uploadFileToS3({ filepath: EMPTY_DB_PATH, filename: DB_AWS_PATH });

  fs.copyFile(EMPTY_DB_PATH, DB_LOCAL_PATH, (err) => {
    if (err) {
      console.error("Error clearing DB", err);
      return;
    }

    console.log("DB cleared");
  });
}

export function loadDB() {
  console.log("loadDB()");
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: DB_AWS_PATH,
    };

    // Converted it to async/await syntax just to simplify.
    s3.getObject(params, (err, data) => {
      if (err) {
        console.error("loadDB error: ", err);
        reject(err);
        return;
      }

      let objectData = data.Body.toString("utf-8");
      if (!objectData || !objectData.length) {
        reject("loadDB(): Object data is empty");
      }

      fs.writeFileSync(DB_LOCAL_PATH, objectData);
      resolve(JSON.parse(objectData));
    });
  });
}

// Backup DB every hour
// setInterval(() => {
//   try {
//     backupDB();
//   } catch (e) {
//     console.error("Error backing up DB in interval", e);
//   }
// }, DB_BACKUP_INTERVAL);
