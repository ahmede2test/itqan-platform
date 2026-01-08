import { prisma } from '../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name, profileImage, coverImage } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        profileImage,
        coverImage,
      },
    });

    return res.status(200).json({ 
      success: true, 
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        coverImage: updatedUser.coverImage
      } 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}
