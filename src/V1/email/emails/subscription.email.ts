export const subscriptionEmail = (companyEmail: string,companyName: string) => ({
  toMail: companyEmail,
  subject: 'We’ve Received Your Subscription Request — S3 Tracking System',

  message: `
Hi ${companyName},

We’ve successfully received your subscription request for S3 Tracking System.

Our team is currently reviewing your company details and verifying the information provided.

You will receive an email notification once your account has been approved and activated.

Thank you for choosing S3 Tracking System.

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
        Subscription Under Review
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${companyName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        We’ve successfully received your subscription request and our system has automatically forwarded it to our review team.
      </p>

      <!-- Status Box -->
      <div style="margin:20px 0;padding:15px;background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:6px;">
        <strong style="color:#1d4ed8;">Status:</strong>
        <span style="color:#334155;">Under Review ⏳</span>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        Once your company verification is complete, your account will be activated and you will gain full access to S3 Tracking System dashboard.
      </p>

      <p style="font-size:14px;color:#4b5563;">
        You will be notified immediately once the review process is completed.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;">
          Thank you for trusting our platform.
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
