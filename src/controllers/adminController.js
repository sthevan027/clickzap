const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Admin = require('../models/Admin');
const LoggerService = require('../services/loggerService');
const jwt = require('jsonwebtoken');

class AdminController {
  // Login do admin
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ where: { email } });

      if (!admin || !(await admin.validatePassword(password))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      LoggerService.info('Admin login', { email: admin.email });
      res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
    } catch (error) {
      LoggerService.error('Erro no login admin', { error });
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  // Dashboard - Estatísticas gerais
  async dashboard(req, res) {
    try {
      const totalUsers = await User.count();
      const activeSubscriptions = await Subscription.count({ where: { status: 'active' } });
      const totalRevenue = await Subscription.sum('price', { where: { status: 'active' } });
      
      const usersByPlan = await User.findAll({
        attributes: ['plan', [sequelize.fn('count', sequelize.col('id')), 'count']],
        group: ['plan']
      });

      LoggerService.info('Admin dashboard accessed', { adminId: req.admin.id });
      res.json({
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        usersByPlan
      });
    } catch (error) {
      LoggerService.error('Erro ao acessar dashboard', { error });
      res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
  }

  // Gerenciamento de usuários
  async listUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const where = search ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: users } = await User.findAndCountAll({
        where,
        limit,
        offset,
        include: [{ model: Subscription }],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        users,
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      LoggerService.error('Erro ao listar usuários', { error });
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // Gerenciamento de planos
  async updatePlan(req, res) {
    try {
      const { userId, newPlan, price } = req.body;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.update({ plan: newPlan });
      
      if (price) {
        await Subscription.update(
          { price },
          { where: { userId, status: 'active' } }
        );
      }

      LoggerService.info('Plano atualizado', { userId, newPlan, price });
      res.json({ message: 'Plano atualizado com sucesso' });
    } catch (error) {
      LoggerService.error('Erro ao atualizar plano', { error });
      res.status(500).json({ error: 'Erro ao atualizar plano' });
    }
  }

  // Gerenciamento de promoções
  async createPromotion(req, res) {
    try {
      const { code, discount, startDate, endDate, plans } = req.body;
      
      const promotion = await Promotion.create({
        code,
        discount,
        startDate,
        endDate,
        plans
      });

      LoggerService.info('Promoção criada', { promotion });
      res.json(promotion);
    } catch (error) {
      LoggerService.error('Erro ao criar promoção', { error });
      res.status(500).json({ error: 'Erro ao criar promoção' });
    }
  }

  // Monitoramento de acessos
  async accessLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const logs = await AccessLog.findAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      });

      res.json(logs);
    } catch (error) {
      LoggerService.error('Erro ao buscar logs de acesso', { error });
      res.status(500).json({ error: 'Erro ao buscar logs' });
    }
  }

  // Suspender/Ativar usuário
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await user.update({ status: newStatus });

      LoggerService.info('Status do usuário alterado', { userId, newStatus });
      res.json({ message: `Usuário ${newStatus === 'active' ? 'ativado' : 'suspenso'} com sucesso` });
    } catch (error) {
      LoggerService.error('Erro ao alterar status do usuário', { error });
      res.status(500).json({ error: 'Erro ao alterar status' });
    }
  }
}

module.exports = new AdminController(); 