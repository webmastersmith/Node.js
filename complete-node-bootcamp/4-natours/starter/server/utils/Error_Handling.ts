interface ErrorType extends Error {
  status: string;
  statusCode: number;
  message: string;
  originalError?: any;
}
export default class ExpressError extends Error implements ErrorType {
  status: string;
  statusCode: number;
  isOperational: boolean;
  originalError?: any;
  constructor(statusCode: number, msg: string, error?: any) {
    super(msg);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.originalError = error;
    // to determine if Error came from this special class or another error in the system.
    this.isOperational = true;

    // Stack Trace -to use console.log(err.stack)
    Error.captureStackTrace(this, this.constructor);
  }
}
