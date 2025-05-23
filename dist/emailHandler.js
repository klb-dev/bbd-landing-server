import nodemailer from 'nodemailer';
import { db } from './firebaseAdmin.js';
import dotenv from 'dotenv';
dotenv.config();
export const sendEmail = async ({ name, email, phone, projectType, budget, timeframe, message, }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // Format budget for display
    let formattedBudget = budget || 'Not specified';
    if (budget === '<5k')
        formattedBudget = 'Less than $5,000';
    if (budget === '5-10k')
        formattedBudget = '$5,000 - $10,000';
    if (budget === '10-25k')
        formattedBudget = '$10,000 - $25,000';
    if (budget === '25k+')
        formattedBudget = '$25,000+';
    if (budget === 'not-sure')
        formattedBudget = 'Not sure yet';
    // Format timeframe for display
    let formattedTimeframe = timeframe || 'Not specified';
    if (timeframe === 'asap')
        formattedTimeframe = 'As soon as possible';
    if (timeframe === '1-3months')
        formattedTimeframe = '1-3 months';
    if (timeframe === '3-6months')
        formattedTimeframe = '3-6 months';
    if (timeframe === '6months+')
        formattedTimeframe = '6+ months';
    if (timeframe === 'flexible')
        formattedTimeframe = 'Flexible';
    // Format project type for display
    let formattedProjectType = projectType || 'Not specified';
    // Create a plain text version as fallback
    const textContent = `
New Contact Form Submission

From: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Project Details:
---------------
Project Type: ${formattedProjectType}
Budget: ${formattedBudget}
Timeframe: ${formattedTimeframe}

Message:
${message}
  `;
    // Create an HTML version with better formatting and branding
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .email-container {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    .email-header {
      background-color: #285AA9;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .email-body {
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-footer {
      background-color: #f1f1f1;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .contact-info {
      background-color: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      border-left: 4px solid #285AA9;
    }
    .project-details {
      background-color: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      border-left: 4px solid #5DC8E3;
    }
    .message-container {
      background-color: white;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #FFBF1E;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table td {
      padding: 8px;
    }
    table td:first-child {
      font-weight: bold;
      width: 120px;
    }
    .message-text {
      white-space: pre-wrap;
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }
    .blue-byrd-logo {
      font-weight: bold;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="blue-byrd-logo">Blue Byrd Development</div>
      <h2 style="margin: 10px 0 0 0;">New Contact Form Submission</h2>
    </div>
    
    <div class="email-body">
      <div class="contact-info">
        <h3 style="margin-top: 0; color: #285AA9;">Contact Information</h3>
        <table>
          <tr>
            <td>Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td>Phone:</td>
            <td>${phone ? `<a href="tel:${phone}">${phone}</a>` : 'Not provided'}</td>
          </tr>
        </table>
      </div>
      
      <div class="project-details">
        <h3 style="margin-top: 0; color: #5DC8E3;">Project Details</h3>
        <table>
          <tr>
            <td>Project Type:</td>
            <td>${formattedProjectType}</td>
          </tr>
          <tr>
            <td>Budget:</td>
            <td>${formattedBudget}</td>
          </tr>
          <tr>
            <td>Timeframe:</td>
            <td>${formattedTimeframe}</td>
          </tr>
        </table>
      </div>
      
      <div class="message-container">
        <h3 style="margin-top: 0; color: #FFBF1E;">Message</h3>
        <div class="message-text">${message.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    
    <div class="email-footer">
      <p>This message was sent from the contact form on your website.</p>
      <p>© ${new Date().getFullYear()} Blue Byrd Development. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        replyTo: email,
        to: process.env.TO_EMAIL,
        subject: `New Project Inquiry from ${name} - ${projectType || 'Not specified'}`,
        text: textContent,
        html: htmlContent,
    };
    try {
        await transporter.sendMail(mailOptions);
        const data = {
            name,
            email,
            phone,
            projectType,
            budget,
            timeframe,
            message,
            createdAt: new Date(),
            status: 'new',
        };
        if (!phone || typeof phone !== 'string' || phone.trim() === '') {
            console.error("Phone number is required but missing or invalid.");
            throw new Error('Phone number is required');
        }
        await db.collection('messages').add(Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined)));
    }
    catch (err) {
        console.error('Error sending email or writing to Firestore:', err);
        throw err;
    }
};
