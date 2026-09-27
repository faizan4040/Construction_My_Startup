export const accountBlockedEmail = ({ shopOwnerName, shopName, reason }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#f5f5f5;margin:0;padding:50px 0;font-family:Tahoma,Verdana,Segoe,sans-serif;">
  <table align="center" width="500" style="background:#fff;border-radius:8px;padding:24px;">
    <tr><td>
      <h1 style="text-align:center;color:#c0392b;font-size:22px;">Account Suspended</h1>
      <p style="font-size:14px;color:#393d47;line-height:1.6;">Hi ${shopOwnerName},</p>
      <p style="font-size:14px;color:#393d47;line-height:1.6;">
        Your shop <b>${shopName}</b> on ConstructEzy has been temporarily suspended by our team.
      </p>
      <div style="background:#fdf2f2;border-left:3px solid #c0392b;padding:12px 16px;margin:16px 0;">
        <p style="font-size:13px;color:#393d47;margin:0;"><b>Reason:</b> ${reason || "Violation of platform policies."}</p>
      </div>
      <p style="font-size:14px;color:#393d47;line-height:1.6;">
        If you believe this was a mistake, or would like to appeal, please reply to this email
        explaining your side. Our team will review your request.
      </p>
      <p style="text-align:center;color:#393d47;font-size:13px;margin-top:24px;">Thank you,<br/>ConstructEzy Team</p>
    </td></tr>
  </table>
</body>
</html>`