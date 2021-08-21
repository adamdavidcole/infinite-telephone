import React, { useEffect, useState } from "react";
import { getInitialDataAPI } from "./fetchers/fetchers";

const AUDIO_URL_PATH_PREFIX =
  "https://infinite-telephone.s3.us-east-2.amazonaws.com/";

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    return getInitialDataAPI().then((res) => {
      const data = res.data;
      console.log("Dashboard-Page: fetched initial data: ", data);

      setData(data);
    });
  }, []);

  console.log("data", data);

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
      </tr>
    ));
  }

  return (
    <div className="p-dashboard">
      <h1>Infitine Telephone Dashboard</h1>
      <table>
        <tr>
          <th>id/timestamp</th>
          <th>filename</th>
          <th>processed filename</th>
          <th>audio</th>
          <th>duration</th>
          <th>transcript</th>
        </tr>
        {getTableRows()}
      </table>
    </div>
  );
}
