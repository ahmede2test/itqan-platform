import { prisma } from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      success: true, 
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        coverImage: user.coverImage
      } 
    });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
