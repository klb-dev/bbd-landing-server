import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const sendEmail = async ({ name, email, message, }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: email,
        to: process.env.TO_EMAIL,
        subject: `New message from ${name}`,
        text: `${message}\n\nFrom: ${name} (${email})`,
    };
    await transporter.sendMail(mailOptions);
};
