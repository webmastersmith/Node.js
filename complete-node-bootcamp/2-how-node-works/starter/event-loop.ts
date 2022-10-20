import fs from "fs";
import crypto from "crypto";

async function testTimeout() {
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
  setImmediate(() => console.log("Immediate finished"));
  setTimeout(() => console.log("Timeout finished"), 0);
  process.nextTick(() => console.log("Process.nextTick finished!"));
  console.log("I am the top dog!");

  // read file
  fs.readFile(process.cwd() + "/test-file.txt", "utf-8", () => {
    setTimeout(() => console.log("Timeout in callback finished"), 0);
    setImmediate(() => console.log("Immediate in callback finished"));
    process.nextTick(() =>
      console.log("Process.nextTick in callback finished!")
    );
    console.log("This is what last looks like :-(");
  });
}

// testTimeout()
crypto.pbkdf2("password", "salt", 10000, 1024, "sha512", (err, k) => {
  if (err) console.error(err);
  fs.writeFile("crypto.txt", k.toString("utf-8"), (err) => {
    if (err) console.error(err);
  });
  console.log("crypto done");
});
