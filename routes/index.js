const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const session = require('express-session');
const conexao = require('../utils/db');


// Configuração da sessão

router.use(session({
    secret: '234567689678678678678678678678', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  
}));



// Rota POST para processar o login do paciente
//----------------------------------------------

router.post('/login/paciente', (req, res) => {
    const { email, senha } = req.body;

    // Remover espaços em branco de email e senha
    const emailTrimmed = email.trim();
    const senhaTrimmed = senha.trim();

    console.log('E-mail recebido no login:', emailTrimmed);  // Log de depuração para verificar o e-mail

    const query = 'SELECT * FROM pacientes WHERE email = ?';
    
    conexao.query(query, [emailTrimmed], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao consultar o banco de dados:', erro);
            return res.status(500).send('Erro ao consultar o banco de dados');
        }
        
        if (resultado.length === 0) {
            console.log('E-mail não encontrado no banco de dados');
            return res.status(400).send('E-mail ou senha inválidos');
        }

        const usuario = resultado[0];
        console.log('Usuário encontrado:', usuario);  // Log de depuração para verificar o usuário encontrado no banco

        // Verificar a senha usando bcrypt
        bcrypt.compare(senhaTrimmed, usuario.senha, (erro, isMatch) => {
            if (erro) {
                console.error('Erro ao verificar a senha:', erro);
                return res.status(500).send('Erro ao verificar a senha');
            }

            if (!isMatch) {
                console.log('Senha não corresponde');
                return res.status(400).send('E-mail ou senha inválidos');
            }

            console.log('Login bem-sucedido!');
            // Armazenar os dados do paciente na sessão
            req.session.usuario = usuario;
            // Senha correta, redirecionar para o painel do paciente
            res.redirect('/paciente/dashboard-paciente');
        });
    });
});


// Rota POST para processar o login do funcionário
//------------------------------------------------

router.post('/login/funcionario', (req, res) => {
    const { email, senha } = req.body;

    // Remover espaços em branco de email e senha
    const emailTrimmed = email.trim();
    const senhaTrimmed = senha.trim();

    const query = 'SELECT * FROM funcionarios WHERE email = ?';
    
    conexao.query(query, [emailTrimmed], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao consultar o banco de dados:', erro);
            return res.status(500).send('Erro ao consultar o banco de dados');
        }
        
        if (resultado.length === 0) {
            return res.status(400).send('E-mail ou senha inválidos');
        }

        const funcionario = resultado[0];
        
        // Verificar a senha usando bcrypt
        bcrypt.compare(senhaTrimmed, funcionario.senha, (erro, isMatch) => {
            if (erro) {
                console.error('Erro ao verificar a senha:', erro);
                return res.status(500).send('Erro ao verificar a senha');
            }

            if (!isMatch) {
                return res.status(400).send('E-mail ou senha inválidos');
            }

            // Armazenar os dados do funcionário na sessão
            req.session.funcionario = funcionario;
            // Senha correta, redirecionar para o painel do funcionário
            res.redirect('/funcionario/dashboard-funcionario');
        });
    });
});


// Rota GET para renderizar o formulário de cadastro
//------------------------------------------------

router.get('/cadastro', (req, res) => {
    res.render('cadastro');  // Renderiza o arquivo cadastro.handlebars
});

