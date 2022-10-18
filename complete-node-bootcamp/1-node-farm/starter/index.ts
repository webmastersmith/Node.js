import { readFile } from "node:fs/promises";
import path from "path";

const fileReader = async (file: string) => {
  try {
    const filePath = path.join(process.cwd(), file);
    const contents = await readFile(filePath, { encoding: "utf8" });
    console.log(contents);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.log(String(err));
    }
  }
};

fileReader("txt/input.txt");
