require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Conectar ao MongoDB Atlas
        const uri = process.env.MONGODB_URI;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            authSource: 'admin'
        });

        console.log('Conectado ao MongoDB Atlas com sucesso!');

        // Definir o schema do usuário
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

        // Criar o modelo
        let User;
        try {
            User = mongoose.model('User');
        } catch {
            User = mongoose.model('User', userSchema);
        }

        // Verificar se o admin já existe
        const existingAdmin = await User.findOne({ email: 'sthevan.ssantos@gmail.com' });
        
        if (existingAdmin) {
            console.log('Usuário admin já existe!');
            return;
        }

        // Criar senha hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Criar usuário admin
        const admin = new User({
            name: 'Sthevan Santos',
            email: 'sthevan.ssantos@gmail.com',
            password: hashedPassword,
            role: 'admin',
            plan: 'premium',
            status: 'active',
            credits: {
                messages: 5000,
                media: 500
            }
        });

        await admin.save();
        console.log('Usuário admin criado com sucesso!');
        console.log('Email: sthevan.ssantos@gmail.com');
        console.log('Senha: admin123');
        
    } catch (error) {
        console.error('Erro ao criar usuário admin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin(); 