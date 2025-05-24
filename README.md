# 🧾 Sistema Local de Cobrança com WhatsApp

Sistema simples e prático para lojas que controlam dívidas de clientes. Ideal para substituir o papel, a calculadora e a desorganização, com registro digital e envio de cobranças automáticas via WhatsApp Web.

---

## 🚩 Problema que resolve

Antes:
- Dívidas eram anotadas em papéis
- Valores somados na calculadora
- Alto risco de erro e perda de informação

Depois:
- Cadastro de clientes
- Registro de vendas
- Histórico completo
- Cobrança automática via WhatsApp

---

## ⚙️ Funcionalidades

- Página inicial com:
  - Lista de clientes
  - Valor em aberto
  - Última compra
  - Status do WhatsApp

- Página de cliente com:
  - Histórico de pedidos
  - Botões para:
    - **Pagamento total**
    - **Pagamento parcial**
    - **Cobrança via WhatsApp**

---

## 💬 Mensagem automática do WhatsApp

O sistema utiliza o WhatsApp Web e envia uma mensagem padrão como esta:

"Olá [Nome]! Poderia me encaminhar o comprovante no valor de R$ [valor] do dia [data] para darmos baixa?

Essa é uma mensagem automática"


---

## 🧱 Estrutura de pastas

📦 devedores    
    ├── 📁 .wwebjs_auth # Arquivos de autenticação do WhatsApp Web (não apagar!) 
    ├── 📁 .wwebjs_cache # Cache do WhatsApp Web (não apagar!) 
    ├── 📁 node_modules 
    ├── 📁 assets # Imagens e arquivos estáticos (se desejar)
    ├── 📁 public
        ├── index.html # Interface do sistema 
        ├── script.js # Lógica do frontend 
        ├── style.css # Estilo da aplicação 
    ├── 📄 server.js # Backend Node.js com Express e WhatsApp 
    ├── 📄 package.json # Dependências e scripts 
    ├── 📄 package-lock.json # Controle de versões 
└── 📄 README.md # Este arquivo

---

## 📌 Observações

- As pastas `.wwebjs_auth` e `.wwebjs_cache` **não devem ser apagadas**, pois contêm os dados da sessão do WhatsApp.  
- Caso queira trocar de número ou resetar, basta deletá-las.

---

## 📌 Versões

### v1.1.0 - 2025-05-24
- Adicionada funcionalidade de pagamento parcial
- Validação de valor antes do pagamento
- Correção no carregamento do detalhado
- Estilização de cards pagos
- Correção de bugd (pagamentos negativos)

### v1.0.0 - 2025-05-10
- Sistema inicial de pedidos e clientes
- Cadastro e visualização básica


## 🧑‍💻 Autor

Desenvolvido por **Luan** — sistema real, local e funcional, já em uso em loja física.
👉 [https://luansouzadev.com.br](https://luansouzadev.com.br)




Este sistema é propriedade intelectual de Luan Souza.  
Todos os direitos reservados. O uso, cópia ou redistribuição sem autorização é proibido.
