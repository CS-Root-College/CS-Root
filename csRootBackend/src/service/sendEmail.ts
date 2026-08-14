import sendEmailClient from "saifstack-email";

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