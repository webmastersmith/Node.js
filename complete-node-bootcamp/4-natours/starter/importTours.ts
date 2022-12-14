import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import { Tour } from './server/model/TourSchema';

type TourId = typeof Tour & { id?: number };

async function loadTours(tours: TourId[]) {
  // for (const tour of tours) {
  //   delete tour.id;
  //   console.log(tour);
  // }
  await Tour.create(tours);
  return;
}

(async function () {
  const DB = await mongoose.connect(`${process.env.MONGOOSE}`);
  try {
    console.log('Successfully Connected to Database.');
    const data: TourId[] = JSON.parse(
      fs.readFileSync(`${process.cwd()}/dev-data/data/tours.json`, 'utf-8')
    );
    // delete everything.
    await mongoose.connection.dropCollection('tours');

    // loadTours
    await loadTours(data);
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
