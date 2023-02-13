const Sequelize = require('sequelize');
const db = require('./databaseConnection');

const Usuario = db.define('Usuario', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Usuario.sync()

const Produto = db.define('Produto', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  preco: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  descricao: {
    type: Sequelize.TEXT,
    allowNull: false
  }
});

Produto.sync()

const Pedido = db.define('Pedido', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: Sequelize.DATE,
    allowNull: false
  },
  quantidade: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  valor_total: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

Pedido.sync()

const Pagamento = db.define('Pagamento', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: Sequelize.DATE,
    allowNull: false
  },
  valor: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  metodo: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Pagamento.sync()

Usuario.hasMany(Pedido, { onDelete: 'cascade' });
Pedido.belongsTo(Usuario);

Produto.hasMany(Pedido, { onDelete: 'cascade' });
Pedido.belongsTo(Produto);

Pedido.hasOne(Pagamento, { onDelete: 'cascade' });
Pagamento.belongsTo(Pedido);

module.exports = {
  Usuario,
  Produto,
  Pedido,
  Pagamento
};
