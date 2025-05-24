const cliente = localStorage.getItem('cliente')

if (!cliente) {
    window.location.href = 'index.html'
}
const url = 'http://localhost:4000'

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatarData(data) {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // meses começam em 0
    const ano = String(d.getFullYear()).slice(-2); // últimos 2 dígitos do ano
    return `${dia}/${mes}/${ano}`;
}

async function carregarDados() {
    try {
        const data = await fetch(`${url}/clienteDetalhado/${cliente}`, { method: 'GET' })

        const dadosRecebidos = await data.json()

        document.getElementById('nomeCliente').innerText = dadosRecebidos.cliente.nome

        const faturas = dadosRecebidos.faturas

        // faturas
        const faturasContainer = document.getElementById('faturas')
        faturas.map(fatura => {

            const div = document.createElement('div')
            div.className = 'faturaCard'
            div.innerHTML = `
                <p>${formatarMoeda(parseFloat(fatura.valor_inicial))}</p>
                <p>${formatarData(fatura.data)}</p>
            `
            faturasContainer.appendChild(div)
        })

        // medias
        const cincoPrimeiros = faturas.slice(0, 10).map(f => parseFloat(f.valor_inicial));
        const soma = cincoPrimeiros.reduce((acc, val) => acc + val, 0)
        const media = cincoPrimeiros.length > 0 ? soma / cincoPrimeiros.length : 0;

        document.getElementById('media').innerText = formatarMoeda(media)

        // total compras
        document.getElementById('vendasTotais').innerText = faturas.length

        // Ultima compra

        const faturaMaisRecente = faturas.reduce((maisRecente, atual) => {
            const dataMaisRecente = new Date(maisRecente.data);
            const dataAtual = new Date(atual.data);

            return dataAtual > dataMaisRecente ? atual : maisRecente;
        });

        document.getElementById('ultimaCompra').innerText = formatarData(faturaMaisRecente.data)

    } catch (error) {
        console.log(error);
    }

}

carregarDados()