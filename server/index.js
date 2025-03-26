import express from 'express';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Updated SMTP configuration for Gmail
const transportOptions = {
  host: process.env.SMTP_HOST,
  port: 587,  // Use 587 for STARTTLS
  secure: false, // Must be false for STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: true, // Verify SSL certificates
    ciphers: 'SSLv3'
  },
  debug: true,
  logger: true
};

const transporter = nodemailer.createTransport(transportOptions);

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

app.post('/api/send-email', upload.array('attachments'), async (req, res) => {
  try {
    console.log('Received email request:', {
      to: req.body.to,
      subject: req.body.subject,
      attachments: req.files?.length || 0
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.html,
      attachments: req.files?.map(file => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      })) || [],
    });

    console.log('Email sent successfully:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response || 'No additional details available'
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});