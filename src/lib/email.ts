import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailParams {
    to: string;
    fullName: string;
    verificationToken: string;
}

export async function sendVerificationEmail({ to, fullName, verificationToken }: SendVerificationEmailParams) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.SEND_FROM_EMAIL || 'PortalKajian <noreply@portalkajian.online>',
            to,
            subject: 'Verifikasi Email - PortalKajian.online',
            html: `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">PortalKajian.online</h1>
                            <p style="margin: 10px 0 0; color: #e0f2f1; font-size: 14px;">Jadwal Kajian Ilmiah Terpercaya</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.6;">
                                <strong>Assalamu'alaikum warahmatullahi wabarakatuh,</strong>
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                Terima kasih <strong>${fullName}</strong> sudah mendaftar sebagai kontributor di <strong>PortalKajian.online</strong>!
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px;">
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);">
                                            ✉️ Verifikasi Email Saya
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                Jika tombol tidak berfungsi, copy dan paste link berikut ke browser Anda:
                            </p>
                            <p style="margin: 0 0 30px; color: #0d9488; font-size: 13px; word-break: break-all;">
                                <a href="${verificationUrl}" style="color: #0d9488; text-decoration: underline;">${verificationUrl}</a>
                            </p>
                            
                            <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 30px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                                    ⏰ <strong>Link akan expired dalam 24 jam.</strong>
                                </p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                                Jika Anda tidak mendaftar di PortalKajian.online, abaikan email ini.
                            </p>
                            
                            <p style="margin: 0; color: #4b5563; font-size: 14px;">
                                <strong>BarakAllahu fiikum,</strong><br>
                                Tim PortalKajian.online
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #9ca3af; font-size: 12px;">
                                © 2026 PortalKajian.online. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                <a href="https://portalkajian.online" style="color: #0d9488; text-decoration: none;">portalkajian.online</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Error sending verification email:', {
                name: error.name,
                message: error.message,
                to
            });
            return { success: false, error };
        }

        console.log('✅ Verification email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error };
    }
}