// Rota POST para processar o cadastro de novo usuário
router.post('/cadastrar', (req, res) => {
    
    const { nome_completo, email, senha, confirmPassword } = req.body;

    // Remover espaços em branco de nome, email e senha
    const nome_completoTrimmed = nome_completo.trim();
    const emailTrimmed = email.trim();
    const senhaTrimmed = senha.trim();
    const confirmPasswordTrimmed = confirmPassword.trim();

    // Verificar se as senhas coincidem
    if (senhaTrimmed !== confirmPasswordTrimmed) {
        return res.render('cadastro', {
            errorMessage: 'As senhas não coincidem',
            nome_completo: nome_completoTrimmed, // Para manter os dados preenchidos no formulário
            email: emailTrimmed
        });
    }

    // Verificar se o e-mail já está cadastrado
    const checkEmailQuery = 'SELECT * FROM pacientes WHERE email = ?';
    conexao.query(checkEmailQuery, [emailTrimmed], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao verificar o e-mail:', erro);
            return res.render('cadastro', {
                errorMessage: 'Erro ao verificar o e-mail',
                nome_completo: nome_completoTrimmed, 
                email: emailTrimmed
            });
        }

        if (resultado.length > 0) {
            return res.render('cadastro', {
                errorMessage: 'Este e-mail já está cadastrado',
                nome_completo: nome_completoTrimmed,
                email: emailTrimmed
            });
        }

        // Criptografar a senha
        bcrypt.hash(senhaTrimmed, 10, (erro, hash) => {
            if (erro) {
                console.error('Erro ao criptografar a senha:', erro);
                return res.render('cadastro', {
                    errorMessage: 'Erro ao criptografar a senha',
                    nome_completo: nome_completoTrimmed,
                    email: emailTrimmed
                });
            }

            // Inserção no banco de dados
            const query = 'INSERT INTO pacientes (nome_completo, email, senha) VALUES (?, ?, ?)';
            conexao.query(query, [nome_completoTrimmed, emailTrimmed, hash], (erro, resultado) => {
                if (erro) {
                    console.error('Erro ao cadastrar usuário:', erro);
                    return res.render('cadastro', {
                        errorMessage: 'Erro ao cadastrar usuário',
                        nome_completo: nome_completoTrimmed,
                        email: emailTrimmed
                    });
                }

                // Redireciona para a página de login após o cadastro
                res.redirect('/?sucesso=true');  // Ou para outra página como "/login"
            });
        });
    });
});

// Rota para o painel do paciente
router.get('/paciente/dashboard-paciente', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/');  // Se não houver usuário logado, redireciona para a página de login
    }
    const { nome_completo, email } = req.session.usuario;  // Acessando o nome completo da sessão
    res.render('dashboard-paciente', { nome_completo, email });

   
});

// Rota para o painel do funcionário
router.get('/funcionario/dashboard-funcionario', (req, res) => {
    // Verifica se o funcionário está logado
    if (!req.session.funcionario) {
        return res.redirect('/');  // Se não houver funcionário logado, redireciona para a página de login
    }

    const { nome_completo, email, cargo } = req.session.funcionario;  // Acessando os dados do funcionário na sessão

    // Consulta para obter todos os pacientes cadastrados
    const query = 'SELECT id, nome_completo, email FROM pacientes';
    conexao.query(query, (erro, pacientes) => {
        if (erro) {
            console.error('Erro ao buscar pacientes:', erro);
            return res.status(500).send('Erro ao buscar pacientes');
        }

        // Renderiza o dashboard com a lista de alunos após a consulta
        res.render('dashboard-funcionario', { nome_completo, email, pacientes });
    });
});




// Rota para logout
router.get('/logout', (req, res) => {
    req.session.destroy((erro) => {
        if (erro) {
            return res.status(500).send('Erro ao sair da sessão');
        }
        res.redirect('/');  // Redireciona para a página de login
    });
});

