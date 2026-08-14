export const verifyEmailLayout = (
  username: string,
  otp: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">

  <title>Verify your CS Root account</title>

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
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
    }

    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

    img {
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
      max-width: 100%;
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
      padding: 34px 36px 24px;
      text-align: center;
      background-color: #ffffff;
    }

    .logo {
      width: 82px;
      height: 82px;
      margin: 0 auto 20px;
      border-radius: 18px;
    }

    .brand {
      margin: 0;
      font-size: 24px;
      line-height: 30px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #111827;
    }

    .content {
      padding: 10px 42px 42px;
    }

    .title {
      margin: 0 0 14px;
      text-align: center;
      font-size: 28px;
      line-height: 36px;
      font-weight: 700;
      letter-spacing: -0.7px;
      color: #111827;
    }

    .greeting {
      margin: 0 0 10px;
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

    .otp-section {
      margin: 30px 0;
      padding: 28px 20px;
      text-align: center;
      background-color: #f8f9ff;
      border: 1px solid #e3e7ff;
      border-radius: 16px;
    }

    .otp-label {
      margin: 0 0 12px;
      font-size: 12px;
      line-height: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #6b7280;
    }

    .otp {
      margin: 0;
      font-size: 36px;
      line-height: 44px;
      font-weight: 800;
      letter-spacing: 10px;
      color: #5865f2;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }

    .expiry {
      margin: 14px 0 0;
      font-size: 13px;
      line-height: 20px;
      color: #9ca3af;
    }

    .notice {
      margin: 0;
      padding: 14px 16px;
      border-left: 3px solid #5865f2;
      background-color: #f8f9ff;
      border-radius: 6px;
      font-size: 13px;
      line-height: 21px;
      color: #6b7280;
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
      line-height: 22px;
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

      .container {
        border-radius: 16px;
      }

      .header {
        padding: 28px 24px 20px;
      }

      .content {
        padding: 8px 24px 32px;
      }

      .title {
        font-size: 24px;
        line-height: 32px;
      }

      .otp {
        font-size: 30px;
        line-height: 40px;
        letter-spacing: 7px;
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

      .container,
      .header {
        background-color: #111318 !important;
        border-color: #272a33 !important;
      }

      .brand,
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

      .otp-section {
        background-color: #171922 !important;
        border-color: #292d3d !important;
      }

      .notice {
        background-color: #171922 !important;
        color: #a1a1aa !important;
      }

      .footer {
        background-color: #0d0f13 !important;
        border-color: #272a33 !important;
      }

      .footer-brand {
        color: #d4d4d8 !important;
      }

      .footer-text,
      .otp-label,
      .expiry {
        color: #71717a !important;
      }
    }
  </style>
</head>

<body>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    class="wrapper"
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          class="container"
        >

          <!-- Header -->
          <tr>
            <td class="header">

              <img
                src="https://res.cloudinary.com/djvksizg/image/upload/v1786735203/csr_dark_theme_logo.png"
                alt="CS Root"
                width="82"
                height="82"
                class="logo"
              >

              <p class="brand">
                CS Root
              </p>

            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content">

              <h1 class="title">
                Verify your email
              </h1>

              <p class="greeting">
                Hey ${username},
              </p>

              <p class="text">
                Thanks for joining CS Root. Use the verification code
                below to confirm your email address and continue setting
                up your account.
              </p>

              <!-- OTP -->
              <div class="otp-section">

                <p class="otp-label">
                  Verification Code
                </p>

                <p class="otp">
                  ${otp}
                </p>

                <p class="expiry">
                  This code will expire shortly.
                </p>

              </div>

              <p class="notice">
                If you didn't request this verification code, you can
                safely ignore this email. For your security, never share
                this code with anyone.
              </p>

              <p class="closing">
                Welcome to CS Root.<br>
                Learn. Build. Solve.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">

              <p class="footer-brand">
                CS Root
              </p>

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