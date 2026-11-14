const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Rota principal de autenticação (chamada pelo Gateway em /api/login)
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    // Simulação de validação (substitua pela consulta ao seu banco de dados)
    if (email === 'admin@email.com' && senha === '123456') {
        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuario: { email, nome: 'Usuário Teste' }
        });
    }

    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
});

// Rota secundária de recuperação (chamada pelo Gateway em /api/login/recuperar-senha)
app.post('/api/login/recuperar-senha', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ erro: 'Informe o e-mail para recuperação.' });
    }

    return res.status(200).json({
        mensagem: `Instruções de recuperação enviadas para ${email}.`
    });
});

// Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microsserviço de Login rodando na porta ${PORT}`);
});