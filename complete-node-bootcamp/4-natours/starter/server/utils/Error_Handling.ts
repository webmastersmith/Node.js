interface ErrorType extends Error {
  status: string;
  statusCode: number;
  message: string;
}
export default class ExpressError extends Error implements ErrorType {
  status: string;
  statusCode: number;
  constructor(statusCode: number, msg: string) {
    super(msg);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }
}
