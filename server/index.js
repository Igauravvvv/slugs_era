require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const emailTemplate = require('./template');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const mailOptions = {
      from: `"Slugs Era" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to The Slow Club',
      html: emailTemplate
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
