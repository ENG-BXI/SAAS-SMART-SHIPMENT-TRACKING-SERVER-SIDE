export const driverAssignedShipmentEmail = (
  driverEmail: string,
  driverName: string,
  shipment: {
    id: string;
    shipmentNumber: string;
    launchDate: Date;
    way: { name: string };
  },
) => ({
  toMail: driverEmail,
  subject: `New Shipment Assignment — #${shipment.shipmentNumber}`,

  message: `
Hi ${driverName},

You have been assigned to a new shipment.

Shipment Number: ${shipment.shipmentNumber}
Route: ${shipment.way.name}
Launch Date: ${shipment.launchDate}

Please follow the instructions provided by your operations team.

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
        New Shipment Assigned 🚚
      </h2>

      <p style="font-size:14px;color:#374151;">
        Hi <b>${driverName}</b>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;">
        You have been assigned to a new shipment. Please review the details below and follow the operational instructions provided by your dispatcher.
      </p>

      <!-- Shipment Info -->
      <div style="margin:20px 0;padding:15px;background:#f1f5f9;border-left:4px solid #3b82f6;border-radius:6px;">
        <p style="margin:5px 0;"><b>Shipment #:</b> ${shipment.shipmentNumber}</p>
        <p style="margin:5px 0;"><b>Route:</b> ${shipment.way.name}</p>
        <p style="margin:5px 0;"><b>Launch Date:</b> ${new Date(shipment.launchDate).toLocaleString()}</p>
      </div>

      <!-- Status -->
      <div style="margin:20px 0;padding:15px;background:#ecfdf5;border-left:4px solid #10b981;border-radius:6px;">
        <strong style="color:#059669;">Status:</strong>
        <span style="color:#065f46;">Assigned ✓</span>
      </div>

      <!-- Instruction Box -->
      <div style="margin:20px 0;padding:15px;background:#fff7ed;border-left:4px solid #f59e0b;border-radius:6px;">
        <strong style="color:#d97706;">Important:</strong>
        <span style="color:#7c2d12;">
          Please wait for confirmation from your operations team before starting the trip.
        </span>
      </div>

      <p style="font-size:14px;color:#4b5563;line-height:1.7;text-align:center;">
        Ensure readiness and follow all assigned instructions carefully.
      </p>

      <div style="margin-top:25px;">
        <p style="font-size:13px;color:#64748b;text-align:center;">
          Safe driving 🚛
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
