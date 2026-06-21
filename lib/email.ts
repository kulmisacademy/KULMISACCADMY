import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${otp} — Kulmis Academy verification code`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#12121C;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">

        <!-- Header -->
        <tr>
          <td style="padding:32px 36px 24px;border-bottom:1px solid rgba(255,255,255,0.07)">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:38px;height:38px;background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:10px;text-align:center;vertical-align:middle">
                  <span style="color:#fff;font-size:18px;font-weight:900;line-height:38px">K</span>
                </td>
                <td style="padding-left:12px;font-size:16px;font-weight:700;color:#fff;vertical-align:middle">
                  Kulmis Academy
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px">
            <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em">
              Hi ${name.split(' ')[0]} 👋
            </p>
            <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6">
              Use the code below to verify your email address and complete your registration.
              This code expires in <strong style="color:rgba(255,255,255,0.75)">10 minutes</strong>.
            </p>

            <!-- OTP Box -->
            <div style="background:rgba(99,102,241,0.1);border:1.5px solid rgba(99,102,241,0.4);border-radius:16px;padding:24px;text-align:center;margin-bottom:28px">
              <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#818CF8;font-family:'Courier New',monospace">
                ${otp}
              </div>
              <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:10px;letter-spacing:0.05em;text-transform:uppercase">
                Verification Code
              </div>
            </div>

            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.3);line-height:1.6">
              If you didn't create an account, you can safely ignore this email.
              Never share this code with anyone.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 36px 24px;border-top:1px solid rgba(255,255,255,0.07)">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);text-align:center">
              © ${new Date().getFullYear()} Kulmis Academy · kulmisacademy.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
