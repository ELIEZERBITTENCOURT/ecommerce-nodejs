const Sequelize = require('sequelize');

const sequelize = new Sequelize('api', 'root', 'P@ssword', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
.then(() => {
    console.log("Conexão com o banco de dados realizado com sucesso!");
}).catch( (erro)=> {
    console.log("Erro: Conexão com o banco de dados não realizado! Erro gerado: " + erro);
});

module.exports = sequelize;