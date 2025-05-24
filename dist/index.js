import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendEmail } from './emailHandler.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, projectType, budget, timeframe, message, to, subject, body, isReply } = req.body;
        if (isReply) {
            if (!to || !subject || !body) {
                return res.status(400).json({ error: 'Missing reply fields' });
            }
            await sendEmail({ to, subject, body });
            return res.status(200).json({ success: true, message: 'Reply sent' });
        }
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing contact form fields' });
        }
        await sendEmail({ name, email, phone, projectType, budget, timeframe, message });
        return res.status(200).json({ success: true, message: 'Message received' });
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
