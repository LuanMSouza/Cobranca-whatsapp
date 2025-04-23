
const url = 'http://localhost:4000'

// functions abrir

function abrir(aba) {
    const abaAberta = document.getElementById(aba)

    document.getElementById('detalhado').style.display = 'none'
    document.getElementById('cadastrarCliente').style.display = 'none'
    document.getElementById('lancarNota').style.display = 'none'
    document.getElementById('pagamentoParcial').style.display = 'none'

    abaAberta.style.display = 'flex'
}

function fechar() {
    document.getElementById('detalhado').style.display = 'none'
    document.getElementById('cadastrarCliente').style.display = 'none'
    document.getElementById('lancarNota').style.display = 'none'
    document.getElementById('pagamentoParcial').style.display = 'none'

}

async function abrirDetalhado(id) {
    document.getElementById('detalhado').style.display = 'flex'

    try {
        const dados = await fetch(`${url}/pedidos/${id}`, {
            method: 'get'
        })

        const dadosCertos = await dados.json()

        console.log(dadosCertos);

        document.getElementById('detalhado_container').innerHTML = ''

        dadosCertos.forEach(linha => {



            const dataFormatada = new Date(linha.data).toLocaleDateString();

            const div = document.createElement('div');
            div.classList.add('cardDetalhado');

            const cardEsq = document.createElement('div');
            cardEsq.classList.add('cardEsq');

            const detalhadoValor = document.createElement('p');
            detalhadoValor.classList.add('detalhadoValor');
            detalhadoValor.innerHTML = `<span id='valor${linha.id}'>${(linha.valor_inicial - linha.valor_abatido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>`;

            if (linha.valor_inicial - linha.valor_abatido === 0) {
                div.classList.add('detalhadoPago')
            }


            const detalhadoJaPago = document.createElement('p');
            detalhadoJaPago.classList.add('detalhadoJaPago');
            detalhadoJaPago.innerHTML = `Já abatido R$ <span>${linha.valor_abatido}</span>`;

            const detalhadoData = document.createElement('p');
            detalhadoData.classList.add('detalhadoData');
            detalhadoData.textContent = `${dataFormatada}`;

            cardEsq.append(detalhadoValor, detalhadoJaPago, detalhadoData);

            const cardDir = document.createElement('div');
            cardDir.classList.add('cardDir');

            if (linha.valor_inicial - linha.valor_abatido != 0) {

                const btnTotal = document.createElement('button');
                btnTotal.textContent = 'Pagamento total';
                btnTotal.onclick = () => pagamentoTotal(linha.id)

                const btnParcial = document.createElement('button');
                btnParcial.textContent = 'Pagamento parcial';
                btnParcial.onclick = () => pagamentoParcial(linha.id)

                const btnCobranca = document.createElement('button');
                btnCobranca.textContent = 'Enviar cobrança';
                btnCobranca.onclick = () => cobrar(linha.id)


                cardDir.append(btnTotal, btnParcial, btnCobranca);

            }

            div.append(cardEsq, cardDir);

            document.getElementById('detalhado_container').appendChild(div);

        })

    } catch (error) {
        alert(error)
    }
}

function pagamentoParcial(id) {
    document.getElementById('pagamentoParcial').style.display = 'flex'

    if (document.getElementById('botaoCriado')) {
        document.getElementById('botaoCriado').remove()
    }

    const btn = document.createElement('button')
    btn.onclick = () => lancarPagamentoParcial(id)
    btn.id = 'botaoCriado'
    btn.textContent = 'Lançar'

    document.getElementById('pagamentoParcial').appendChild(btn)
}

async function cobrar(id) {
    console.log('pegou aq')


    try {
        const response = await fetch(`/cobrar/${id}`);

        const data = await response.json();

        alert(data.mensagem); // Exibe o alerta com a resposta do servidor
    } catch (error) {
        alert('Erro ao conectar ao servidor');
    }
}

document.getElementById('olhoAberto').addEventListener('click', () => {
    document.getElementById('olhoAberto').style.display = 'none'
    document.getElementById('olhoFechado').style.display = 'block'

    document.getElementById('totalNaRua').type = 'text'
})

document.getElementById('olhoFechado').addEventListener('click', () => {
    document.getElementById('olhoAberto').style.display = 'block'
    document.getElementById('olhoFechado').style.display = 'none'

    document.getElementById('totalNaRua').type = 'password'

})

// CRUD

