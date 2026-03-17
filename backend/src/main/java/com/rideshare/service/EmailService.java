package com.rideshare.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a beautiful HTML approval email via Google SMTP.
     *
     * @param toEmail     recipient email address
     * @param name        recipient's display name
     * @param tempPassword the temporary password for first login
     * @param loginUrl    the URL for logging in (e.g. http://localhost:3000/login)
     */
    public void sendApprovalEmail(String toEmail, String name, String tempPassword, String loginUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("CoRide <" + fromEmail + ">");
            helper.setTo(toEmail);
            helper.setSubject("\uD83C\uDF89 You are approved! Your CoRide login details");
            helper.setText(buildText(name, toEmail, tempPassword, loginUrl), false);
            helper.setText(buildHtml(name, toEmail, tempPassword, loginUrl), true);

            mailSender.send(message);
            System.out.println("Approval email sent successfully via Google SMTP to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send approval email via Google SMTP: " + e.getMessage());
            printMockEmail(toEmail, tempPassword, loginUrl);
        }
    }

    private void printMockEmail(String toEmail, String tempPassword, String loginUrl) {
        System.out.println("\n========== MOCK EMAIL SENT ==========");
        System.out.println("To: " + toEmail);
        System.out.println("Subject: You are approved! Your CoRide login details");
        System.out.println("Temporary Password: [HIDDEN FOR SECURITY]");
        System.out.println("Login URL: " + loginUrl);
        System.out.println("=====================================\n");
    }

    public void sendRideApprovalEmail(String toEmail, String riderName, String source, String dest, String time, String driverName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("CoRide <" + fromEmail + ">");
            helper.setTo(toEmail);
            helper.setSubject("\uD83C\uDF89 Your ride request has been approved!");
            helper.setText(buildRideApprovalHtml(riderName, source, dest, time, driverName), true);

            mailSender.send(message);
            System.out.println("Ride approval email sent successfully via Google SMTP to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send ride approval email via Google SMTP: " + e.getMessage());
            System.out.println("\n========== MOCK RIDE APPROVAL EMAIL SENT ==========");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: \uD83C\uDF89 Your ride request has been approved!");
            System.out.println("Message: Your ride from " + source + " to " + dest + " has been approved by " + driverName);
            System.out.println("===================================================\n");
        }
    }

    public void sendDriverBookingNotification(String driverEmail, String driverName,
                                               String riderName, String riderEmail,
                                               String source, String dest, String time) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("CoRide <" + fromEmail + ">");
            helper.setTo(driverEmail);
            helper.setSubject("\uD83D\uDE97 New Ride Request from " + riderName);
            helper.setText(buildDriverNotificationHtml(driverName, riderName, riderEmail, source, dest, time), true);
            mailSender.send(message);
            System.out.println("Driver notification email sent to " + driverEmail);
        } catch (Exception e) {
            System.err.println("Failed to send driver notification email: " + e.getMessage());
            System.out.println("\n=== MOCK DRIVER NOTIFICATION ==="
                    + "\nTo: " + driverEmail
                    + "\nRider: " + riderName + " (" + riderEmail + ")"
                    + "\nRoute: " + source + " → " + dest
                    + "\n================================\n");
        }
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom("CoRide <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            mailSender.send(message);
            System.out.println("Simple email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send simple email: " + e.getMessage());
        }
    }

    private static String buildDriverNotificationHtml(String driverName, String riderName,
                                                       String riderEmail, String source,
                                                       String dest, String time) {
        return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New Ride Request</title>
</head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(99,102,241,.15);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#4f46e5 0%%,#7c3aed 60%%,#9333ea 100%%);padding:48px 40px 40px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,.2);border-radius:16px;padding:12px 28px;margin-bottom:24px;">
        <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-.5px;">Co<span style="color:#c4b5fd;">Ride</span></span>
      </div>
      <div style="width:80px;height:80px;background:#fff;border-radius:50%%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <span style="font-size:40px;">&#x1F46E;</span>
      </div>
      <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0 0 10px;">New Ride Request!</h1>
      <p style="color:#e0e7ff;font-size:15px;margin:0;opacity:0.9;">Someone wants to join your ride</p>
    </td>
  </tr>

  <!-- Body -->
  <tr><td style="padding:40px 40px 0;">
    <p style="font-size:18px;color:#1e293b;font-weight:700;margin:0 0 8px;">Hi %s! &#x1F44B;</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 32px;">
      <strong>%s</strong> has requested to join your ride. Head to your <strong>My Rides</strong> dashboard to approve or reject this request.
    </p>
  </td></tr>

  <!-- Rider Card -->
  <tr><td style="padding:0 40px 32px;">
    <div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:20px;padding:28px;">
      <p style="font-size:12px;font-weight:800;color:#7c3aed;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 20px;">Rider Details</p>
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:16px;">
          <p style="font-size:13px;color:#6d28d9;margin:0 0 4px;font-weight:700;">&#x1F464; Name</p>
          <p style="font-size:18px;color:#0f172a;font-weight:800;margin:0;">%s</p>
        </td></tr>
        <tr><td style="padding-bottom:16px;">
          <p style="font-size:13px;color:#6d28d9;margin:0 0 4px;font-weight:700;">&#x1F4E7; Email</p>
          <p style="font-size:15px;color:#334155;font-weight:600;margin:0;">%s</p>
        </td></tr>
      </table>
    </div>
  </td></tr>

  <!-- Trip Info -->
  <tr><td style="padding:0 40px 32px;">
    <div style="background:#f8fafc;border-radius:16px;padding:24px;">
      <p style="font-size:12px;font-weight:800;color:#0f172a;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 16px;">Your Ride</p>
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:16px;">
            <p style="font-size:12px;color:#7c3aed;margin:0 0 4px;font-weight:700;">&#x1F7E2; FROM</p>
            <p style="font-size:16px;color:#0f172a;font-weight:800;margin:0;">%s</p>
          </td>
          <td>
            <p style="font-size:12px;color:#be185d;margin:0 0 4px;font-weight:700;">&#x1F534; TO</p>
            <p style="font-size:16px;color:#0f172a;font-weight:800;margin:0;">%s</p>
          </td>
        </tr>
        <tr><td colspan="2" style="padding-top:16px;">
          <p style="font-size:12px;color:#64748b;margin:0 0 4px;font-weight:700;">&#x1F4C5; DEPARTURE</p>
          <p style="font-size:15px;color:#1e293b;font-weight:600;margin:0;">%s</p>
        </td></tr>
      </table>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 48px;text-align:center;">
    <a href="http://localhost:3000/my-rides" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:18px 48px;border-radius:50px;box-shadow:0 8px 24px rgba(79,70,229,.35);text-transform:uppercase;letter-spacing:1px;">
      Review Request &#x1F680;
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>
  <tr><td style="padding:28px 40px;text-align:center;">
    <p style="font-size:13px;color:#94a3b8;margin:0 0 6px;">The CoRide Team &#x1F49C;</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>""".formatted(driverName, riderName, riderName, riderEmail, source, dest, time);
    }

    private static String buildRideApprovalHtml(String riderName, String source, String dest, String time, String driverName) {
        return """
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
</html>""".formatted(riderName, driverName, source, dest, time);
    }

    // ── Template helpers ────────────────────────────────────────────────────

    private static String buildText(String name, String email, String tempPassword, String loginUrl) {
        return """
                Hi %s,
                
                Great news — your CoRide registration has been approved!
                
                Your login credentials:
                  Email:              %s
                  Temporary Password: %s
                
                Log in here: %s
                
                You will be asked to set a new secure password on your first login.
                
                — The CoRide Team
                """.formatted(name, email, tempPassword, loginUrl);
    }

    private static String buildHtml(String name, String email, String tempPassword, String loginUrl) {
        return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to CoRide</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.10);">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f172a 0%%,#1e3a5f 60%%,#0369a1 100%%);padding:48px 40px 36px;text-align:center;">
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:20px;">
          <div style="display:inline-block;background:rgba(255,255,255,.12);border-radius:16px;padding:12px 28px;">
            <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-.5px;">Co<span style="color:#38bdf8;">Ride</span></span>
          </div>
        </td></tr>
        <tr><td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 4px 20px rgba(34,197,94,.35);">
            <span style="font-size:38px;line-height:72px;display:block;color:#fff;">&#10003;</span>
          </div>
          <h1 style="color:#fff;font-size:28px;font-weight:800;margin:0 0 10px;">You're Approved! &#127881;</h1>
          <p style="color:#bae6fd;font-size:15px;margin:0;">Your CoRide account is ready to go</p>
        </td></tr>
      </table>
    </td>
  </tr>

  <!-- Greeting -->
  <tr><td style="padding:36px 40px 0;">
    <p style="font-size:17px;color:#1e293b;font-weight:600;margin:0 0 8px;">Hi %s &#128075;</p>
    <p style="font-size:15px;color:#64748b;line-height:1.7;margin:0 0 24px;">
      Your CoRide registration has been <strong style="color:#16a34a;">reviewed and approved</strong> by our admin team.
      Log in below and start your journey!
    </p>
  </td></tr>

  <!-- Credentials Card -->
  <tr><td style="padding:0 40px 28px;">
    <div style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1.5px solid #bae6fd;border-radius:16px;padding:28px;">
      <p style="font-size:12px;font-weight:700;color:#0369a1;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 18px;">Your Login Credentials</p>
      <table width="100%%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:16px;">
          <p style="font-size:12px;color:#64748b;margin:0 0 5px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;">&#128231; Email Address</p>
          <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0;font-family:monospace;background:#fff;padding:10px 14px;border-radius:8px;border:1px solid #e0f2fe;">%s</p>
        </td></tr>
        <tr><td>
          <p style="font-size:12px;color:#64748b;margin:0 0 5px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;">&#128273; Temporary Password</p>
          <p style="font-size:17px;color:#0f172a;font-weight:800;margin:0;font-family:'Courier New',monospace;background:#fff;padding:12px 14px;border-radius:8px;border:2px dashed #38bdf8;letter-spacing:2px;">%s</p>
        </td></tr>
      </table>
    </div>
  </td></tr>

  <!-- Warning -->
  <tr><td style="padding:0 40px 28px;">
    <div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;padding:14px 18px;">
      <p style="font-size:13px;color:#92400e;font-weight:700;margin:0 0 4px;">&#9888;&#65039; Change your password on first login</p>
      <p style="font-size:13px;color:#92400e;margin:0;line-height:1.5;">For your security, you will be asked to set a new password immediately after logging in with this temporary one.</p>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 40px 36px;text-align:center;">
    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#0369a1,#0f172a);color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:50px;box-shadow:0 6px 24px rgba(3,105,161,.35);">
      &#128640;&nbsp;&nbsp;Log In to CoRide
    </a>
    <p style="font-size:12px;color:#94a3b8;margin:14px 0 0;">Or copy this link: <a href="%s" style="color:#0369a1;">%s</a></p>
  </td></tr>

  <!-- Steps -->
  <tr><td style="padding:0 40px 36px;">
    <div style="background:#f8fafc;border-radius:14px;padding:24px;">
      <p style="font-size:13px;font-weight:700;color:#1e293b;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Getting Started</p>
      <table cellpadding="0" cellspacing="0" width="100%%">
        <tr><td style="padding-bottom:12px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;vertical-align:top;"><div style="width:28px;height:28px;background:#0369a1;border-radius:50%%;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:800;">1</div></td>
            <td style="vertical-align:middle;"><p style="font-size:14px;color:#475569;margin:0;line-height:1.5;">Log in with your temporary password</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding-bottom:12px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;vertical-align:top;"><div style="width:28px;height:28px;background:#7c3aed;border-radius:50%%;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:800;">2</div></td>
            <td style="vertical-align:middle;"><p style="font-size:14px;color:#475569;margin:0;line-height:1.5;">Set a new secure password when prompted</p></td>
          </tr></table>
        </td></tr>
        <tr><td style="vertical-align:top;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;vertical-align:top;"><div style="width:28px;height:28px;background:#16a34a;border-radius:50%%;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:800;">3</div></td>
            <td style="vertical-align:middle;"><p style="font-size:14px;color:#475569;margin:0;line-height:1.5;">Complete your profile and start riding!</p></td>
          </tr></table>
        </td></tr>
      </table>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>
  <tr><td style="padding:28px 40px;text-align:center;">
    <p style="font-size:13px;color:#94a3b8;margin:0 0 6px;">This email was sent to <strong>%s</strong></p>
    <p style="font-size:12px;color:#cbd5e1;margin:0;">&#169; 2026 CoRide &nbsp;&#183;&nbsp; Safe, smart, shared journeys</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>""".formatted(name, email, tempPassword, loginUrl, loginUrl, loginUrl, email);
    }
}
