import app from './views/app';
import 'dotenv/config';
import mongoose from 'mongoose';

(async function () {
  try {
    await mongoose.connect(`${process.env.MONGOOSE}`);
    console.log('Successfully Connected to Database.');

    app.listen(process.env.PORT, () => {
      console.log(`App running on port ${process.env.PORT}...`);
    });
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(String(e));
    }
  } finally {
    // await DB?.disconnect();
    // console.log('Closed Client');
  }

  // not needed with try catch.
  // process.on('unhandledRejection', (err: Error) => {
  //   console.log('hellolllloooo', err);
  // });
})();
