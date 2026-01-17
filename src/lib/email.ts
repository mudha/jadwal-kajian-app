import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.warn('⚠️ SMTP settings not configured. Email not sent.');
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        await transporter.verify();

        const info = await transporter.sendMail({
            from: SMTP_FROM || '"Portal Kajian Admin" <no-reply@portalkajian.online>',
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        return false;
    }
}

export async function sendApprovalEmail(email: string, name: string, loginUrl: string = 'https://portalkajian.online/admin') {
    const subject = 'Selamat! Akun Kontributor Anda Disetujui 🎉';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563eb;">Portal Kajian</h1>
            </div>
            
            <p>Assalamu'alaikum <strong>${name}</strong>,</p>
            
            <p>Alhamdulillah, pendaftaran Anda sebagai kontributor di Portal Kajian telah disetujui oleh Admin.</p>
            
            <p>Sekarang Anda dapat login ke Admin Panel untuk mulai menginput jadwal kajian dan berkontribusi.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Login ke Admin Panel
                </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
                Jika tombol di atas tidak berfungsi, silakan copy link berikut:<br>
                <a href="${loginUrl}">${loginUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                Email ini dikirim otomatis. Mohon jangan dibalas.<br>
                &copy; ${new Date().getFullYear()} Portal Kajian Sunnah Indonesia
            </p>
        </div>
    `;

    return sendEmail({ to: email, subject, html });
}
