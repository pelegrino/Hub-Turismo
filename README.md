<p align="center">
  <img src="src-tauri/icons/icon.png" alt="Hub Turismo" width="96" height="96">
</p>

<h1 align="center">Hub Turismo</h1>

<p align="center">
  <strong>Agenda de Contatos para o Setor de Turismo</strong>
  <br>
  Aplicação desktop moderna com Rust + Tauri 2 + React + SQLite
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust">
  <img src="https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black" alt="Tauri">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

---

## 📋 Sobre

O **Hub Turismo** é uma aplicação desktop para gerenciamento de contatos comerciais do setor de turismo. Permite cadastrar, organizar e buscar empresas, hotéis, pousadas, operadoras, resorts e prestadores de serviço, com filtros por categoria, cidade, estado e evento.

### ✨ Funcionalidades

- **📇 Cadastro completo** — Registre empresas com nome, representante, cargo, telefone, e-mail, site, endereço, tags e evento
- **🔍 Busca inteligente** — Pesquise por qualquer campo (nome, telefone, e-mail, cidade…)
- **🏷️ Filtros por categoria** — Hotéis, Pousadas, Resorts, Operadoras, Receptivo, Seguros e mais
- **📍 Filtros geográficos** — Por cidade, estado e evento
- **📱 Cards comerciais** — Visualização em cartão de visita com avatar, contatos e links clicáveis
- **✏️ Edição rápida** — Clique em qualquer card para editar
- **🗑️ Exclusão com confirmação** — Remova contatos com segurança
- **💾 Backup e restauração** — Exporte todos os dados para JSON e importe quando precisar

---

## 🚀 Começando

### Pré-requisitos

- [Rust](https://www.rust-lang.org/) (edition 2021)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) ou npm
- [Tauri CLI](https://v2.tauri.app/start/cli/)

```bash
# Instalar Tauri CLI
cargo install tauri-cli --version "^2.0"
```

### Desenvolvimento

```bash
# Clonar o repositório
git clone https://github.com/pelegrino/Hub-Turismo.git
cd Hub-Turismo

# Instalar dependências do frontend
cd frontend
npm install
cd ..

# Executar em modo dev (com live-reload)
cd src-tauri
cargo tauri dev
```

### Build para produção

```bash
cd src-tauri

# Linux (no Arch, use NO_STRIP=1 para evitar erro no strip)
NO_STRIP=1 cargo tauri build

# O binário será gerado em: target/release/app
# Pacotes em: target/release/bundle/
```

### AppImage Portátil (Arch Linux)

O AppImage gerado pelo Tauri empacota as bibliotecas WebKit do sistema de build,
que podem conter instruções específicas da CPU (ex: AVX-512). Isso causa erro
**SIGILL (Signal 4)** em CPUs mais antigas.

Para gerar um AppImage **portátil** que usa o WebKit do sistema de destino:

```bash
cd src-tauri
chmod +x scripts/build-portable-appimage.sh
./scripts/build-portable-appimage.sh
```

O AppImage resultante estará em `src-tauri/target/release/bundle/appimage/Hub-Turismo-0.1.0-x86_64.AppImage`.

> **Pré-requisitos na máquina de destino:** O sistema precisa ter `webkitgtk-6.0` e
> `javascriptcoregtk-4.1` instalados (já presentes na maioria dos desktops Arch/GNOME).

---

## 📦 Estrutura do Projeto

```
HubTurismo/
├── frontend/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── EmpresaDashboard.tsx   # Dashboard principal
│   │   │   ├── EmpresaForm.tsx        # Formulário (criar/editar)
│   │   │   └── BackupRestore.tsx      # Backup e restauração
│   │   ├── utils/helpers.ts     # Funções utilitárias
│   │   ├── api.ts               # Chamadas ao backend Tauri
│   │   ├── types.ts             # Tipos TypeScript
│   │   ├── App.tsx              # Entry point
│   │   └── App.css              # Estilos
│   ├── package.json
│   └── vite.config.ts
│
└── src-tauri/                   # Backend Rust
    ├── src/
    │   ├── commands/
    │   │   ├── empresas.rs      # CRUD + listas
    │   │   └── backup.rs        # Exportar/Importar backup
    │   ├── database/
    │   │   ├── mod.rs           # Inicialização SQLite
    │   │   └── migrations.rs    # Migrations + seed de dados
    │   ├── models/empresa.rs    # Modelo Empresa
    │   ├── lib.rs               # Config Tauri + plugins
    │   └── main.rs              # Entry point
    ├── icons/                   # Ícones do app
    └── tauri.conf.json          # Configuração Tauri
```

---

## 🗄️ Banco de Dados

- **SQLite** local, sem necessidade de servidor
- Banco criado automaticamente em: `~/.local/share/com.hubturismo.app/hubturismo.db`
- Backup/restore via arquivo JSON portável

### Comandos disponíveis

| Comando | Descrição |
|---|---|
| `listar_empresas` | Lista empresas com paginação e filtros |
| `buscar_empresa` | Busca uma empresa por ID |
| `criar_empresa` | Cria novo contato |
| `atualizar_empresa` | Atualiza dados de um contato |
| `deletar_empresa` | Remove um contato |
| `listar_cidades` | Lista cidades disponíveis |
| `listar_estados` | Lista estados disponíveis |
| `listar_eventos` | Lista eventos disponíveis |
| `listar_tags` | Lista categorias disponíveis |
| `exportar_backup` | Exporta dados para JSON |
| `importar_backup` | Importa dados de JSON |

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| **Desktop Framework** | [Tauri 2](https://v2.tauri.app/) |
| **Linguagem Backend** | [Rust](https://www.rust-lang.org/) |
| **Banco de Dados** | [SQLite](https://www.sqlite.org/) via [sqlx](https://github.com/launchbadge/sqlx) |
| **Frontend** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Vite** | [Vite](https://vitejs.dev/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Build** | [Vite](https://vitejs.dev/) + [Cargo](https://doc.rust-lang.org/cargo/) |

---

## 📄 Licença

MIT © 2026 Pelegrino

---

<p align="center">
  Feito com ❤️ e ☕ usando Rust + Tauri
</p>
