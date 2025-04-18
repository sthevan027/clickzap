require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminData = {
    name: 'Sthevan Santos',
    email: 'sthevan.ssantos@gmail.com',
    password: 'admin123',
    role: 'admin',
    plan: 'premium',
    status: 'active',
    credits: {
        messages: 5000,
        media: 500
    }
};

async function createAdmin() {
    try {
        // Conectar ao MongoDB usando a URL do .env com opções adicionais
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            authSource: 'admin',
            retryWrites: true,
            w: 'majority'
        });
        
        console.log('Conectado ao MongoDB com sucesso!');
        
        // Criar modelo de usuário
        const userSchema = new mongoose.Schema({
            name: String,
            email: { type: String, unique: true },
            password: String,
            role: String,
            plan: String,
            status: String,
            credits: {
                messages: Number,
                media: Number
            }
        });
        
        const User = mongoose.model('User', userSchema);
        
        // Verificar se o admin já existe
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Usuário admin já existe!');
            return;
        }
        
        // Criar hash da senha
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);
        
        // Criar usuário admin
        const admin = new User(adminData);
        await admin.save();
        
        console.log('Usuário admin criado com sucesso!');
        console.log('Email:', adminData.email);
        console.log('Senha:', 'admin123');
        
    } catch (error) {
        console.error('Erro ao criar usuário admin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin(); 