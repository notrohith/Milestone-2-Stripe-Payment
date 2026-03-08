/**
 * Generates a beautiful HTML approval email for CoRide.
 * Sent when an admin approves a new user registration.
 */
export const buildApprovalEmail = ({ name, email, tempPassword, loginUrl }) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to CoRide</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
          
          <!-- Header Gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0369a1 100%);padding:48px 40px 36px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <!-- Logo / Brand -->
                    <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:16px;padding:12px 28px;">
                      <span style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Co<span style="color:#38bdf8;">Ride</span></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- Checkmark circle -->
                    <div style="width:72px;height:72px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 4px 20px rgba(34,197,94,0.35);">
                      <span style="font-size:34px;line-height:72px;display:block;">✓</span>
                    </div>
                    <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 10px;letter-spacing:-0.3px;">You're Approved! 🎉</h1>
                    <p style="color:#bae6fd;font-size:15px;margin:0;font-weight:400;">Your CoRide account is ready to go</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="font-size:17px;color:#1e293b;font-weight:600;margin:0 0 8px;">Hi ${name} 👋</p>
              <p style="font-size:15px;color:#64748b;line-height:1.7;margin:0 0 24px;">
                Great news — your CoRide registration has been <strong style="color:#16a34a;">reviewed and approved</strong> by our admin team.
                You can now log in and start your journey with us!
              </p>
            </td>
          </tr>

          <!-- Credentials Card -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);border:1.5px solid #bae6fd;border-radius:16px;padding:28px;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:rgba(56,189,248,0.08);border-radius:50%;"></div>
                <p style="font-size:12px;font-weight:700;color:#0369a1;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 18px;">Your Login Credentials</p>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:16px;">
                      <p style="font-size:12px;color:#64748b;margin:0 0 5px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">📧 Email Address</p>
                      <p style="font-size:15px;color:#0f172a;font-weight:700;margin:0;font-family:monospace;background:#ffffff;padding:10px 14px;border-radius:8px;border:1px solid #e0f2fe;">${email}</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="font-size:12px;color:#64748b;margin:0 0 5px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">🔑 Temporary Password</p>
                      <p style="font-size:17px;color:#0f172a;font-weight:800;margin:0;font-family:'Courier New',monospace;background:#ffffff;padding:12px 14px;border-radius:8px;border:2px dashed #38bdf8;letter-spacing:2px;">${tempPassword}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Warning Banner -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;padding:14px 18px;display:flex;align-items:flex-start;">
                <span style="font-size:18px;margin-right:10px;">⚠️</span>
                <div>
                  <p style="font-size:13px;color:#92400e;font-weight:700;margin:0 0 4px;">Change your password on first login</p>
                  <p style="font-size:13px;color:#92400e;margin:0;line-height:1.5;">For your security, you'll be asked to set a new password immediately after logging in with this temporary one.</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#0369a1,#0f172a);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:50px;box-shadow:0 6px 24px rgba(3,105,161,0.35);letter-spacing:0.2px;">
                🚀 &nbsp;Log In to CoRide
              </a>
              <p style="font-size:12px;color:#94a3b8;margin:14px 0 0;">Or paste this link: <a href="${loginUrl}" style="color:#0369a1;">${loginUrl}</a></p>
            </td>
          </tr>

          <!-- Steps -->
          <tr>
            <td style="padding:0 40px 36px;">
              <div style="background:#f8fafc;border-radius:14px;padding:24px;">
                <p style="font-size:13px;font-weight:700;color:#1e293b;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Getting Started</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${[
            ['1', '#0369a1', 'Log in with your temporary password'],
            ['2', '#7c3aed', 'Set a new secure password when prompted'],
            ['3', '#16a34a', 'Complete your profile and start riding!'],
        ].map(([num, color, text]) => `
                  <tr>
                    <td style="padding-bottom:12px;vertical-align:top;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right:14px;vertical-align:top;">
                            <div style="width:28px;height:28px;background:${color};border-radius:50%;text-align:center;line-height:28px;color:#fff;font-size:13px;font-weight:800;">${num}</div>
                          </td>
                          <td style="vertical-align:middle;">
                            <p style="font-size:14px;color:#475569;margin:0;line-height:1.5;">${text}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`).join('')}
                </table>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><div style="height:1px;background:#e2e8f0;"></div></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;text-align:center;">
              <p style="font-size:13px;color:#94a3b8;margin:0 0 6px;">This email was sent to <strong>${email}</strong></p>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 12px;">Questions? Reply to this email — we're happy to help.</p>
              <p style="font-size:12px;color:#cbd5e1;margin:0;">
                © 2026 CoRide &nbsp;·&nbsp; Safe, smart, shared journeys
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = `
Hi ${name},

Your CoRide account has been approved!

Login: ${loginUrl}
Email: ${email}
Temporary Password: ${tempPassword}

Please change your password immediately after logging in.

— The CoRide Team
`;

    return { html, text };
};
