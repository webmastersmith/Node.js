import nodemailer from 'nodemailer';
import 'dotenv/config';

// sendMail(options)
export default async (options: { [key: string]: any }) => {
  // 1. create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +(process.env.EMAIL_PORT || 0),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2. define email options
  const mailOptions = {
    from: 'Bob Jones <bob@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };
  // 3. send email
  await transport.sendMail(mailOptions);
};
