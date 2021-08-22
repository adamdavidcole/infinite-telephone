import React, { useEffect, useState } from "react";
import {
  getInitialDataAPI,
  deleteDataEntryAPI,
  resetDataAPI,
  setDataAPI,
} from "./fetchers/fetchers";

const AUDIO_URL_PATH_PREFIX =
  "https://infinite-telephone.s3.us-east-2.amazonaws.com/";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  function fetchData() {
    return getInitialDataAPI().then((res) => {
      const data = res.data;
      console.log("Dashboard-Page: fetched initial data: ", data);

      setData(data);
    });
  }

  function onClickDownloadJSON() {
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(data, null, 2));
    var dlAnchorElem = document.getElementById("downloadAnchorElem");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute(
      "download",
      `infinite-telephone-data-${Date.now()}.json`
    );
    dlAnchorElem.click();
  }

  function onClickDeleteEntry(id) {
    console.log("onClickDeleteEntry", id);
    deleteDataEntryAPI(id).then((nextData) => {
      setData(nextData);
      console.log("data entry successfuly deleted");
    });
  }

  function onClickResetData() {
    console.log("onClickResetData");
    resetDataAPI().then((nextData) => {
      setData(nextData);
      console.log("reset data successful");
    });
  }

  function onClickSetData() {
    const textArea = document.getElementById("p-dashboard__textarea");
    const newData = textArea.value;

    setDataAPI(newData).then((nextData) => {
      setData(nextData);
      console.log("set data successfuly");
      textArea.value = "";
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  function getTableRows() {
    return data?.map((dataEntry) => (
      <tr>
        <td>{dataEntry.id}</td>
        <td>{dataEntry.filename}</td>
        <td>{dataEntry.processedFilename}</td>
        <td>
          <audio controls>
            <source
              src={`${AUDIO_URL_PATH_PREFIX}${dataEntry.processedFilename}`}
              type="audio/mpeg"
            />
          </audio>
        </td>
        <td>{dataEntry.duration}</td>
        <td>{dataEntry.transcript}</td>
        <td>
          <button onClick={() => onClickDeleteEntry(dataEntry.id)}>x</button>
        </td>
      </tr>
    ));
  }

  return (
    <div className="p-dashboard">
      <h1>Infitine Telephone Dashboard</h1>
      <h3>Data</h3>
      <table>
        <tr>
          <th>id/timestamp</th>
          <th>filename</th>
          <th>processed filename</th>
          <th>audio</th>
          <th>duration</th>
          <th>transcript</th>
          <th>Delete Entry</th>
        </tr>
        {getTableRows()}
      </table>
      <br />
      <hr />
      <h3>DB Controls</h3>
      <button onClick={onClickDownloadJSON}>Download JSON</button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={onClickResetData}>Reset Data</button>
      <a id="downloadAnchorElem" style={{ display: "none" }}></a>
      <br />
      <br />
      <h3>Set DB Contents</h3>
      <div>
        <p>Ensure you are inputting valid JSON!</p>
        <textarea
          id="p-dashboard__textarea"
          rows="10"
          cols="60"
          style={{ fontSize: "13px" }}
        ></textarea>
        <br />
        <button onClick={onClickSetData}>Set Data</button>
      </div>
    </div>
  );
}
