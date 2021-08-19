export const getInitialDataAPI = async () => {
  const response = await fetch("/get_initial_data");
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }

  return body;
};

export function addDataEntryAPI(dataEntry) {
  return fetch("/add_data_entry", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataEntry),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.ok) {
        throw new Error("Error adding data entry for: ", dataEntry);
      }

      return data.dataEntry;
    });
}

export function uploadFileAPI({ blob, filename }) {
  // Create A file
  let audioFile = new File([blob], filename);

  let formdata = new FormData(); //create a from to of data to upload to the server
  formdata.append("recording", audioFile, filename); // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname

  // Sending Using fetch here you can add your node.js End point
  return fetch("/upload_recording", {
    method: "POST",
    body: formdata,
  }).catch((error) => console.error("UPLOAD FAILED"));
}
