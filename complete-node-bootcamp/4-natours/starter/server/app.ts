// import { env } from 'process';
import 'dotenv/config';
import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';
import { Data } from './types';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// simple POST request with 'URL' values. Header is optional.
// curl -i -d "username=bob&password=secret&website=stack.com" -X POST http://localhost:8080/ -H 'content-type:text/plain'
// simple POST request with 'JSON' values. Header is required.
// curl -i -d '{ "username": "scott", "password":"secret", "website": "stack.com" }' -X POST http://localhost:8080/ -H 'content-type:application/json'

let tours = JSON.parse(
  fs.readFileSync(process.cwd() + '/dev-data/data/tours-simple.json', 'utf-8')
);
app.get('/api/v1/tours', (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});
app.get('/api/v1/tours/:id', (req: Request, res: Response) => {
  // console.log( req.params.id);
  const data = tours.find((el: Data) => el.id === +req.params.id);
  if (data) {
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data,
    });
  } else {
    res.status(400).json({ status: 'fail', data: 'cannot find tour' });
  }
});

app.patch('/api/v1/tours/:id', (req: Request, res: Response) => {
  // curl -i -d '{ "username": "bobby" }' -X PATCH http://localhost:8080/api/v1/tours/9 -H 'content-type:application/json'

  const id = +req.params.id;
  const data = tours.find((el: Data) => el.id === id);
  if (data) {
    const remainingData = tours.filter((el: Data) => el.id !== id);
    const newData = { ...data, ...req.body };
    tours = [...remainingData, newData];
    fs.writeFile(
      process.cwd() + '/dev-data/data/tours-simple.json',
      JSON.stringify(tours),
      (err) => {
        if (err) {
          console.log(err);
          res.status(400).send('Error');
          return;
        }
        res.status(200).json({
          status: 'success',
          results: tours.length,
          data: 'Thank you!',
        });
      }
    );
  } else {
    res.status(404).json({ status: 'fail', data: 'cannot find tour' });
  }
});

app.delete('/api/v1/tours/:id', (req: Request, res: Response) => {
  // curl -i -X DELETE http://localhost:8080/api/v1/tours/9

  const id = +req.params.id;
  const dataId = tours.findIndex((el: Data) => el.id === id);
  if (dataId > -1) {
    tours.splice(dataId, 1);
    fs.writeFile(
      process.cwd() + '/dev-data/data/tours-simple.json',
      JSON.stringify(tours),
      (err) => {
        if (err) {
          console.log(err);
          res.status(400).send('Error');
          return;
        }
        res.status(204).json({
          status: 'success',
          results: tours.length,
          data: null,
        });
      }
    );
  } else {
    res.status(404).json({ status: 'fail', data: 'cannot find tour' });
  }
});

app.post('/api/v1/tours/', (req: Request, res: Response) => {
  // curl -i -d '{ "username": "bob", "password":"secret", "website": "stack.com" }' -X POST http://localhost:8080/api/v1/tours -H 'content-type:application/json'
  const newTourId = tours.length;
  const newTour = { id: newTourId, ...req.body };
  tours.push(newTour);
  // console.log(tours.length);
  // console.log(req.body);
  // console.log(newTour);
  // console.log(process.cwd());

  fs.writeFile(
    process.cwd() + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err);
        res.status(400).send('Error');
        return;
      }
      res.status(200).send('thank you');
    }
  );
});

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}...`);
});
