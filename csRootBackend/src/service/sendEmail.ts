
import { Resend } from "resend";
import sendEmailClient from "saifstack-email";

interface SendEmailOptions {
  email: string;
  subject: string;
  layout: string; 
}

interface SendEmailResult {
  success: boolean;
  provider: "resend" | "saifstack" | null;
  data?: unknown;
  error?: string;
}

const sendEmail = async ({
  email,
  subject,
  layout,
}: SendEmailOptions): Promise<SendEmailResult> => {
  let resendError = "Resend configuration missing";

  if (process.env.RESEND_EMAIL_API && process.env.RESEND_FROM_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_EMAIL_API);

      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject,
        html: layout,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        provider: "resend",
        data,
      };
    } catch (error) {
      resendError =
        error instanceof Error ? error.message : "Resend failed";
    }
  }

  try {
    if (
      !process.env.SAIFSTACK_EMAIL_API ||
      !process.env.SAIFSTACK_EMAIL_DOMAIN
    ) {
      throw new Error("SaifStack configuration missing");
    }

    const data = await sendEmailClient({
      api: process.env.SAIFSTACK_EMAIL_API,
      domainName: process.env.SAIFSTACK_EMAIL_DOMAIN,
      email,
      subject,
      layout,
    });

    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      data.error
    ) {
      throw new Error(String(data.error));
    }

    return {
      success: true,
      provider: "saifstack",
      data,
    };
  } catch (error) {
    const saifstackError =
      error instanceof Error ? error.message : "SaifStack failed";

    return {
      success: false,
      provider: null,
      error: `Resend: ${resendError} | SaifStack: ${saifstackError}`,
    };
  }
};

export default sendEmail;
