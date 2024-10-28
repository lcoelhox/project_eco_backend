const { Prisma } = require('@prisma/client');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');

const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
    return res.status(200).send('Fala ai rapaziadinha!');
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        }). catch(err => {console.log("err ->", err);});

        if(!user) {
            return res.status(404).send("Usuário não encontrado");
        };

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword) {
            return res.status(401).send("Senha incorreta");
        };

        return res.status(200).send("Login feito com sucesso!");
    } catch (error) {
        console.log(error)
    }
})

app.post('/register', async (req, res) => {
    const { email, nome, celular, password } = req.body;

    const criptPassword = await bcrypt.hash(password, 10)

    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                nome,
                celular,
                password: criptPassword
            }
        }).catch(err => console.log(err));

        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(400).send("Erro ao cadastrar usuario", error)
    }
});

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});