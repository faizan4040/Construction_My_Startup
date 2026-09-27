export const accountUnblockedEmail = ({ shopOwnerName, shopName }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background:#f5f5f5;margin:0;padding:50px 0;font-family:Tahoma,Verdana,Segoe,sans-serif;">
  <table align="center" width="500" style="background:#fff;border-radius:8px;padding:24px;">
    <tr><td>
      <h1 style="text-align:center;color:#155b2c;font-size:22px;">Account Restored</h1>
      <p style="font-size:14px;color:#393d47;line-height:1.6;">Hi ${shopOwnerName},</p>
      <p style="font-size:14px;color:#393d47;line-height:1.6;">
        Good news — your shop <b>${shopName}</b> has been reviewed and your account access has been
        fully restored. You can log in and continue managing your store normally.
      </p>
      <p style="font-size:14px;color:#393d47;line-height:1.6;">
        Thank you for your patience, and please continue to follow ConstructEzy's seller guidelines.
      </p>
      <p style="text-align:center;color:#393d47;font-size:13px;margin-top:24px;">Thank you,<br/>ConstructEzy Team</p>
    </td></tr>
  </table>
</body>
</html>`