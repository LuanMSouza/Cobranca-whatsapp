const express = require("express")
const app = express()
const cors = require('cors')
const port = 4000
const { Pool } = require('pg')
const path = require('path')
const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')


app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'devedores',
    password: 'Ngs120421',
    port: 5432
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Rejeição não tratada:', reason);
});

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log('WhatsApp conectado!');
});

client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação do WhatsApp:', msg);
});

client.on('disconnected', (reason) => {
    console.warn('WhatsApp desconectado:', reason);
    // Aqui você pode tentar reiniciar o client ou avisar o usuário
});

client.on('error', (err) => {
    console.error('Erro no cliente WhatsApp:', err);
});

// client.initialize();

async function enviarMensagem(numero, mensagem) {
    try {
        await client.sendMessage(`${numero}@c.us`, mensagem);
        console.log(`✅ Mensagem enviada para ${numero}`);
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
    }
}

pool.connect()
    .then(() => console.log('Conectado ao PostgreSQL'))
    .catch(err => console.error('Erro na conexão', err));



app.get('/clientes', async (req, res) => {

    try {
        const dados = await pool.query('SELECT * FROM clientes ORDER BY nome ')

        res.status(200).json(dados.rows)

    } catch (error) {

    }
})

app.post('/clientes', async (req, res) => {
    const dados = req.body;

    try {
        await pool.query("INSERT INTO clientes (nome, whatsapp) VALUES ($1, $2)", [dados.nome, dados.zap || null])
        res.status(200).send('usuario cadastrado com sucesso')
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.get('/pedidos/:id', async (req, res) => {
    const id = req.params.id

    try {
        const result = await pool.query('SELECT * FROM pedidos WHERE id_cliente = $1 ORDER BY data DESC', [id])

        res.status(200).json(result.rows)
    } catch (error) {
        console.log(error);
    }

})

app.put('/pedidos/:id', async (req, res) => {

    const id = req.params.id
    const valor = req.body.valor

    try {
        const valorTotal = await pool.query('SELECT valor_restante, id_cliente FROM pedidos WHERE id = $1', [id])

        const valorCorreto = parseFloat(valorTotal.rows[0].valor_restante) >= parseFloat(valor)

        if (!valorCorreto) {
            return res.status(400).json({ erro: 'Pagamento maior que o saldo restante.' });
        }


        const valor_Total = valorTotal.rows[0].valor_restante

        const novoValor = valor_Total - valor

        const idDoCliente = valorTotal.rows[0].id_cliente

        await pool.query('UPDATE pedidos SET valor_restante = $1 WHERE id = $2', [novoValor, id]);
        await pool.query('UPDATE pedidos SET valor_abatido = valor_abatido + $1 WHERE id = $2', [valor, id]);

        await pool.query('UPDATE clientes SET devedor = devedor - $1 WHERE id = $2', [valor, idDoCliente])
        await pool.query('UPDATE clientes SET pagou = pagou + $1 WHERE id = $2', [valor, idDoCliente])

        res.status(200).json({
            mensagem: 'Sucesso ao realizar o pagamento!',
            clientId: idDoCliente
        });

    } catch (error) {
        console.log(error);
        res.status(200).json(`erro ao registrar pagamento: ${error}`)

    }

})

app.post('/pedidos', async (req, res) => {
    const dados = req.body


    try {
        const db = await pool.query("INSERT INTO pedidos (id_cliente, valor_inicial, valor_restante, data) VALUES ($1, $2, $3, $4);", [dados.clienteSelect, dados.valorNota, dados.valorNota, dados.dataNota])
        const dbdois = await pool.query("UPDATE clientes SET devedor = devedor + $1 , ultima_compra = $2 WHERE id = $3", [dados.valorNota, dados.dataNota, dados.clienteSelect])

        res.status(200).json(db)
    } catch (error) {
        console.log(error);
    }
})

app.get('/cobrar/:id', async (req, res) => {
    const id = req.params.id

    try {

        if (!client.info || !client.info.wid) {
            return res.status(503).json({ mensagem: 'Whatsapp iniciando...' });
        }

        const dados = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id])

        const dadosClientes = await pool.query('SELECT * FROM clientes WHERE id = $1', [dados.rows[0].id_cliente])

        const dataCompra = (dados.rows[0].data).toLocaleDateString('pt-BR');

        if (!dadosClientes.rows[0].whatsapp) {
            return res.status(503).json({ mensagem: 'Whatsapp não informado no cadastro!!' })
        }

        enviarMensagem('55' + dadosClientes.rows[0].whatsapp, `Olá *${dadosClientes.rows[0].nome}*! 
             \nPoderia me encaminhar o comprovante no valor de *R$ ${dados.rows[0].valor_restante}* do dia *${dataCompra}* para darmos baixa?? \n
             \`Essa é uma mensagem automatica\``)

        res.status(200).json({ mensagem: 'Mensagem enviada!!' })

    } catch (error) {

        res.status(503).json('Whatsapp iniciando...')

    }
})

app.get('/clienteDetalhado/:id', async (req, res) => {
    try {
        const idCliente = req.params.id;

        const dadosCliente = await pool.query('SELECT * FROM clientes WHERE id=$1', [idCliente]);
        const dadosFaturas = await pool.query('SELECT * FROM pedidos WHERE id_cliente = $1', [idCliente]);

        res.status(200).json({
            cliente: dadosCliente.rows[0],
            faturas: dadosFaturas.rows
        });
    } catch (err) {
        console.error('Erro no endpoint /clienteDetalhado:', err);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// rota
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, (req, res) => {
    console.log(`servidor rodando na porta ${port}`);

})