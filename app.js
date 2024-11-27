// Carregando as variáveis de ambiente do arquivo .env

require('dotenv').config();
const express = require("express");
const { create } = require('express-handlebars');  
const app = express();
const conexao = require('./utils/db');

   
    // Importando as rotas

    const routes = require('./routes/index');
    

    // Configuração do Handlebars como motor de template

    const hbs = create();  
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');  


    // Middleware

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));



    // Teste de conexão
    conexao.connect((erro)=> {
        if (erro) {
            console.error('Erro de conexão: no banco de dados ', erro); 
        throw erro;
        }
        console.log('Conexão com o banco de dados realizada com sucesso!');
    });


    // Usando o roteador para as rotas
    app.use(routes); 
    


    // Servindo arquivos estáticos (CSS, JS, imagens, etc)

    app.use(express.static('public'));  
    
    
    // Inicialização do Servidor
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });




