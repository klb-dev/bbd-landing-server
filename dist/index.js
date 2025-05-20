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
        await sendEmail(req.body);
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Email error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
