import EventEmitter from "events";
import http from "http";

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

// create event
const myEmitter = new Sales();
// setup listener
myEmitter.on("newSale", () => {
  console.log("New Sale is happening now!");
});

// setup listener
myEmitter.on("newSale", () => {
  console.log("another new sale!");
});

// listener with argument
myEmitter.on("newSale", (stock, greeting) => {
  console.log(stock, greeting);
});
// broadcast event
myEmitter.emit("newSale", 9, "hello"); // 9, hello are the arguments that will be passed.

const server = http.createServer().listen(8080, "127.0.0.1", () => {
  console.log("server running");
});
server.on("request", (req, res) => {
  console.log(req.url);
  if (req.url === "/shutdown") {
    res.end("you shut me down");
    server.close();
    return;
  }
  res.end("you reached me");
  return;
});
server.on("close", () => {
  console.log("server closed");
});
