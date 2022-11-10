import { UserType } from '../model/UserSchema';
import JWT from 'jsonwebtoken';
import { User } from '../model/UserSchema';
import { Document } from 'mongoose';

export async function encrypt(
  data: string,
  salt: Buffer | string,
  key: Buffer | string
): Promise<string> {
  const crypto = await import('node:crypto');
  // non async
  // const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  // key must be 32 bytes.(aes-256 = key is 256 bits. 256/8 = 32 bytes)  crypto.randomBytes(32)
  // returns buffer
  if (typeof salt === 'string') {
    salt = Buffer.from(salt, 'hex');
  }
  if (typeof key === 'string') {
    key = Buffer.from(key, 'hex');
  }
  const cipher = crypto.createCipheriv(algorithm, key, salt);
  // (data, inputEncoding, outputEncoding)
  // If no encoding is provided, then a buffer is expected.
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  // close the cipher, so it cannot be reused. If data is a Buffer then input_encoding is ignored.
  encrypted += cipher.final('hex');
  return encrypted;
}
export async function decrypt(
  encryptedData: string,
  salt: Buffer | string,
  key: Buffer | string
): Promise<string> {
  const crypto = await import('node:crypto');
  // const crypto = require('crypto');
  // key is utf-8 string
  const algorithm = 'aes-256-cbc';
  if (typeof salt === 'string') {
    salt = Buffer.from(salt, 'hex');
  }
  if (typeof key === 'string') {
    key = Buffer.from(key, 'hex');
  }

  const decipher = crypto.createDecipheriv(algorithm, key, salt);
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}

export const createEncryptedToken = async (
  user: UserType,
  expiresIn: string
): Promise<string | undefined> => {
  require('dotenv').config({ path: './.env' });
  const JWT_KEY = process.env.JWT_SECRET;
  const SALT = process.env.JWT_SALT;
  // console.log('dotenv', JWT_KEY);

  if (!JWT_KEY || !SALT) return;

  const token = JWT.sign({ id: user._id }, JWT_KEY, { expiresIn });
  // console.log('token=', token);
  const encryptedToken = await encrypt(token, SALT, JWT_KEY);
  // console.log('encryptedToken=', encryptedToken);
  return encryptedToken;
  // verify key
  // const verify = JWT.verify(decryptedToken, JWT_KEY);
  // console.log(verify);
};
export const isValidToken = async (
  encryptedToken: string
): Promise<
  | (Document<unknown, any, UserType> &
      UserType &
      Required<{
        _id: string;
      }>)
  | null
> => {
  require('dotenv').config({ path: './.env' });
  const JWT_KEY = process.env.JWT_SECRET;
  const SALT = process.env.JWT_SALT;

  if (!JWT_KEY || !SALT) return null;

  // console.log('dotenv', JWT_KEY);

  const decryptedToken = await decrypt(encryptedToken, SALT, JWT_KEY);
  // console.log('decryptedToken=', decryptedToken);

  type jwt_type = {
    id: string;
    iat: number;
    exp: number;
  };
  // verify key matches user id.
  // If expired, will throw Error('jwt expired') //error.name: "TokenExpiredError"
  const { id, iat, exp } = JWT.verify(decryptedToken, JWT_KEY) as jwt_type;
  // returns user or null
  const user = await User.findById(id).select('+password').exec();
  // console.log('isValidToken user:', user);

  if (id === user?._id.toString()) {
    user.iat = iat;
    user.exp = exp;
    // console.log('jwt user', user);
    // console.log(Object.entries(user));

    return user;
  }
  return null;
};
