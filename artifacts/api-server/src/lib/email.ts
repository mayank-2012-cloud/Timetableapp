import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  const { data, error } = await resend.emails.send({
    from: "SchoolSync <onboarding@resend.dev>",
    to,
    subject: "Reset your SchoolSync password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
            <div style="background: #1e3a5f; padding: 28px 32px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">SchoolSync</h1>
              <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Timetable Management</p>
            </div>
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin-top: 0;">Hi ${name},</p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your SchoolSync administrator account.
                Click the button below to set a new password.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="background: #3b82f6; color: #fff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #d1d5db; font-size: 12px; text-align: center; margin: 0;">
                If the button above doesn't work, copy this link:<br />
                <a href="${resetLink}" style="color: #93c5fd; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}
