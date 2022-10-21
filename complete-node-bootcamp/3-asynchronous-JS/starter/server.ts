import fs from "fs";
import http from "http";

const html = fs.readFileSync("./index.html", "utf-8");
// async
const server = http
  .createServer(async (q, r) => {
    if (q.url === "/dog") {
      try {
        const response = await fetch("https://dog.ceo/api/breeds/image/random");
        const { message } = await response.json();
        const htmlPage = html.replace(/{%DOG_LINK%}/g, message);
        r.write(htmlPage);
        r.end();
      } catch (err) {
        console.log(err);
        r.end("file not found");
      }
    } else {
      r.writeHead(200, { "Content-Type": "text/plain" });
      r.end("Welcome to my house");
    }
  })
  .listen(8080, "127.0.0.1", async () => {
    console.log("Server is running");
  });
