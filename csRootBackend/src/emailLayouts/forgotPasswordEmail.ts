export const forgotPasswordEmailLayout = (
  username: string,
  resetLink: string,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">

  <title>Reset Your CS Root Password</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #f4f6fb;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    .wrapper {
      width: 100%;
      padding: 40px 16px;
      background-color: #f4f6fb;
    }

    .container {
      width: 100%;
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      overflow: hidden;
    }

    .header {
      padding: 34px 36px;
      text-align: center;
      background-color: #111827;
    }

    .logo {
      width: 76px;
      height: 76px;
      margin: 0 auto 14px;
      border-radius: 16px;
    }

    .brand {
      margin: 0;
      font-size: 23px;
      font-weight: 700;
      color: #ffffff;
    }

    .content {
      padding: 38px 42px 42px;
    }

    .eyebrow {
      margin: 0 0 12px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #5865f2;
    }

    .title {
      margin: 0 0 18px;
      text-align: center;
      font-size: 28px;
      line-height: 36px;
      font-weight: 700;
      color: #111827;
    }

    .greeting {
      margin: 0 0 12px;
      font-size: 16px;
      line-height: 26px;
      color: #374151;
    }

    .text {
      margin: 0;
      font-size: 15px;
      line-height: 25px;
      color: #6b7280;
    }

    .button-section {
      padding: 32px 20px;
      margin: 28px 0;
      text-align: center;
      background-color: #f5f6ff;
      border: 1px solid #e5e7ff;
      border-radius: 16px;
    }

    .button {
      display: inline-block;
      padding: 15px 32px;
      background-color: #5865f2;
      border-radius: 10px;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
    }

    .button-text {
      margin: 16px 0 0;
      font-size: 13px;
      line-height: 21px;
      color: #6b7280;
    }

    .link-section {
      margin: 26px 0;
    }

    .link-label {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .reset-link {
      font-size: 12px;
      line-height: 21px;
      color: #5865f2;
      word-break: break-all;
    }

    .notice {
      margin: 26px 0 0;
      padding: 16px;
      background-color: #fff8ed;
      border-left: 3px solid #f59e0b;
      border-radius: 6px;
      font-size: 13px;
      line-height: 22px;
      color: #92400e;
    }

    .closing {
      margin: 28px 0 0;
      font-size: 14px;
      line-height: 23px;
      color: #6b7280;
    }

    .footer {
      padding: 26px 32px;
      text-align: center;
      background-color: #f8f9fc;
      border-top: 1px solid #e5e7eb;
    }

    .footer-brand {
      margin: 0 0 7px;
      font-size: 15px;
      font-weight: 700;
      color: #374151;
    }

    .footer-text {
      margin: 0;
      font-size: 12px;
      line-height: 20px;
      color: #9ca3af;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 10px;
      }

      .content {
        padding: 30px 24px;
      }

      .title {
        font-size: 24px;
        line-height: 32px;
      }

      .header {
        padding: 28px 24px;
      }

      .footer {
        padding: 24px 20px;
      }
    }

    @media (prefers-color-scheme: dark) {
      body,
      .wrapper {
        background-color: #09090b !important;
      }

      .container {
        background-color: #111318 !important;
        border-color: #272a33 !important;
      }

      .title {
        color: #f9fafb !important;
      }

      .greeting {
        color: #e5e7eb !important;
      }

      .text,
      .closing {
        color: #a1a1aa !important;
      }

      .button-section {
        background-color: #171922 !important;
        border-color: #292d3d !important;
      }

      .notice {
        background-color: #292013 !important;
        color: #fbbf24 !important;
      }

      .footer {
        background-color: #0d0f13 !important;
        border-color: #272a33 !important;
      }

      .footer-brand {
        color: #d4d4d8 !important;
      }

      .footer-text,
      .link-label {
        color: #9ca3af !important;
      }
    }
  </style>
</head>

<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="wrapper">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="container">

          <tr>
            <td class="header">
              <img
                src="https://res.cloudinary.com/djvksizg/image/upload/v1786735203/csr_dark_theme_logo.png"
                alt="CS Root"
                width="76"
                height="76"
                class="logo"
              >

              <p class="brand">CS Root</p>
            </td>
          </tr>

          <tr>
            <td class="content">

              <p class="eyebrow">Account Security</p>

              <h1 class="title">Reset Your Password</h1>

              <p class="greeting">
                Hey ${username},
              </p>

              <p class="text">
                We received a request to reset the password associated
                with your CS Root account. Click the button below to
                create a new password and regain access to your account.
              </p>

              <div class="button-section">

                <a href="${resetLink}" class="button">
                  Reset Password
                </a>

                <p class="button-text">
                  Click the button above to securely reset your password.
                </p>

              </div>

              <div class="link-section">

                <p class="link-label">
                  Button not working? Copy this link into your browser:
                </p>

                <a href="${resetLink}" class="reset-link">
                  ${resetLink}
                </a>

              </div>

              <p class="notice">
                If you didn't request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
                Never share your reset link with anyone.
              </p>

              <p class="closing">
                Stay secure.<br>
                Team CS Root
              </p>

            </td>
          </tr>

          <tr>
            <td class="footer">

              <p class="footer-brand">CS Root</p>

              <p class="footer-text">
                A platform built for Computer Science learning and practice.
              </p>

              <p class="footer-text">
                © ${new Date().getFullYear()} CS Root. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};
