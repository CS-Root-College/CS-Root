export const welcomeEmailLayout = (username: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">

  <title>Welcome to CS Root</title>

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

    .wrapper {
      width: 100%;
      padding: 36px 16px;
      background-color: #f4f6fb;
    }

    .container {
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      overflow: hidden;
    }

    /* Header */

    .header {
      padding: 26px 30px;
      background-color: #111827;
      text-align: center;
    }

    .logo {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      margin: 0 auto 14px;
    }

    .brand {
      margin: 0;
      font-size: 22px;
      line-height: 29px;
      font-weight: 700;
      color: #ffffff;
    }

    .tagline {
      margin: 5px 0 0;
      font-size: 12px;
      line-height: 18px;
      color: #a5b4fc;
    }

    /* Content */

    .content {
      padding: 34px 34px 32px;
    }

    .title {
      margin: 0 0 10px;
      font-size: 25px;
      line-height: 33px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #111827;
    }

    .greeting {
      margin: 0 0 12px;
      font-size: 16px;
      line-height: 25px;
      color: #374151;
    }

    .text {
      margin: 0;
      font-size: 14px;
      line-height: 23px;
      color: #6b7280;
    }

    /* Welcome box */

    .welcome-box {
      margin: 24px 0;
      padding: 18px;
      background-color: #f8f9ff;
      border: 1px solid #e3e7ff;
      border-radius: 13px;
      text-align: center;
    }

    .welcome-title {
      margin: 0 0 6px;
      font-size: 14px;
      line-height: 21px;
      font-weight: 700;
      color: #374151;
    }

    .welcome-text {
      margin: 0;
      font-size: 13px;
      line-height: 21px;
      color: #6b7280;
    }

    /* Button */

    .button-wrapper {
      margin: 24px 0 22px;
      text-align: center;
    }

    .button {
      display: inline-block;
      padding: 11px 22px;
      background-color: #111827;
      border-radius: 9px;
      color: #ffffff !important;
      font-size: 13px;
      line-height: 20px;
      font-weight: 600;
      text-decoration: none;
    }

    .closing {
      margin: 0;
      font-size: 13px;
      line-height: 22px;
      color: #6b7280;
    }

    /* Footer */

    .footer {
      padding: 20px 24px;
      text-align: center;
      background-color: #f8f9fc;
      border-top: 1px solid #e5e7eb;
    }

    .footer-brand {
      margin: 0 0 5px;
      font-size: 14px;
      line-height: 20px;
      font-weight: 700;
      color: #374151;
    }

    .footer-text {
      margin: 0;
      font-size: 11px;
      line-height: 18px;
      color: #9ca3af;
    }

    /* Mobile */

    @media only screen and (max-width: 600px) {

      .wrapper {
        padding: 20px 10px;
      }

      .container {
        border-radius: 15px;
      }

      .header {
        padding: 24px 20px;
      }

      .logo {
        width: 50px;
        height: 50px;
      }

      .content {
        padding: 30px 22px;
      }

      .title {
        font-size: 23px;
        line-height: 30px;
      }

      .button {
        display: block;
        width: 100%;
      }

      .footer {
        padding: 20px 16px;
      }
    }

    /* Dark Mode */

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

      .brand,
      .title {
        color: #f9fafb !important;
      }

      .tagline {
        color: #a5b4fc !important;
      }

      .greeting {
        color: #e5e7eb !important;
      }

      .text,
      .closing {
        color: #a1a1aa !important;
      }

      .welcome-box {
        background-color: #171922 !important;
        border-color: #292d3d !important;
      }

      .welcome-title {
        color: #e4e4e7 !important;
      }

      .welcome-text {
        color: #a1a1aa !important;
      }

      .button {
        background-color: #f4f4f5 !important;
        color: #18181b !important;
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

              <img
                src="https://res.cloudinary.com/djvksizg/image/upload/v1786735203/csr_dark_theme_logo.png"
                alt="CS Root"
                width="54"
                height="54"
                class="logo"
              >

              <p class="brand">
                CS Root
              </p>

              <p class="tagline">
                Learn. Build. Grow.
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">

              <h1 class="title">
                Welcome aboard! 👋
              </h1>

              <p class="greeting">
                Hey ${username},
              </p>

              <p class="text">
                Your CS Root account is ready. We're glad to have you with us.
                You can now explore, learn, practice, and build your way through
                Computer Science.
              </p>

              <!-- Welcome Box -->
              <div class="welcome-box">

                <p class="welcome-title">
                  Your journey starts here.
                </p>

                <p class="welcome-text">
                  Keep learning, keep building, and keep improving.
                  There's a lot waiting for you inside CS Root.
                </p>

              </div>

              <!-- Button -->
              <div class="button-wrapper">

                <a
                  href="https://csroot.example.com"
                  class="button"
                >
                  Start Learning
                </a>

              </div>

              <p class="closing">
                We're excited to have you here.<br>
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