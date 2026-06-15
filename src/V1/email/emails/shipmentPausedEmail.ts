export const shipmentPausedEmail = (
  clientEmail: string,
  clientName: string,
  shipment: {
    id: string;
    shipmentNumber: string;
  },
  clientId: string,
  domain: string,
  reason?: string,
) => ({
  toMail: clientEmail,

  subject: `Shipment Temporarily Paused — #${shipment.shipmentNumber}`,

  message: `
Hi ${clientName},

We would like to inform you that your shipment (#${shipment.shipmentNumber}) has been temporarily paused.

${reason ? `Reason: ${reason}` : ''}

You can check the latest shipment details here:
${domain}/c/${clientId}/i/${shipment.id}

We appreciate your patience and will notify you of any updates.

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
        Shipment Temporarily Paused ⏸
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${clientName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        We would like to inform you that your shipment has been temporarily paused.
        This pause may be due to operational scheduling, route adjustments, or temporary logistics reasons.
      </p>

      <!-- Shipment Info -->
      <div style="margin:20px 0;padding:15px;background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:6px;">
        <p style="margin:5px 0;">
          <b>Shipment #:</b>
          ${shipment.shipmentNumber}
        </p>
      </div>

      <!-- Status -->
      <div style="margin:20px 0;padding:15px;background:#fff7ed;border-left:4px solid #f59e0b;border-radius:6px;">
        <strong style="color:#d97706;">Status:</strong>
        <span style="color:#7c2d12;">Paused ⏸</span>
      </div>

      ${
        reason
          ? `
      <!-- Reason -->
      <div style="margin:20px 0;padding:15px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;">
        <strong style="color:#b91c1c;">Reason:</strong>
        <span style="color:#7f1d1d;">${reason}</span>
      </div>
      `
          : ''
      }

      <!-- CTA -->
      <div style="text-align:center;margin:30px 0;">
        <a href="${domain}/c/${clientId}/i/${shipment.id}"
           style="
              background:#2563eb;
              color:#ffffff;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
              font-weight:bold;
              display:inline-block;
           ">
          🔍 Track Shipment
        </a>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;text-align:center;">
        You can check the latest shipment updates and tracking details anytime.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;text-align:center;">
          Thank you for your patience 🚚
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
