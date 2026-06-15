export const companyActivatedEmail = (
  companyEmail: string,
  companyName: string,
  domain: string,
) => ({
  toMail: companyEmail,
  subject: 'Your Account Has Been Activated — S3 Tracking System',

  message: `
Hi ${companyName},

Good news 🎉

Your S3 Tracking System account has been successfully activated.

You now have full access to your dashboard and all system features.

Login here:
${domain}/login

Welcome back.

Best regards,
S3 Tracking System Team
  `,

  html: `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:40px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0f172a;padding:20px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;">
        📦 S3 Tracking System
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:30px;">

      <h2 style="color:#111827;margin-bottom:10px;">
        Account Activated 🎉
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${companyName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        We’re happy to inform you that your account has been successfully activated by the S3 Tracking System administration team.
      </p>

      <!-- Status -->
      <div style="margin:20px 0;padding:15px;background:#ecfdf5;border-left:4px solid #10b981;border-radius:6px;">
        <strong style="color:#059669;">Status:</strong>
        <span style="color:#065f46;"> Active ✓</span>
      </div>

      <!-- Login Button -->
      <div style="text-align:center;margin:30px 0;">
        <a href="${domain}/login"
           style="
              background:#16a34a;
              color:#ffffff;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
              font-weight:bold;
              display:inline-block;
           ">
          🚀 Go to Dashboard
        </a>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;text-align:center;">
        You now have full access to your dashboard, shipment tracking tools, and all platform features.
      </p>

      <p style="font-size:14px;color:#4b5563;">
        You can continue using S3 Tracking System without any restrictions.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;text-align:center;">
          Welcome back — we’re glad to have you with us 🚀
        </p>
        <p style="font-weight:bold;color:#111827;text-align:center;">
          S3 Tracking System Team
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:15px;text-align:center;font-size:12px;color:#94a3b8;">
      © ${new Date().getFullYear()} S3 Tracking System. All rights reserved.
    </div>

  </div>
</div>
  `,
});
