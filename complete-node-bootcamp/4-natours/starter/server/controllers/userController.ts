import { Request, Response } from 'express';

// User Handlers
export const getAllUsers = (req: Request, res: Response) => {
  // curl -i -X GET http://127.0.0.1:8080/api/v1/users
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
};
export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
};
export const getUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
};
export const updateUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
};
export const deleteUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    data: 'This route is under construction.',
  });
};
