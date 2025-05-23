import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendEmail } from './emailHandler.js';
import { db, FieldValue } from './firebase.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, projectType, budget, timeframe, message, to, subject, body, isReply } = req.body;

    if (isReply && to && subject && body) {
       console.log("🛠 Reply flow matched");
      await sendEmail({ to, subject, body });
      return res.status(200).send("Reply sent");
    }

    if(!name || !email || !message) {
       console.log("🚫 Missing fields:", { name, email, message });
      return res.status(400).send("Missing required contact fields");
    }
    
    console.log("✅ Contact form flow matched");
    await sendEmail({name, email, phone, projectType, budget, timeframe, message});

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
    
    res.status(200).send("Message saved and email sent");
  } catch (err) {
    console.error("ERROR in /api/contact", err);
    res.status(500).send('Failed to process request');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
