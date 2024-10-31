const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = 3000;

const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
    return res.status(200).send('Fala ai rapaziadinha!');
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('user') // Altere para o nome correto da sua tabela
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            return res.status(404).send("Usuário não encontrado");
        };

        console.log("password", password)
        console.log("user.password", user.password)

        const validPassword = await bcrypt.compare(password, user.password);

        console.log("validPassword", validPassword)


        if (!validPassword) {
            return res.status(401).send("Senha incorreta");
        };

        return res.status(200).send("Login feito com sucesso!");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Erro interno do servidor");
    }
});

// Register
app.post('/register', async (req, res) => {
    console.log(req.body); // Loga o corpo da requisição
    const { email, nome, celular, password } = req.body;

    // Criptografa a senha
    const criptPassword = await bcrypt.hash(password, 10);

    try {
        // Tente inserir o novo usuário
        const { data: newUser, error } = await supabase
            .from('user')
            .insert([
                {
                    email,
                    nome,
                    celular,
                    password: criptPassword
                }
            ]);

        // Verifique se houve um erro ao inserir
        if (error) {
            console.error("Erro do Supabase:", error.message); // Loga o erro
            return res.status(400).send("Erro ao cadastrar usuario: " + error.message); // Retorna mensagem de erro ao cliente
        }

        return res.status(201).json(newUser);
    } catch (error) {
        console.error("Erro interno:", error); // Loga erro interno
        return res.status(500).send("Erro interno do servidor");
    }
});

app.get('/locations', async (_req, res) => {
    const { data, error } = await supabase
        .from('locations')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
})

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});
