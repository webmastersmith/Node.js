import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import { User, UserType } from './server/model/UserSchema';

async function loadUsers(users: UserType[]) {
  for (const user of users) {
    user.password = '1234';
  }
  await User.create(users);
  console.log(users);
  return;
}

(async function () {
  const DB = await mongoose.connect(`${process.env.MONGOOSE}`);
  try {
    console.log('Successfully Connected to Database.');
    const data: UserType[] = JSON.parse(
      fs.readFileSync(`${process.cwd()}/dev-data/data/users.json`, 'utf-8')
    );
    // delete everything.
    // await User.deleteMany({});
    await mongoose.connection.dropCollection('users');

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
