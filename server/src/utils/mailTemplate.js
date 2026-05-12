export const getOtpEmailHtml = (otp) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mingle Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0c15;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0c15;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="500px" border="0" cellspacing="0" cellpadding="0" style="max-width:500px;background-color:#141622;border-radius:24px;border:1px solid #23273a;box-shadow:0 20px 40px rgba(0,0,0,0.4);overflow:hidden;">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg, #4f46e5 0%, #ec4899 50%, #f59e0b 100%);padding:40px 20px;">
              <h1 style="margin:0;color:#ffffff;font-size:36px;font-weight:800;letter-spacing:-1px;">Mingle</h1>
              <p style="margin:10px 0 0 0;color:rgba(255,255,255,0.85);font-size:14px;font-weight:500;">Connect. Converse. Mingle.</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:40px 30px;color:#cbd5e1;">
              <h2 style="margin:0 0 20px 0;color:#ffffff;font-size:22px;font-weight:700;text-align:center;">Verify Your Email Address</h2>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;text-align:center;color:#94a3b8;">
                Hi there! Thanks for signing up for Mingle. To complete your registration and secure your account, please enter the 4-digit verification code below:
              </p>
              
              <!-- OTP Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:30px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:bold;letter-spacing:16px;color:#6366f1;background-color:#1c1e30;padding:20px 30px 20px 45px;border-radius:16px;border:1px solid #312e81;box-shadow:inset 0 2px 4px rgba(0,0,0,0.6);text-shadow:0 0 10px rgba(99, 102, 241, 0.3);">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Note -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#1e1b4b;border-radius:12px;margin:24px 0;border-left:4px solid #6366f1;">
                <tr>
                  <td style="padding:15px;font-size:13px;line-height:1.5;color:#a5b4fc;">
                    <strong>🕒 Note:</strong> This verification code is extremely time-sensitive and will expire in <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this message.
                  </td>
                </tr>
              </table>

              <p style="margin:30px 0 0 0;font-size:14px;line-height:1.6;text-align:center;color:#64748b;">
                Need help? Reach out to us at <a href="mailto:support@mingle.com" style="color:#6366f1;text-decoration:none;font-weight:600;">support@mingle.com</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#0d0e1b;padding:24px;border-top:1px solid #1e2235;">
              <p style="margin:0;font-size:12px;color:#475569;">&copy; 2026 Mingle Chat App. All rights reserved.</p>
              <p style="margin:6px 0 0 0;font-size:11px;color:#334155;">You received this email because you registered on Mingle.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
