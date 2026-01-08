import { prisma } from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and Password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Basic password check (In a real app, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Role verification
    if (user.role !== role) {
        return res.status(401).json({ error: 'Unauthorized role' });
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
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}