// Rota POST para cadastro de funcionário
router.post('/cadastrarfunc', (req, res) => {
    const { nome_completo, email, senha, cargo, data_admissao } = req.body;

    // Remover espaços em branco de nome, email, senha, cargo e data_admissao
    const nome_completoTrimmed = nome_completo.trim();
    const emailTrimmed = email.trim();
    const senhaTrimmed = senha.trim();
    const cargoTrimmed = cargo.trim();
    const data_admissaoTrimmed = data_admissao.trim();
    
    // Verificar se todos os campos foram preenchidos
    if (!nome_completoTrimmed || !emailTrimmed || !senhaTrimmed || !cargoTrimmed || !data_admissaoTrimmed) {
        return res.render('cadastrarfunc', {
            errorMessage: 'Todos os campos são obrigatórios.'
        });
    }

    // Verificar se o e-mail já está cadastrado
    const checkEmailQuery = 'SELECT * FROM funcionarios WHERE email = ?';
    conexao.query(checkEmailQuery, [emailTrimmed], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao verificar o e-mail:', erro);
            return res.status(500).send('Erro ao verificar o e-mail');
        }

        if (resultado.length > 0) {
            return res.render('cadastrarfunc', {
                errorMessage: 'Este e-mail já está cadastrado'
            });
        }

        // Criptografar a senha
        bcrypt.hash(senhaTrimmed, 10, (erro, hash) => {
            if (erro) {
                console.error('Erro ao criptografar a senha:', erro);
                return res.status(500).send('Erro ao criptografar a senha');
            }

            // Inserção no banco de dados com todos os campos
            const query = 'INSERT INTO funcionarios (nome_completo, email, senha, cargo, data_admissao) VALUES (?, ?, ?, ?, ?)';
            conexao.query(query, [nome_completoTrimmed, emailTrimmed, hash, cargoTrimmed, data_admissaoTrimmed], (erro, resultado) => {
                if (erro) {
                    console.error('Erro ao cadastrar funcionário:', erro);
                    return res.status(500).send('Erro ao cadastrar funcionário');
                }

                // Sucesso no cadastro, redireciona para a página de login ou outro local
                res.redirect('/?sucesso=true');  // Ou para outra página como "/login"
            });
        });
    });
});



router.get('/cadastrarfunc', (req, res) => {
    res.render('cadastrarfunc');
   
});

//Rota principal 
router.get('/', (req, res) => {
    // Verifica se o parâmetro de sucesso está presente na query string
    const sucesso = req.query.sucesso === 'true';
    
    // Renderiza a página com a variável de sucesso
    res.render('index', {
        successMessage: sucesso ? 'Cadastro realizado com sucesso!' : '',
        errorMessage: '', // Se necessário, adicione mensagens de erro
    });
});



//ROTAS PAINEL ALUNO ---------------------------------/ 

router.get('/plano-treino', (req, res) => {
    res.render('plano-treino'); // Renderiza o arquivo plano-treino.pug (ou .ejs, dependendo do seu template engine)
});

router.get('/historico', (req, res) => {
    res.render('historico'); // Renderiza o arquivo plano-treino.pug (ou .ejs, dependendo do seu template engine)
});

router.get('/progresso', (req, res) => {
    res.render('progresso'); // Renderiza o arquivo plano-treino.pug (ou .ejs, dependendo do seu template engine)
});

router.get('/configuracoes', (req, res) => {
    res.render('configuracoes'); // Renderiza o arquivo plano-treino.pug (ou .ejs, dependendo do seu template engine)
});

router.get('/dieta', (req, res) => {
    res.render('dieta'); // Renderiza o arquivo plano-treino.pug (ou .ejs, dependendo do seu template engine)
});

    // Rota para deletar paciente
    
router.delete('/funcionario/deletar-paciente/:id', (req, res) => {
    const pacienteId = req.params.id;

    if (!pacienteId) {
        return res.status(400).send('ID do paciente não fornecido');
    }

    const query = 'DELETE FROM pacientes WHERE id = ?';

    conexao.query(query, [pacienteId], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao deletar paciente:', erro);
            return res.status(500).send('Erro ao deletar paciente');
        }

        console.log('Paciente deletado com sucesso!');
        // Resposta adequada: redirecionamento ou status 204 (sem conteúdo)
        res.status(204).send();  // Código 204 indica que a exclusão foi bem-sucedida e não há conteúdo a ser retornado
    });
});



// ------Rota para alterar os dados do aluno---------

router.put('/funcionario/alterar-aluno/:id', (req, res) => {
    const alunoId = req.params.id;
    const { nome_completo, email } = req.body;

    if (!alunoId || !nome_completo || !email) {
        return res.status(400).send('Dados inválidos');
    }

    // Atualizar os dados no banco de dados
    const query = 'UPDATE pacientes SET nome_completo = ?, email = ? WHERE id = ?';
    conexao.query(query, [nome_completo, email, alunoId], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao atualizar aluno:', erro);
            return res.status(500).send('Erro ao atualizar aluno');
        }

        console.log('Aluno atualizado com sucesso!');
        res.status(204).send();  // Retornar sucesso sem corpo
    });
});






module.exports = router;
