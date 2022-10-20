import fs from "fs";
import http from "http";

const server = http.createServer().listen(8080, "127.0.0.1", () => {
  console.log("server running");
});

server.on("request", (req, res) => {
  if (req.url === "/big-file") {
    const readable = fs.createReadStream("./big-file.txt");
    res.writeHead(200, { "Content-Type": "text/plain" });
    // solution 1
    // this solution does not handle back pressure
    // readable.on("data", (chunk) => {
    //   res.write(chunk);
    // });

    // solution 2
    // handle back pressure automatically
    readable.pipe(res);

    // close stream
    readable.on("end", () => {
      console.log("file sent to http client");
      res.end();
      return;
    });

    // handle errors for the first solution
    readable.on("error", (err) => {
      console.log(err);
      console.log("file missing");
      res.statusCode = 500;
      res.end("file not found");
      return;
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("home page");
  }
});
