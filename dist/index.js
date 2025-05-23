import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendEmail } from './emailHandler.js';
import { db, FieldValue } from './firebase.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// app.post('/api/contact', async (req, res) => {
//   try {
//     const { name, email, phone, projectType, budget, timeframe, message, to, subject, body, isReply } = req.body;
//     if (isReply && to && subject && body) {
//       console.log("🛠 Reply flow matched", { to, subject, body });
//       await sendEmail({ to, subject, body });
//       res.status(200).json({ success: true, message: "Reply sent" });
//     }
//     if(!name || !email || !message) {
//        console.log("🚫 Missing fields:", { name, email, message });
//       return res.status(400).send("Missing required contact fields");
//     }
//     console.log("📩 Routing to CONTACT FORM:", { name, email, message });
//     await sendEmail({name, email, phone, projectType, budget, timeframe, message});
//     console.log("✅ Email sent successfully");
//     // Store in Firestore
//     await db.collection('messages').add({
//       name,
//       email,
//       phone: phone || '',
//       projectType: projectType || '',
//       budget: budget || '',
//       timeframe: timeframe || '',
//       message,
//       status: 'new',
//       createdAt: FieldValue.serverTimestamp(),
//     });
//     console.log("✅ Message saved to Firestore");
//     res.status(200).json({ success: true, message: "Message submitted" });
//   } catch (err) {
//     console.error("🔥 Error inside contact form logic:", err);
//     res.status(500).send('Failed to process request');
//   }
// });
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, projectType, budget, timeframe, message, to, subject, body, isReply } = req.body;
        if (isReply) {
            if (!to || !subject || !body) {
                return res.status(400).json({ error: 'Missing reply fields' });
            }
            await sendEmail({ to, subject, body });
            console.log('✅ Admin reply sent');
            return res.status(200).json({ message: 'Reply sent' });
        }
        // Contact Form Submission
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing contact form fields' });
        }
        await sendEmail({ name, email, phone, projectType, budget, timeframe, message });
        console.log('✅ Contact form email sent');
        await db.collection('messages').add({
            name,
            email,
            phone: phone || '',
            projectType: projectType || '',
            budget: budget || '',
            timeframe: timeframe || '',
            message,
            status: 'new',
            createdAt: FieldValue.serverTimestamp(),
        });
        console.log('✅ Message saved to Firestore');
        return res.status(200).json({ message: 'Message received' });
    }
    catch (err) {
        console.error('❌ Error inside contact form logic:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
