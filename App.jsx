import React, { useEffect, useState } from "react";
import { getObjectFromS3, putObjectInS3, listObjectInS3 } from "./s3Helpers";

export default function App() {
  const [fileContents, setFileContents] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileNames, setFileNames] = useState([]);

  useEffect(() => {
    (async() => {
      const files = await listObjectInS3("");
      setFileNames(files);
    })();
  }, []);

  const save = async () => {
    await putObjectInS3(fileName, fileContents);
  }

  const load = async (e) => {
    const contents = await getObjectFromS3(e.target.value);
    setFileName(e.target.value);
    setFileContents(contents);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <select value={fileName} onChange={load}>
        <option disabled={true} value={""}>select a file</option>
        {fileNames.map((file, i) => (
          <option key={i} value={file}>{file}</option>
        ))}
      </select>
      <textarea value={fileContents} onChange={e => setFileContents(e.target.value)}>{fileContents}</textarea>
      <button onClick={save}>save</button>
    </div>
  );
}