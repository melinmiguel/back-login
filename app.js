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
    dbName: 'SenaiBackend'
})
.then(() => console.log('Conectado ao MongoDB Atlas (Banco: SenaiBackend)'))
.catch(err => console.error('Erro ao conectar no MongoDB:', err));

// ==========================================
// MODELO DA COLLECTION 'usuarios'
// ==========================================
const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true }
}, { 
    collection: 'usuarios',
    versionKey: false 
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// ==========================================
// ROTAS DE LOGIN E USUÁRIOS
// ==========================================

// 1. Autenticar usuário (Login)
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
        }

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

// 2. Recuperar senha
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

// 3. Cadastrar novo usuário
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
        }

        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
        }

        const novoUsuario = await Usuario.create({ nome, email, senha });

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: {
                id: novoUsuario._id,
                nome: novoUsuario.nome,
                email: novoUsuario.email
            }
        });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
    }
});

// 4. Deletar usuário por ID
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ erro: 'ID de usuário inválido.' });
        }

        const usuarioDeletado = await Usuario.findByIdAndDelete(id);

        if (!usuarioDeletado) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        return res.status(200).json({
            mensagem: 'Usuário deletado com sucesso!',
            id: usuarioDeletado._id
        });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        return res.status(500).json({ erro: 'Erro interno ao deletar usuário.' });
    }
});

// Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microsserviço de Login/Usuários rodando na porta ${PORT}`);
});
