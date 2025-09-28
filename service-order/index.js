// service-order/index.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3001;

app.use(express.json());

const db = new sqlite3.Database("./pedidos.db", (err) => {
  if (err) console.error("Erro ao conectar ao SQLite:", err.message);
  else console.log("Conectado ao banco SQLite");
});

// Criar tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    formaDePagamento TEXT NOT NULL,
    valorProduto DECIMAL NOT NULL,
    quantidade INTEGER NOT NULL,
    valorTotal DECIMAL NOT NULL,
    processado BOOLEAN DEFAULT 0
  )
`);

app.get("/orders", (req, res) => {
  db.all("SELECT * FROM pedidos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get("/orders-to-process", (req, res) => {
  db.all("SELECT * FROM pedidos where processado = 0", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Criar novo pedido
app.post("/orders", (req, res) => {
  const { nomeProduto, formaDePagamento, valorProduto, quantidade } = req.body;
  console.log(req.body)
  if (!nomeProduto || !formaDePagamento || !valorProduto || !quantidade) {
    return res.status(400).json({ error: "Produto e valor são obrigatórios" });
  }

  valorTotal = (valorProduto*quantidade)
  
  db.run("INSERT INTO pedidos (nomeProduto, formaDePagamento, valorProduto, quantidade, valorTotal) VALUES (?, ?, ?, ?, ?)", [nomeProduto, formaDePagamento, valorProduto, quantidade, valorTotal], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, nomeProduto, formaDePagamento, valorProduto, quantidade, valorTotal });
  });
});

app.put("/orders", (req, res) => {
  const { id } = req.body;
  console.log(req.body)
  if ( !id ) {
    return res.status(400).json({ error: "id é obrigatorio"});
  }
  db.run("UPDATE pedidos SET processado = 1 where id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id });
})})

app.listen(PORT, () => {
  console.log(`🚀 ServiceOrder rodando em http://localhost:${PORT}`);
});
