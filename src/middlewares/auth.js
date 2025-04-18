const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user.subscription_status !== 'free' && 
        user.subscription_expires_at && 
        user.subscription_expires_at < new Date()) {
      return res.status(403).json({ error: 'Assinatura expirada' });
    }

    req.userId = decoded.id;
    req.userSubscription = user.subscription_status;
    
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}; 