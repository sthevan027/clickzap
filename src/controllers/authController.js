const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../config/logger');

class AuthController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Verifica se usuário já existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
                });
            }

            // Cria novo usuário
            const user = await User.create({
                name,
                email,
                password,
                plan: 'free' // Plano gratuito por padrão
            });

            // Gera token JWT
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Remove senha do objeto de resposta
            const userResponse = user.toObject();
            delete userResponse.password;

            logger.info('Novo usuário registrado:', { userId: user._id });

            res.status(201).json({
                success: true,
                token,
                user: userResponse
            });

        } catch (error) {
            logger.error('Erro no registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao registrar usuário'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Busca usuário com senha
            const user = await User.findOne({ email }).select('+password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            // Verifica senha
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou senha inválidos'
                });
            }

            // Verifica status do usuário
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Conta desativada. Entre em contato com o suporte.'
                });
            }

            // Atualiza último login
            user.lastLogin = new Date();
            await user.save();

            // Gera token JWT
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Remove senha do objeto de resposta
            const userResponse = user.toObject();
            delete userResponse.password;

            logger.info('Usuário logado:', { userId: user._id });

            res.json({
                success: true,
                token,
                user: userResponse
            });

        } catch (error) {
            logger.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao fazer login'
            });
        }
    }

    async me(req, res) {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            logger.error('Erro ao buscar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar dados do usuário'
            });
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