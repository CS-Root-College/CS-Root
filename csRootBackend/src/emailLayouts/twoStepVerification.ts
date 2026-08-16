export const verifyTwoFactorLayout = (
  username: string,
  code: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">

  <title>Security verification - CS Root</title>

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
      padding: 42px 16px;
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

    /* =========================
       Header
    ========================= */

    .header {
      padding: 30px 36px;
      background-color: #111827;
      text-align: left;
    }

    .header-inner {
      width: 100%;
    }

    .logo {
      width: 64px;
      height: 64px;
      border-radius: 15px;
      margin-bottom: 22px;
    }

    .security-label {
      margin: 0 0 6px;
      font-size: 11px;
      line-height: 17px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #a5b4fc;
    }

    .brand {
      margin: 0;
      font-size: 25px;
      line-height: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    /* =========================
       Main Content
    ========================= */

    .content {
      padding: 38px 42px 42px;
    }

    .title {
      margin: 0 0 14px;
      font-size: 27px;
      line-height: 35px;
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

    /* =========================
       Security Indicator
    ========================= */

    .security-box {
      margin: 28px 0 26px;
      padding: 18px 18px;
      background-color: #f8f9ff;
      border: 1px solid #e3e7ff;
      border-radius: 14px;
    }

    .security-title {
      margin: 0 0 5px;
      font-size: 13px;
      line-height: 20px;
      font-weight: 700;
      color: #374151;
    }

    .security-text {
      margin: 0;
      font-size: 13px;
      line-height: 21px;
      color: #6b7280;
    }

    /* =========================
       Verification Code
    ========================= */

    .code-wrapper {
      margin: 28px 0;
      text-align: center;
    }

    .code-label {
      margin: 0 0 13px;
      font-size: 11px;
      line-height: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #9ca3af;
    }

    .code-box {
      padding: 22px 16px;
      background-color: #111827;
      border-radius: 14px;
      text-align: center;
    }

    .code {
      margin: 0;
      font-size: 32px;
      line-height: 42px;
      font-weight: 800;
      letter-spacing: 9px;
      color: #ffffff;
      font-family:
        "SFMono-Regular",
        Consolas,
        "Liberation Mono",
        Menlo,
        monospace;
    }

    .code-expiry {
      margin: 11px 0 0;
      font-size: 12px;
      line-height: 19px;
      color: #9ca3af;
      text-align: center;
    }

    /* =========================
       Warning
    ========================= */

    .warning {
      margin: 28px 0 0;
      padding: 15px 17px;
      background-color: #fff8f1;
      border: 1px solid #f5dfc8;
      border-radius: 10px;
    }

    .warning-title {
      margin: 0 0 4px;
      font-size: 13px;
      line-height: 20px;
      font-weight: 700;
      color: #92400e;
    }

    .warning-text {
      margin: 0;
      font-size: 13px;
      line-height: 21px;
      color: #78716c;
    }

    .closing {
      margin: 28px 0 0;
      font-size: 14px;
      line-height: 23px;
      color: #6b7280;
    }

    /* =========================
       Footer
    ========================= */

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

    /* =========================
       Mobile
    ========================= */

    @media only screen and (max-width: 600px) {

      .wrapper {
        padding: 20px 10px;
      }

      .container {
        border-radius: 16px;
      }

      .header {
        padding: 26px 24px;
      }

      .logo {
        width: 58px;
        height: 58px;
      }

      .brand {
        font-size: 23px;
      }

      .content {
        padding: 32px 24px;
      }

      .title {
        font-size: 24px;
        line-height: 32px;
      }

      .code {
        font-size: 27px;
        line-height: 38px;
        letter-spacing: 7px;
      }

      .footer {
        padding: 24px 20px;
      }
    }

    /* =========================
       Dark Mode
    ========================= */

    @media (prefers-color-scheme: dark) {

      body,
      .wrapper {
        background-color: #09090b !important;
      }

      .container {
        background-color: #111318 !important;
        border-color: #272a33 !important;
      }

      .header {
        background-color: #0f1117 !important;
      }

      .security-label {
        color: #a5b4fc !important;
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

      .security-box {
        background-color: #171922 !important;
        border-color: #292d3d !important;
      }

      .security-title {
        color: #e4e4e7 !important;
      }

      .security-text {
        color: #a1a1aa !important;
      }

      .code-label {
        color: #71717a !important;
      }

      .code-box {
        background-color: #f4f4f5 !important;
      }

      .code {
        color: #18181b !important;
      }

      .code-expiry {
        color: #71717a !important;
      }

      .warning {
        background-color: #211b15 !important;
        border-color: #3f3020 !important;
      }

      .warning-title {
        color: #fbbf24 !important;
      }

      .warning-text {
        color: #a8a29e !important;
      }

      .footer {
        background-color: #0d0f13 !important;
        border-color: #272a33 !important;
      }

      .footer-brand {
        color: #d4d4d8 !important;
      }

      .footer-text {
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

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                class="header-inner"
              >
                <tr>
                  <td>

                    <img
                      src="https://res.cloudinary.com/djvksizg/image/upload/v1786735203/csr_dark_theme_logo.png"
                      alt="CS Root"
                      width="64"
                      height="64"
                      class="logo"
                    >

                    <p class="security-label">
                      Account Security
                    </p>

                    <p class="brand">
                      CS Root
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content">

              <h1 class="title">
                Verify your sign-in
              </h1>

              <p class="greeting">
                Hey ${username},
              </p>

              <p class="text">
                We received a request to verify your identity while
                signing in to your CS Root account. Enter the security
                code below to continue.
              </p>

              <!-- Security Information -->
              <div class="security-box">

                <p class="security-title">
                  Two-factor authentication
                </p>

                <p class="security-text">
                  This extra verification helps protect your account
                  even if someone knows your password.
                </p>

              </div>

              <!-- Verification Code -->
              <div class="code-wrapper">

                <p class="code-label">
                  Your security code
                </p>

                <div class="code-box">

                  <p class="code">
                    ${code}
                  </p>

                </div>

                <p class="code-expiry">
                  This code expires shortly. Enter it exactly as shown.
                </p>

              </div>

              <!-- Security Warning -->
              <div class="warning">

                <p class="warning-title">
                  Didn't try to sign in?
                </p>

                <p class="warning-text">
                  If you did not request this code, do not enter or
                  share it. Your account may require additional
                  security attention.
                </p>

              </div>

              <p class="closing">
                Stay secure.<br>
                The CS Root Team
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