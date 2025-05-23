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
        const { name, email, phone, projectType, budget, timeframe, message, to, subject, body } = req.body;
        // Send email
        if (to && subject && body) {
            await sendEmail({ to, subject, html: `<p>${body}</p>` });
            return res.status(200).send('Admin reply sent');
        }
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
        res.status(200).send('Message submitted');
    }
    catch (err) {
        console.error('Email send or Firestore write failed:', err);
        res.status(500).send('Failed to process request');
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
