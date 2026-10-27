import sendEmailClient from "saifstack-email";
import nodemailer from "nodemailer";

interface SendEmailOptions {
  email: string;
  subject: string;
  layout: string;
}

const sendEmail = async ({
  email,
  subject,
  layout,
}: SendEmailOptions) => {
  return await sendEmailClient({
    api: process.env.SAIFSTACK_EMAIL_API!,
    domainName: process.env.SAIFSTACK_EMAIL_DOMAIN!,
    email,
    subject,
    layout,
  });
};

export default sendEmail;