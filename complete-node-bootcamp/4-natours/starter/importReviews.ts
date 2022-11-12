import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import { ReviewType, Review } from './server/model/ReviewSchema';

async function loadUsers(elements: ReviewType[]) {
  // for (const element of elements) {
  //   // @ts-ignore
  //   // delete element._id;
  // }
  await Review.create(elements);
  console.log(elements);
  return;
}

(async function () {
  const DB = await mongoose.connect(`${process.env.MONGOOSE}`);
  try {
    console.log('Successfully Connected to Database.');
    const data: ReviewType[] = JSON.parse(
      fs.readFileSync(`${process.cwd()}/dev-data/data/reviews.json`, 'utf-8')
    );
    // delete everything.
    await mongoose.connection.dropCollection('reviews');

    // loadTours
    await loadUsers(data);
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  } finally {
    await DB?.disconnect();
    console.log('Closed Client');
  }
})();
