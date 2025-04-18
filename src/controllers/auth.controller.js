const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  async register(req, res) {
    try {
      const { email } = req.body;

      if (await User.findOne({ where: { email } })) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const user = await User.create(req.body);

      user.password_hash = undefined;

      return res.json({
        user,
        token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '7d'
        })
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      user.password_hash = undefined;

      return res.json({
        user,
        token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: '7d'
        })
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async me(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      user.password_hash = undefined;
      return res.json(user);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AuthController(); 