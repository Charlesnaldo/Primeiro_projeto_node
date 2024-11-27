const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config(); 
 conexao = require('../utils/db');


//funcao de cadatro de cliente
const cadastrarPaciente = async (req, res) => {
    try {
        const { nome_completo, email, senha } = req.body;

        // Validações básicas
        if (!nome_completo || !email || !senha) {
            return res.status(400).send('Todos os campos são obrigatórios.');
        }

        // Verificar se o e-mail já está cadastrado
        const sqlVerificar = `SELECT email FROM pacientes WHERE email = ?`;
        conexao.query(sqlVerificar, [email], async (erro, resultado) => {
            if (erro) {
                console.error('Erro ao verificar e-mail:', erro);
                return res.status(500).send('Erro ao verificar e-mail.');
            }

            if (resultado.length > 0) {
                return res.status(400).send('Este e-mail já está cadastrado.');
            }

            // Criptografar a senha
            const hashedPassword = await bcrypt.hash(senha, 10);

            // Inserir paciente no banco de dados
            const sqlInserir = `INSERT INTO pacientes (nome_completo, email, senha) VALUES (?, ?, ?)`;
            conexao.query(sqlInserir, [nome_completo, email, hashedPassword], (erro, resultado) => {
                if (erro) {
                    console.error('Erro ao cadastrar paciente:', erro);
                    return res.status(500).send('Erro ao cadastrar paciente.');
                }

                console.log('Paciente cadastrado com sucesso:', resultado);

                // Passa a variável sucesso para o template Handlebars
                res.redirect('/?sucesso=true');
            });
        });
    } catch (erro) {
        console.error('Erro no cadastro:', erro);
        res.status(500).send('Erro interno no servidor.');
    }
};



// Cadastro de funcionarios no banco de dados

const cadastrarFunc = async (req, res) => {
    try {
        const { nome_completo, email, senha, cargo, data_admissao } = req.body;

        // Validações básicas
        if (!nome_completo || !email || !senha || !cargo || !data_admissao) {
            return res.status(400).send('Todos os campos são obrigatórios.');
        }

        // Verificar se o e-mail já está cadastrado
        const sqlVerificar = `SELECT email FROM funcionarios WHERE email = ?`;
        conexao.query(sqlVerificar, [email], async (erro, resultado) => {
            if (erro) {
                console.error('Erro ao verificar e-mail:', erro);
                return res.status(500).send('Erro ao verificar e-mail.');
            }

            if (resultado.length > 0) {
                return res.status(400).send('Este e-mail já está cadastrado.');
            }

            // Criptografar a senha
            const hashedPassword = await bcrypt.hash(senha, 10);

            // Inserir funcionário no banco de dados
            const sqlInserir = `INSERT INTO funcionarios (nome_completo, email, senha, cargo, data_admissao) VALUES (?, ?, ?, ?, ?)`;
            conexao.query(sqlInserir, [nome_completo, email, hashedPassword, cargo, data_admissao], (erro, resultado) => {
                if (erro) {
                    console.error('Erro ao cadastrar funcionário:', erro);
                    return res.status(500).send('Erro ao cadastrar funcionário.');
                }

                console.log('Funcionário cadastrado com sucesso:', resultado);
                res.redirect('/sucesso=true'); // Página de sucesso
            });
        });
    } catch (erro) {
        console.error('Erro no cadastro:', erro);
        res.status(500).send('Erro interno no servidor.');
    }
};



module.exports = {
    cadastrarPaciente,cadastrarFunc
};
