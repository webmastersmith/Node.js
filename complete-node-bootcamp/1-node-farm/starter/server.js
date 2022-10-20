const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const url = require("node:url");
const replacePlaceholders = require("./replacePlacholders");

// this is run when server starts and held in memory.
const data = fs.readFileSync(
  path.join(__dirname, "dev-data/data.json"),
  "utf-8"
);
const product = fs.readFileSync(
  path.join(__dirname, "templates/product.html"),
  "utf-8"
);
const card = fs.readFileSync(
  path.join(__dirname, "templates/card.html"),
  "utf-8"
);
const overview = fs.readFileSync(
  path.join(__dirname, "templates/overview.html"),
  "utf-8"
);

const dataObj = JSON.parse(data);

http
  .createServer(function (q, r) {
    const pathName = url.parse(q.url).pathname;
    const id = url.parse(q.url, true).query.id;

    // favicon must be added to index.html head to show on page.
    if (pathName === "/favicon.ico") {
      r.writeHead(200, { "Content-Type": "image/x-icon" });
      const faviconPath = path.join(__dirname, "favicon.ico");
      fs.createReadStream(faviconPath).pipe(r);
      r.end();
      return;
    }

    // home | overview page
    if (pathName === "/" || pathName === "/overview") {
      const cardHTML = dataObj
        .map((data) => replacePlaceholders(card, data))
        .join("");
      const overviewPage = overview.replace(/{%PRODUCT_CARDS%}/g, cardHTML);
      r.writeHead(200, { "Content-Type": "text/html" });
      r.write(overviewPage);
      r.end();
      return;
    }

    // product
    if (pathName === "/product") {
      const slug = id.replace(/-/g, " ");
      const [data] = dataObj.filter(
        (el) => el.productName.toLowerCase() == slug
      );

      const productPage = replacePlaceholders(product, data);
      r.writeHead(200, { "Content-Type": "text/html" });
      r.write(productPage);
      r.end();
      return;
    }

    // api
    if (pathName === "/api") {
      r.writeHead(200, { "Content-Type": "application/json" });
      r.write(data);
      r.end();
      return;
    } else {
      r.writeHead(404, { "Content-Type": "text/plain" });
      r.write("page not found");
      r.end();
      return;
    }
  })
  .listen(8080);

console.log("Server running at http://127.0.0.1:8080/");
