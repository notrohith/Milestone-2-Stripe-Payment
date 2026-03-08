public class TestFormatting {
    public static void main(String[] args) {
        String s = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Ride Approved!</title>
</head>
<body style="margin:0;padding:0;background:#fdf4ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#fdf4ff;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(168,85,247,.15);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#7e22ce 0%%,#d946ef 60%%,#f472b6 100%%);padding:48px 40px 40px;text-align:center;">
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:24px;">
          <div style="display:inline-block;background:rgba(255,255,255,.2);border-radius:16px;padding:12px 28px;backdrop-filter:blur(10px);">
            <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-.5px;">Co<span style="color:#fbcfe8;">Ride</span></span>
          </div>
        </td></tr>
        <tr><td align="center">
          <div style="width:80px;height:80px;background:#fff;border-radius:50%%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 8px 32px rgba(0,0,0,.2);">
            <span style="font-size:42px;color:#d946ef;">&#x1F697;</span>
          </div>
          <h1 style="color:#fff;font-size:32px;font-weight:800;margin:0 0 12px;">Driver Approved! &#x1F4B3;</h1>
          <p style="color:#fdf4ff;font-size:16px;font-weight:500;margin:0;opacity:0.9;">Complete payment to secure your seat</p>
        </td></tr>
      </table>
    </td>
  </tr>

  <!-- Greeting -->
  <tr><td style="padding:40px 40px 0;">
    <p style="font-size:18px;color:#1e293b;font-weight:700;margin:0 0 12px;">Hi %s! &#x1F44B;</p>
    <p style="font-size:16px;color:#475569;line-height:1.6;margin:0 0 32px;">
      Great news! <strong>%s</strong> has approved your ride request. <strong>Please complete your payment</strong> to officially confirm your seat — it won't be held until payment is received.</p>
  </td></tr>

  <!-- Ride Details Card -->
  <tr><td style="padding:0 40px 32px;">
    <div style="background:#faf5ff;border:2px solid #e9d5ff;border-radius:20px;padding:32px;">
      <p style="font-size:13px;font-weight:800;color:#9333ea;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 24px;">Trip Details</p>
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:24px;">
            <p style="font-size:13px;color:#7e22ce;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">&#x1F7E2; Pick-up</p>
            <p style="font-size:20px;color:#0f172a;font-weight:800;margin:0;">%s</p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px;">
            <p style="font-size:13px;color:#be185d;margin:0 0 6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">&#x1F534; Drop-off</p>
            <p style="font-size:20px;color:#0f172a;font-weight:800;margin:0;">%s</p>
          </td>
        </tr>
        <tr>
          <td>
            <div style="background:#fff;padding:16px 20px;border-radius:12px;border:1px solid #e9d5ff;display:inline-block;">
              <p style="font-size:12px;color:#6b21a8;margin:0 0 4px;font-weight:700;text-transform:uppercase;">&#x1F4C5; Departure Time</p>
              <p style="font-size:16px;color:#1e293b;font-weight:800;margin:0;">%s</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </td></tr>

  <!-- Next Steps -->
  <tr><td style="padding:0 40px 40px;">
    <div style="background:#f8fafc;border-radius:16px;padding:28px;">
      <p style="font-size:14px;font-weight:800;color:#0f172a;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">What's Next?</p>
      <table cellpadding="0" cellspacing="0" width="100%%">
        <tr><td style="padding-bottom:16px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:16px;vertical-align:top;"><span style="font-size:20px;">&#x1F4AC;</span></td>
            <td style="vertical-align:middle;"><p style="font-size:15px;color:#334155;margin:0;line-height:1.5;">Check the app for your driver's exact pickup location</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="vertical-align:top;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:16px;vertical-align:top;"><span style="font-size:20px;">&#x23F0;</span></td>
            <td style="vertical-align:middle;"><p style="font-size:15px;color:#334155;margin:0;line-height:1.5;">Please arrive 5 minutes early to keep the ride on schedule</p></td>
          </tr></table>
        </td></tr>
      </table>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 48px;text-align:center;">
    <a href="http://localhost:3000/my-rides" style="display:inline-block;background:linear-gradient(135deg,#c026d3,#9333ea);color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:18px 48px;border-radius:50px;box-shadow:0 8px 24px rgba(192,38,211,.3);text-transform:uppercase;letter-spacing:1px;">
      View Your Ride &#x1F680;
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>
  <tr><td style="padding:32px 40px;text-align:center;">
    <p style="font-size:14px;color:#94a3b8;margin:0 0 8px;">Safe travels!</p>
    <p style="font-size:14px;color:#64748b;font-weight:600;margin:0;">The CoRide Team &#x1F49C;</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
""".formatted("rider", "driver", "source", "dest", "time");
        System.out.println("SUCCESS!");
    }
}
