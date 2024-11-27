const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const conexao = require('../utils/db');


// Login para Paciente
//----------------------------------------------------------

const loginPaciente = (req, res) => {
    const { email, password } = req.body;

    // Verifica se o e-mail existe no banco de dados
    const sql = `SELECT * FROM pacientes WHERE email = ?`;
    conexao.query(sql, [email], async (erro, resultados) => {
        if (erro) {
            console.error('Erro ao executar a query:', erro);
            return res.status(500).send('Erro interno no servidor.');
        }

        if (resultados.length === 0) {
            return res.status(401).send('E-mail ou senha inválidos.');
        }

        const paciente = resultados[0];

        // Verifica a senha com bcrypt
        const senhaValida = await bcrypt.compare(password, paciente.senha);
        if (!senhaValida) {
            return res.status(401).send('E-mail ou senha inválidos.');
        }

        // Login bem-sucedido, redireciona para a página do paciente
        res.redirect('/paciente/dashboard'); // Redireciona para o painel do paciente
    });
};


// Login para Funcionário
//----------------------------------------------------------

const loginFuncionario = (req, res) => {
    const { email, password } = req.body;

    // Verifica se o e-mail existe no banco de dados
    const sql = `SELECT * FROM funcionarios WHERE email = ?`;
    conexao.query(sql, [email], async (erro, resultados) => {
        if (erro) {
            console.error('Erro ao executar a query:', erro);
            return res.status(500).send('Erro interno no servidor.');
        }

        if (resultados.length === 0) {
            return res.status(401).send('E-mail ou senha inválidos.');
        }

        const funcionario = resultados[0];

        // Verifica a senha com bcrypt
        const senhaValida = await bcrypt.compare(password, funcionario.senha);
        if (!senhaValida) {
            return res.status(401).send('E-mail ou senha inválidos.');
        }

        // Login bem-sucedido, redireciona para a página do funcionário
        res.redirect('/funcionario/dashboard'); // Redireciona para o painel do funcionário
    });
};

module.exports = {
    loginPaciente,
    loginFuncionario
};
