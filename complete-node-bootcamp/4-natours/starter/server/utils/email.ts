import 'dotenv/config';
import nodemailer, { Transporter } from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

// new Email(user: {name, emailAddress}, url: string) url like reset password.
// new Email(user, url).sendWelcome()
// new Email(user, url).sendPasswordReset()

type userType = { name: string; email: string };

export default class Email {
  url: string;
  user: userType;
  to: string;
  firstName: string;
  from: string;

  constructor(user: userType, url: string) {
    this.user = user;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Bob Jones <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // use sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +(process.env?.EMAIL_PORT || 0),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send email
  async send(template: string, subject: string) {
    // 1) render html based on pug templates
    const html = pug.renderFile(
      `${process.cwd()}/server/views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // 2) define options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };
    // 3) create transport and send email.
    const transport = this.newTransport() as Transporter;
    await transport.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours Family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }
}
