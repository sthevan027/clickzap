import { connectDB } from '../../../../../config/database';
import User from '../../../../../models/User';
import { verifyToken } from '../../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verificar token e permissões
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Verificar se o usuário atual é admin
    await connectDB();
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Requires admin privileges' });
    }

    // Obter o usuário a ser atualizado
    const { id } = req.query;
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Não permitir que o admin remova seus próprios privilégios
    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot modify your own admin privileges' });
    }

    // Alternar o papel do usuário entre 'user' e 'admin'
    targetUser.role = targetUser.role === 'admin' ? 'user' : 'admin';
    await targetUser.save();

    return res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });

  } catch (error) {
    console.error('Error toggling admin status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 