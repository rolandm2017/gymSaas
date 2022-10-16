const nodemailer = require("nodemailer");
const config = require("config.json");

interface ISendEmail {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

async function sendEmail({ to, subject, html, from = config.emailFrom }: ISendEmail) {
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
}

export default sendEmail;
