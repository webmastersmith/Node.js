interface UserType {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  passwordChangedAt: Date;
  // passwordConfirm: string;
  salt: string;
  // setPassword: (pw: string) => Promise<void>;
  isValidPassword: (password: string) => Promise<boolean>;
  hasPasswordChangedAfterToken: (jwtTimestamp: number) => Promise<boolean>;
  iat?: number;
  exp?: number;
}

declare namespace Express {
  export interface Request {
    requestTime?: string;
    user?: UserType;
  }
}
