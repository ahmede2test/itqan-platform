import { prisma } from '../../lib/prisma.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, role = 'STUDENT' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  try {
    // Basic check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const assignedRole = email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In a real app, hash this!
        role: assignedRole,
      },
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, error: 'Connection failed' });
  }
}
