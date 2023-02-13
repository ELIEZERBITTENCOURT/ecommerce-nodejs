const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const api = express();
const { Usuario, Produto, Pedido, Pagamento } = require('./models/Models');

api.use(express.json());
api.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3031")
    res.header("Access-Control-Allow-Methods", 'GET, PUT, POST, DELETE');
    api.use(cors());
    next();
});

const secret = 'mysecretkey';

// ROTAS DE AUTENTICAÇÃO
// POST /api/register: rota para registrar um novo usuário
api.post('/register', (req, res) => {
    if (!req.body.nome || !req.body.email || !req.body.senha) {
        return res.status(400).json({
            error: 'Faltam dados na requisição'
        });
    }

    Usuario.create({
        nome: req.body.nome,
        email: req.body.email,
        senha: bcrypt.hashSync(req.body.senha, 10)
    })
        .then(usuarioCriado => {
            return res.status(201).json({
                mensagem: 'Usuário criado com sucesso',
                usuarioCriado
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: 'Ocorreu um erro ao processar sua requisição'
            });
        });
});

// POST /api/login: rota para fazer login com uma conta existente
api.post('/login', (req, res) => {
    const { email, senha } = req.body;

    Usuario.findOne({
        where: {
            email
        }
    })
        .then(usuario => {
            if (!usuario) {
                return res.status(404).json({
                    message: 'Usuário não encontrado'
                });
            }

            bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
                if (!isMatch) {
                    return res.status(401).json({
                        message: 'Senha incorreta'
                    });
                }

                const token = jwt.sign({ id: usuario.id }, secret, { expiresIn: '1h' }, {
                    expiresIn: '1h'
                });

                return res.json({
                    token,
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                });
            });
        })
        .catch(err => {
            return res.status(500).json({
                message: 'Erro ao processar sua requisição'
            });
        });
});

// POST /api/logout: rota para deslogar do site
api.post('/logout', (req, res) => {
    Usuario.findOne({
        where: {
            email: req.body.email
        }
    })
        .then(usuario => {
            if (!usuario) {
                return res.status(400).json({
                    error: 'Usuário não encontrado'
                });
            }

            usuario.token = null;
            usuario.dataExpiracaoToken = null;

            usuario.save()
                .then(() => {
                    return res.json({
                        mensagem: 'Deslogado com sucesso'
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        error: 'Ocorreu um erro ao processar sua requisição'
                    });
                });
        });

});
// ROTAS DOS PRODUTOS
// GET /api/products: rota para obter a lista de todos os produtos
api.get('/products', (req, res) => {
    Produto.findAll()
        .then(produtos => {
            return res.status(200).json({
                mensagem: 'Produtos encontrados com sucesso',
                produtos
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: 'Ocorreu um erro ao processar sua requisição'
            });
        });
});

// GET /api/products/:id: rota para obter informações sobre um produto específico
api.get('/products/:id', (req, res) => {
    Produto.findByPk(req.params.id)
        .then(produto => {
            if (!produto) {
                return res.status(404).json({
                    error: 'Produto não encontrado'
                });
            }
            return res.status(200).json({
                mensagem: 'Produto encontrado com sucesso',
                produto
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: 'Ocorreu um erro ao processar sua requisição'
            });
        });
});

// POST /api/products: rota para adicionar um novo produto
api.post('/products', (req, res) => {
    const novoProduto = req.body;

    Produto.create(novoProduto)
        .then(produto => {
            return res.status(201).json({
                mensagem: 'Produto criado com sucesso',
                produto
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: 'Ocorreu um erro ao processar sua requisição'
            });
        });
});

//PUT /api/products/:id: rota para atualizar informações sobre um produto
api.put('/products/:id', (req, res) => {
    const id = req.params.id;
    const dadosAtualizados = req.body;

    Produto.update(dadosAtualizados, { where: { id } })
        .then(result => {
            if (result[0] === 0) {
                return res.status(404).json({
                    error: 'Produto não encontrado'
                });
            }

            return res.status(200).json({
                mensagem: 'Produto atualizado com sucesso'
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: 'Ocorreu um erro ao processar sua requisição'
            });
        });
});

// DELETE /api/products/:id: rota para excluir um produto
api.delete('/products/:id', (req, res) => {
    const productId = req.params.id;

    const product = findProductById(productId);
    if (!product) {
        return res.status(404).json({
            message: 'Produto não encontrado'
        });
    }

    deleteProduct(productId);

    return res.json({
        message: 'Produto excluído com sucesso'
    });
});
// ROTAS DE PEDIDOS
// GET /api/orders: rota para obter a lista de todos os pedidos do usuário
api.get('/orders', async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Pedido.findAll({
            where: {
                userId: userId
            }
        });
        return res.json({ orders });
    } catch (err) {
        return res.status(500).json({ message: "Erro ao buscar pedidos." });
    }
});

// POST /api/orders: rota para criar um novo pedido
api.post('/orders', async (req, res) => {
    try {
      const { data, quantidade, valor_total } = req.body;
      const order = await Pedido.create({
        data,
        quantidade,
        valor_total
      });
      return res.json({ order });
    } catch (err) {
      return res.status(500).json({ error: 'Ocorreu um erro ao criar o pedido' });
    }
  });

// GET /api/orders/:id: rota para obter informações sobre um pedido específico
api.get('/orders/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await Pedido.findOne({
            where: { id: orderId },
            include: [Produto, Usuario, Pagamento]
        });
        if (!order) {
            return res.status(404).json({
                error: "Pedido não encontrado"
            });
        }
        return res.json({
            order: order
        });
    } catch (err) {
        return res.status(500).json({
            error: "Ocorreu um erro ao processar sua requisição"
        });
    }
});

// PUT /api/orders/:id: rota para atualizar informações sobre um pedido
api.put('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const updates = req.body;

    Pedido.update(updates, {
        where: {
            id: orderId,
            userId: req.user.id
        }
    })
        .then(updated => {
            if (!updated) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
            return res.json({ success: true });
        })
        .catch(error => {
            return res.status(500).json({ error: error.message });
        });
});

// DELETE /api/orders/:id: rota para excluir um pedido
api.delete('/orders/:id', (req, res) => {
    const orderId = req.params.id;

    Pedido.destroy({
        where: {
            id: orderId
        }
    })
        .then(() => res.json({ message: 'Pedido excluído com sucesso' }))
        .catch(err => res.status(500).json({ error: err.message }));
});
// ROTA DE PAGAMENTO
// POST /api/payments: rota para processar um pagamento
api.post('/payments', (req, res) => {
    const { data, valor, metodo } = req.body;
  
    Pagamento.create({
      data,
      valor,
      metodo
    })
      .then(payment => {
        res.json({
          success: true,
          payment
        });
      })
      .catch(error => {
        res.status(400).json({
          success: false,
          error: error.message
        });
      });
  });

api.listen(3031, () => {
    console.log("Servidor iniciado na porta 3031: http://localhost:3031");
});
 

module.exports = api;
