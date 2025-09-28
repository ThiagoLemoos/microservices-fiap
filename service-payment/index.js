// service-payment/index.js
const express = require("express");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3030;

app.use(express.json());

const db = new sqlite3.Database("./pagamentos.db", (err) => {
  if (err) console.error("Erro ao conectar ao SQLite:", err.message);
  else console.log("Conectado ao banco SQLite (ServicePayment)");
});


// Criar tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS pagamentosProcessados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomeProduto TEXT NOT NULL,
    formaDePagamento TEXT NOT NULL,
    valorProduto DECIMAL NOT NULL,
    quantidade INTEGER NOT NULL,
    valorTotal DECIMAL NOT NULL,
    processado BOOLEAN DEFAULT 1
  )
`);

const SERVICE_ORDER_URL = "http://localhost:3001";

// Rota para processar pagamentos
app.post("/orders", async (req, res) => {
  try {
    // Buscar pedidos pendentes no ServiceOrder
    const response = await axios.get(`${SERVICE_ORDER_URL}/orders-to-process`);
    const pendingOrders = response.data;

    if (pendingOrders.length === 0) {
      return res.json({ message: "Nenhum pagamento pendente" });
    }

    for (const order of pendingOrders) {
      //TRATAR POSSIVEIS ERROS DE DUPLICIDADE
      db.run("INSERT OR IGNORE INTO pagamentosProcessados (id, nomeProduto, formaDePagamento, valorProduto, quantidade, valorTotal, processado) VALUES (?, ?, ?, ?, ?, ?, 1)", [order.id, order.nomeProduto, order.formaDePagamento, order.valorProduto, order.quantidade, order.valorTotal]
);

      await axios.put(`${SERVICE_ORDER_URL}/orders`, { id: order.id });
    }

    res.json({ message: "Pagamentos confirmados", confirmed: pendingOrders.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ServicePayment rodando em http://localhost:${PORT}`);
});
