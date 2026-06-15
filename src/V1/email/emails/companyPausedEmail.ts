export const companyPausedEmail = (companyEmail: string,companyName: string, reason?: string) => ({
  toMail: companyEmail,
  subject: 'Your Account Has Been Paused — S3 Tracking System',

  message: `
Hi ${companyName},

Your S3 Tracking System account has been paused by the administration team.

During this period, access to the dashboard and system features has been restricted.

${reason ? `Reason: ${reason}` : ''}

If you believe this is a mistake or would like to request reactivation, please contact our support team.

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
        Account Paused
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${companyName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        We would like to inform you that your account has been temporarily paused by the S3 Tracking System administration team.
      </p>

      <!-- Status Box -->
      <div style="margin:20px 0;padding:15px;background:#fff7ed;border-left:4px solid #f59e0b;border-radius:6px;">
        <strong style="color:#d97706;">Status:</strong>
        <span style="color:#7c2d12;">Pause</span>
      </div>

      ${
        reason
          ? `
      <div style="margin:20px 0;padding:15px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;">
        <strong style="color:#b91c1c;">Reason:</strong>
        <span style="color:#7f1d1d;">${reason}</span>
      </div>
      `
          : ''
      }

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        During this period, access to your dashboard, shipment tracking, and system features has been temporarily restricted.
      </p>

      <p style="font-size:14px;color:#4b5563;">
        If you believe this action was taken in error or you would like to request reactivation, please contact our support team.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;">
          We’re here to help you resolve any issues and restore access as soon as possible.
        </p>
        <p style="font-weight:bold;color:#111827;">
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
