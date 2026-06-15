export const subscriptionUpgradeApprovedEmail = (
  companyEmail: string,
  companyName: string,
  domain: string,
  oldPlan?: string,
  newPlan?: string,
) => ({
  toMail: companyEmail,
  subject: 'Your Subscription Upgrade Has Been Approved — S3 Tracking System',

  message: `
Hi ${companyName},

Great news 🎉

Your subscription upgrade request has been approved successfully.

${oldPlan && newPlan ? `Your plan has been upgraded from ${oldPlan} to ${newPlan}.` : ''}

You can now log in to view your updated plan and features:
${domain}/login

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
        Subscription Upgrade Approved 🚀
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${companyName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        We’re pleased to inform you that your subscription upgrade request has been approved by the S3 Tracking System administration team.
      </p>

      <!-- Plan Change -->
      ${
        oldPlan && newPlan
          ? `
      <div style="margin:20px 0;padding:15px;background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:6px;">
        <strong style="color:#1d4ed8;">Plan Updated:</strong><br/>
        <span style="color:#334155;">${oldPlan} → <b>${newPlan}</b></span>
      </div>
      `
          : ''
      }

      <!-- Status -->
      <div style="margin:20px 0;padding:15px;background:#ecfdf5;border-left:4px solid #10b981;border-radius:6px;">
        <strong style="color:#059669;">Status:</strong>
        <span style="color:#065f46;"> Active ✓</span>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin:30px 0;">
        <a href="${domain}/login"
           style="
              background:#2563eb;
              color:#ffffff;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
              font-weight:bold;
              display:inline-block;
           ">
          🔐 View Your Updated Plan
        </a>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;text-align:center;">
        All new features and limits associated with your updated plan are now active. You can continue using the platform without interruption.
      </p>

      <p style="font-size:14px;color:#4b5563;">
        Thank you for upgrading your subscription — we truly appreciate your trust in S3 Tracking System.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;text-align:center;">
          Upgrade successful 🚀
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
