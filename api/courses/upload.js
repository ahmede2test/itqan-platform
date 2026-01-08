import { v2 as cloudinary } from 'cloudinary';
const { prisma } = require('../../_lib/prisma');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body; // In a real app, get this from session/token
  
  if (!email || email !== process.env.ADMIN_EMAIL) {
     return res.status(403).json({ error: 'Restricted Area: Admins Only' });
  }

  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: 'itqan_courses',
    }, process.env.CLOUDINARY_API_SECRET);

    return res.status(200).json({ 
       signature, 
       timestamp, 
       cloudName: process.env.CLOUDINARY_CLOUD_NAME,
       apiKey: process.env.CLOUDINARY_API_KEY 
    });
  } catch (error) {
    console.error('Cloudinary Sign Error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
