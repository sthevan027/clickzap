const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../config/logger').logger;

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Verificar se usuário já existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            // Criar novo usuário
            const user = new User({
                name,
                email,
                password
            });

            await user.save();

            // Gerar token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            logger.info(`Novo usuário registrado: ${email}`);

            return res.status(201).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            logger.error('Erro no registro:', error);
            return res.status(500).json({ error: 'Erro ao registrar usuário' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuário
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Verificar senha
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Verificar se usuário está ativo
            if (!user.active) {
                return res.status(401).json({ error: 'Conta desativada' });
            }

            // Atualizar último login
            user.lastLogin = new Date();
            await user.save();

            // Gerar token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            logger.info(`Usuário logado: ${email}`);

            return res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            });
        } catch (error) {
            logger.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro ao fazer login' });
        }
    }

    async me(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .select('-password')
                .populate('subscription');

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.json(user);
        } catch (error) {
            logger.error('Erro ao buscar dados do usuário:', error);
            return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
        }
    }

    async updateSettings(req, res) {
        try {
            const { settings } = req.body;
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            user.settings = { ...user.settings, ...settings };
            await user.save();

            logger.info(`Configurações atualizadas para usuário ${user.email}`);

            return res.json({ settings: user.settings });
        } catch (error) {
            logger.error('Erro ao atualizar configurações:', error);
            return res.status(500).json({ error: 'Erro ao atualizar configurações' });
        }
    }

    async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            // Busca usuário com senha
            const user = await User.findById(req.user.id).select('+password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verifica senha atual
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Senha atual incorreta'
                });
            }

            // Atualiza senha
            user.password = newPassword;
            await user.save();

            logger.info('Senha atualizada:', { userId: user._id });

            res.json({
                success: true,
                message: 'Senha atualizada com sucesso'
            });

        } catch (error) {
            logger.error('Erro ao atualizar senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar senha'
            });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // Busca usuário
            const user = await User.findOne({ email });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Email não encontrado'
                });
            }

            // Gera token de reset
            const resetToken = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // TODO: Implementar envio de email com token
            // Por enquanto, apenas retorna o token
            logger.info('Solicitação de reset de senha:', { userId: user._id });

            res.json({
                success: true,
                message: 'Instruções de reset enviadas para seu email',
                resetToken // Remover em produção
            });

        } catch (error) {
            logger.error('Erro no forgot password:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar solicitação'
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            // Verifica token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Busca usuário
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Token inválido'
                });
            }

            // Atualiza senha
            user.password = newPassword;
            await user.save();

            logger.info('Senha resetada:', { userId: user._id });

            res.json({
                success: true,
                message: 'Senha atualizada com sucesso'
            });

        } catch (error) {
            logger.error('Erro no reset password:', error);
            res.status(500).json({
                success: false,
                message: 'Token inválido ou expirado'
            });
        }
    }
}

module.exports = new AuthController(); 