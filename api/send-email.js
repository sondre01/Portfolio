import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { fullName, email, company, phone, subject, urgency, budget, timeline, message, turnstileToken } = req.body;

    // Validation
    if (!fullName || !email || !subject || !message) {
        return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Verify Cloudflare Turnstile token
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '1x00000000000000000000000000000000'; // Development fallback

    if (process.env.TURNSTILE_SECRET_KEY || turnstileToken) {
        if (!turnstileToken) {
            return res.status(400).json({ error: 'Security token is missing. Please complete the captcha check.' });
        }

        try {
            const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    secret: turnstileSecret,
                    response: turnstileToken,
                    remoteip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
                })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                console.error("Turnstile validation failed:", verifyData['error-codes']);
                return res.status(400).json({ error: 'Security check failed. Please refresh and try again.' });
            }
        } catch (error) {
            console.error("Turnstile verification error:", error);
            if (process.env.TURNSTILE_SECRET_KEY) {
                return res.status(500).json({ error: 'Failed to verify security token. Please try again later.' });
            }
        }
    }

    // Load API Keys / Environment Variables
    const resendApiKey = process.env.RESEND_API_KEY;
    const receiverEmail = process.env.RECEIVER_EMAIL || process.env.SMTP_USER || 'gamboa.khinandrei@gmail.com';
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Formatted Text Content
    const textContent = `
Project Inquiry Details:
----------------------------------------
Name: ${fullName}
Email: ${email}
Company: ${company || 'N/A'}
Phone: ${phone || 'N/A'}
Project Type: ${subject}
Urgency Level: ${urgency || 'N/A'}
Budget Range: ${budget || 'N/A'}
Timeline: ${timeline || 'N/A'}

Description:
${message}
`;

    // Formatted HTML Content
    const htmlContent = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <div style="background-color: #080808; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 1.5rem; letter-spacing: 1px;">New Project Inquiry</h2>
        <p style="margin: 5px 0 0; opacity: 0.8; font-size: 0.9rem;">From Khin Andrei's Portfolio</p>
    </div>
    <div style="padding: 24px; background-color: #f9f9f9;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; width: 140px; color: #555;">Name</td>
                <td style="padding: 10px 0; color: #000;">${fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Email</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #0b5bd3; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Company</td>
                <td style="padding: 10px 0; color: #000;">${company || '<em>None</em>'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Phone</td>
                <td style="padding: 10px 0; color: #000;">${phone || '<em>None</em>'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Project Type</td>
                <td style="padding: 10px 0;"><span style="background-color: #ffd700; color: #000; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">${subject}</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Urgency Level</td>
                <td style="padding: 10px 0; color: #000; text-transform: capitalize;">${urgency || '<em>Not specified</em>'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Budget Range</td>
                <td style="padding: 10px 0; color: #000;">${budget || '<em>Not specified</em>'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Timeline</td>
                <td style="padding: 10px 0; color: #000;">${timeline || '<em>Not specified</em>'}</td>
            </tr>
        </table>
        
        <div style="background-color: #fff; border-left: 4px solid #ffd700; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <h4 style="margin: 0 0 10px; color: #555;">Message & Requirements:</h4>
            <p style="margin: 0; white-space: pre-wrap; color: #111;">${message}</p>
        </div>
    </div>
    <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 0.8rem; color: #777; border-top: 1px solid #eee;">
        This email was automatically generated and sent from your portfolio contact form.
    </div>
</div>
`;

    // ============================================
    // METHOD 1: RESEND API (Recommended fallback)
    // ============================================
    if (resendApiKey) {
        try {
            console.log("Resend API Key found. Dispatching email via Resend API...");
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: 'Portfolio Contact <onboarding@resend.dev>', // Default sender for Resend free accounts
                    to: receiverEmail,
                    reply_to: email,
                    subject: `💼 Portfolio Inquiry: ${subject} from ${fullName}`,
                    text: textContent,
                    html: htmlContent
                })
            });

            const data = await response.json();

            if (response.ok) {
                return res.status(200).json({ success: true, message: 'Inquiry sent successfully via Resend!' });
            } else {
                console.error("Resend API Error response:", data);
                throw new Error(data.message || 'Resend API returned an error.');
            }
        } catch (error) {
            console.error("Failed to send via Resend API:", error);
            // If SMTP variables are not set, return error now
            if (!smtpUser || !smtpPass) {
                return res.status(500).json({ error: `Failed to send email via Resend: ${error.message}` });
            }
            console.warn("Attempting SMTP fallback...");
        }
    }

    // ============================================
    // METHOD 2: NODEMAILER SMTP (Backup)
    // ============================================
    if (smtpUser && smtpPass) {
        try {
            console.log("SMTP Credentials found. Dispatching email via Nodemailer SMTP...");
            const transporter = nodemailer.createTransport({
                host: smtpHost || 'smtp.gmail.com',
                port: parseInt(smtpPort),
                secure: parseInt(smtpPort) === 465, // true for 465, false for 587
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            const mailOptions = {
                from: `"${fullName}" <${smtpUser}>`, // Must be smtpUser to authorize successfully
                to: receiverEmail,
                replyTo: email,
                subject: `💼 Portfolio Inquiry: ${subject} from ${fullName}`,
                text: textContent,
                html: htmlContent
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true, message: 'Inquiry sent successfully via SMTP!' });

        } catch (error) {
            console.error("SMTP Dispatch Error:", error);
            return res.status(500).json({ error: `Failed to send email via SMTP: ${error.message}` });
        }
    }

    // ============================================
    // METHOD 3: LOCAL CONSOLE LOGGING (Dev Fallback)
    // ============================================
    console.warn("No mail delivery keys configured (Missing RESEND_API_KEY and SMTP credentials). Falling back to console logging.");
    console.log("=== INCOMING PORTFOLIO INQUIRY ===");
    console.log(`From: ${fullName} (${email})`);
    console.log(`Company: ${company || 'N/A'}`);
    console.log(`Phone: ${phone || 'N/A'}`);
    console.log(`Project Type: ${subject}`);
    console.log(`Urgency: ${urgency || 'N/A'}`);
    console.log(`Budget Range: ${budget || 'N/A'}`);
    console.log(`Timeline: ${timeline || 'N/A'}`);
    console.log(`Message:\n${message}`);
    console.log("===================================");

    return res.status(200).json({ 
        success: true, 
        message: "Inquiry received successfully (development log fallback)." 
    });
}
