import { readFile, writeFile } from "node:fs/promises";
import path from "path";

const fileReader = async (file: string) => {
  try {
    const filePath = path.join(process.cwd(), file);
    const contents = await readFile(filePath, { encoding: "utf8" });
    console.log(contents);
    const outData = `The humble Avocado is ${contents}\nCreated on ${Date.now()}`;
    writeFile(path.join(process.cwd(), "test.txt"), outData);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log(String(err));
    }
  }
};

fileReader("txt/input.txt");
