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
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, projectType, budget, timeframe, message } = req.body;
        // Send email
        await sendEmail(req.body);
        // Store in Firestore
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
        res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to process your message'
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
