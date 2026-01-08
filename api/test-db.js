import { prisma } from '../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: `test${Date.now()}@itqan.com`,
        role: 'STUDENT',
      },
    });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ success: false, error: 'Connection failed' });
  }
}
