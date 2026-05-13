import fs from "fs";

const API_KEY = "AIzaSyA974eFCZcRQ6U8NbTMxKasxT0-9i_Z9gU";

async function test() {
  // Create a dummy video file (just 10 bytes for testing upload API structure)
  fs.writeFileSync("dummy.mp4", Buffer.alloc(10));
  
  const stats = fs.statSync("dummy.mp4");
  
  // Step 1: Initial upload request
  const uploadRes = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${API_KEY}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Command": "start, upload",
      "X-Goog-Upload-Header-Content-Length": stats.size.toString(),
      "X-Goog-Upload-Header-Content-Type": "video/mp4",
      "Content-Type": "video/mp4",
    },
    body: fs.readFileSync("dummy.mp4"),
  });
  
  const uploadData = await uploadRes.json();
  console.log("Upload Data:", uploadData);
  
  if (uploadData.file && uploadData.file.uri) {
     console.log("File URI:", uploadData.file.uri);
  }
}
test();
