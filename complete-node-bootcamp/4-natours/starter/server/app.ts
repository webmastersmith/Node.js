import express, { Request, Response, NextFunction } from 'express';

const port = 8080;
const app = express();

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('hello from the server!');
});

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
