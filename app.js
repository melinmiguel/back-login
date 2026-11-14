const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// ==========================================
// CONEXÃO COM O MONGODB ATLAS
// ==========================================
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    dbName: 'SenaiBackend' // Garante que vai conectar exatamente nesse banco
})
.then(() => console.log('Conectado ao MongoDB Atlas (Banco: SenaiBackend)'))
.catch(err => console.error('Erro ao conectar no MongoDB:', err));

// ==========================================
// MODELO DA COLLECTION 'usuarios'
// ==========================================
const usuarioSchema = new mongoose.Schema({
    nome: String,
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true }
}, { 
    collection: 'usuarios', // Força o uso exato da collection 'usuarios'
    versionKey: false 
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// ==========================================
// ROTAS DE LOGIN
// ==========================================

// Rota principal de autenticação (chamada pelo Gateway em /api/login)
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
        }

        // Busca o usuário no banco SenaiBackend -> collection usuarios
        const usuarioEncontrado = await Usuario.findOne({ email, senha });

        if (!usuarioEncontrado) {
            return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
        }

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuarioEncontrado._id,
                nome: usuarioEncontrado.nome,
                email: usuarioEncontrado.email
            }
        });
    } catch (error) {
        console.error('Erro na rota de login:', error);
        return res.status(500).json({ erro: 'Erro interno ao processar o login.' });
    }
});

// Rota secundária de recuperação (chamada pelo Gateway em /api/login/recuperar-senha)
app.post('/api/login/recuperar-senha', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ erro: 'Informe o e-mail para recuperação.' });
        }

        const usuarioExiste = await Usuario.findOne({ email });

        if (!usuarioExiste) {
            return res.status(404).json({ erro: 'E-mail não encontrado na base de dados.' });
        }

        return res.status(200).json({
            mensagem: `Instruções de recuperação enviadas para ${email}.`
        });
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        return res.status(500).json({ erro: 'Erro interno ao verificar e-mail.' });
    }
});

// Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microsserviço de Login rodando na porta ${PORT}`);
});