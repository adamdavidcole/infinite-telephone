import fs from "fs";
import AWS from "aws-sdk";

const AWS_BUCKET_NAME = "infinite-telephone";
let s3;

const DB_BACKUP_INTERVAL = 300000;

// Set the Region
AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("AWS setup successfuly");
    s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  }
});

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