async function cadastrarCliente() {
    const nome = document.getElementById('nomeCadastro').value
    const zap = document.getElementById('whatsappCadastro').value || null


    if (!nome) {
        alert('nome obrigatório')
        return
    }
    try {
        const data = await fetch(`${url}/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, zap })
        });

        if (data.ok) {
            alert('Cliente cadastrado com sucesso')
            window.location.reload()
        }


    } catch (error) {
        alert(error)
    }
}

async function lancarNota() {
    const clienteSelect = document.getElementById('clienteSelecionado').value
    const valorNota = document.getElementById('valorNota').value
    const dataNota = document.getElementById('dataSelecionada').value

    if (!clienteSelect) {
        alert('selecione um cliente')
        return
    }
    if (!valorNota || valorNota < 0) {
        alert('valor inválido')
        return
    }
    if (!dataNota) {
        alert('Data inválida')
        return
    }



    try {
        const data = await fetch(`${url}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ clienteSelect, valorNota, dataNota })
        })

        if (data.ok) {
            alert('Pedido lançado com sucesso!')
            window.location.reload()
        }


    } catch (error) {
        alert(error)
    }
}

async function pagamentoTotal(id) {

    const valorSemFormatacao = document.getElementById(`valor${id}`).textContent
    let valor = valorSemFormatacao.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();

    valor = parseFloat(valor); // Converte para número real

    if (!confirm(`Confirmar pagamento total?`)) {
        alert('pagamento cancelado')
        return
    }

    try {
        const dados = await fetch(`${url}/pedidos/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ valor })
        });

        const resposta = await dados.json();

        if (dados.ok) {
            window.location.reload()
        }

        // Converte o objeto em string para exibição no alert
        alert(JSON.stringify(resposta, null, 2));
    } catch (error) {
        console.log(error);
    }

}

async function lancarPagamentoParcial(id) {

    let valor = document.getElementById('valorPagamentoParcial').value;
    const valorReal = parseFloat(valor)

    if (isNaN(valorReal) || valorReal == 0 || valorReal < 0) {
        alert('valor inválido')
        return
    }

    if (!confirm(`Confirmar pagamento no valor de ${valorReal} ?`)) {
        alert('pagamento cancelado')
        return
    }

    try {
        const dados = await fetch(`${url}/pedidos/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ valor })
        });

        const resposta = await dados.json();

        if (dados.ok) {
            window.location.reload()
        }

        // Converte o objeto em string para exibição no alert
        alert(JSON.stringify(resposta, null, 2));
    } catch (error) {
        console.log(error);
    }

}

// inicialização

async function carregarClientes() {
    const clientesRecebidos = await fetch(`${url}/clientes`, { method: 'get' })

    const clientes = await clientesRecebidos.json()

    clientes.forEach(cliente => {
        const criarOpt = document.createElement('option')
        criarOpt.value = cliente.id
        criarOpt.textContent = cliente.nome

        document.getElementById('clienteSelecionado').appendChild(criarOpt)


        if (parseFloat(cliente.devedor) === 0) {
            return
        }

        const dataISO = cliente.ultima_compra;
        const dataFormat = new Date(dataISO).toLocaleDateString("pt-BR");

        const valorISO = parseFloat(cliente.devedor)
        const valorFormat = valorISO.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


        const div = document.createElement('div')
        div.className = 'card'
        div.onclick = () => abrirDetalhado(cliente.id)

        const zipzop = document.createElement('div')
        zipzop.classList.add('zipzop')

        if (cliente.whatsapp) {
            zipzop.classList.add('conectado')
        } else {
            zipzop.classList.add('desconectado')
        }

        const nome = document.createElement('p')
        nome.className = 'nome'
        nome.textContent = cliente.nome

        const ult = document.createElement('p')
        ult.className = 'ultimaCompra'
        ult.textContent = 'Ultima compra :'

        const data = document.createElement('p')
        data.className = 'data'
        data.textContent = dataFormat

        const valor = document.createElement('p')
        valor.className = 'valor'

        const spanValor = document.createElement('span')
        spanValor.textContent = valorFormat

        valor.appendChild(spanValor)

        div.appendChild(nome)
        div.appendChild(ult)
        div.appendChild(data)
        div.append(zipzop)
        div.appendChild(valor)

        document.getElementById('contas').appendChild(div)
    })
}

async function calcularTotal() {

    let totalContas = 0
    try {
        const dadosRecebidos = await fetch(`${url}/clientes`, {
            method: 'GET'
        })

        const dados = await dadosRecebidos.json()

        dados.forEach(linha => {
            totalContas += Number(linha.devedor)
        })

        totalContasFormatado = parseFloat(totalContas).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        document.getElementById('totalNaRua').value = totalContasFormatado

        console.log(totalContasFormatado);

    } catch (error) {

    }
}



carregarClientes()
calcularTotal()