import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import { Tour } from './server/model/Mongoose_Schema';

type TourId = typeof Tour & { id?: number };

(async function () {
  const DB = await mongoose.connect(`${process.env.MONGOOSE}`);
  try {
    console.log('Successfully Connected to Database.');
    const data: TourId[] = JSON.parse(
      fs.readFileSync(
        `${process.cwd()}/dev-data/data/tours-simple.json`,
        'utf-8'
      )
    );
    for (const tour of data) {
      delete tour.id;
      await Tour.create(tour);
      console.log(tour);
    }
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
