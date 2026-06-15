export const newUserCreatedEmail = (
  userEmail: string,
  userName: string,
  role: string,
  domain: string,
) => ({
  toMail: userEmail,
  subject: 'Welcome to S3 Tracking System — Your Account is Ready',

  message: `
Hi ${userName},

Welcome to S3 Tracking System 🎉

Your account has been created by your organization administrator.

Role: ${role}

You can now log in and start using the system immediately:
${domain}/login

If you have any questions, please contact your administrator.

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
        Welcome Aboard 🎉
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${userName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        Your account has been successfully created by your organization administrator on S3 Tracking System.
        You are now officially part of the system.
      </p>

      <!-- Role Box -->
      <div style="margin:20px 0;padding:15px;background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:6px;">
        <strong style="color:#1d4ed8;">Your Role:</strong>
        <span style="color:#334155;">${role}</span>
      </div>

      <!-- Status -->
      <div style="margin:20px 0;padding:15px;background:#ecfdf5;border-left:4px solid #10b981;border-radius:6px;">
        <strong style="color:#059669;">Status:</strong>
        <span style="color:#065f46;"> Active ✓</span>
      </div>

      <!-- Login Button -->
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
          🚀 Go to Dashboard
        </a>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;text-align:center;">
        You can now log in and start working based on your assigned role permissions.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;text-align:center;">
          Welcome to the team 🚀
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
