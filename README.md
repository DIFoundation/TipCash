# TipCash

> Privacy-first peer-to-peer tipping powered by Zcash.

TipCash is a decentralized tipping platform built on **Zcash** that enables creators, developers, communities, and individuals to send and receive tips privately using shielded transactions.

Unlike traditional crypto payment platforms where every transaction is publicly visible, TipCash leverages Zcash's privacy-preserving technology to protect users' financial information while providing a simple, modern tipping experience.

Built for the **Zcash Hackathon**.

---

# ✨ Features

- 🔐 Secure authentication
- 👛 Automatic wallet creation for every user
- 🧑 One independent wallet per user
- 💸 Send ZEC to other users
- 📥 Receive ZEC via Unified Address
- 📜 Transaction history
- 💰 Wallet balance
- 📱 QR Code payment support
- 🌐 Zcash Testnet support
- 🚀 Mainnet-ready architecture

---

# Why TipCash?

Content creators and developers often publish public wallet addresses to receive donations. Unfortunately, this exposes:

- Wallet balances
- Transaction history
- Donor identities
- Spending activity

TipCash solves this problem by bringing **Zcash privacy** into the tipping experience.

Users can receive tips while maintaining financial privacy.

---

# Architecture

```text
                   User
                     │
                     ▼
          Authentication (Supabase)
                     │
                     ▼
              User Profile
                     │
                     ▼
          Wallet Service (Server)
                     │
                     ▼
               Zingo CLI
                     │
                     ▼
             Lightwalletd
                     │
                     ▼
             Zcash Blockchain
```

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Next.js API Routes
- Supabase

## Blockchain

- Zcash
- Zingo CLI
- Lightwalletd

---

# How It Works

### 1. User Registration

Users authenticate through Supabase.

---

### 2. Wallet Creation

Upon registration, TipCash automatically:

- Creates a dedicated wallet directory
- Initializes a Zingo wallet
- Generates a Unified Address
- Generates Transparent addresses
- Stores wallet metadata securely

Every authenticated user owns an independent wallet.

---

### 3. Receiving Tips

Anyone can send ZEC to the user's Unified Address.

---

### 4. Sending Tips

Users can send ZEC directly from their wallet using Zingo CLI.

---

### 5. Viewing Transactions

Users can:

- View wallet balance
- View transaction history
- View receiving address
- Generate additional addresses

---

# Wallet Architecture

Each authenticated user has a dedicated wallet directory.

```text
wallets/

├── user-a/
│   ├── zingo-wallet.dat
│   └── config
│
├── user-b/
│   ├── zingo-wallet.dat
│   └── config
│
└── user-c/
    ├── zingo-wallet.dat
    └── config
```

Wallets are completely isolated from one another.

---

# Database Structure

Example profile fields:

| Field | Description |
|--------|-------------|
| id | User ID |
| email | User email |
| wallet_path | Local wallet directory |
| zcash_address | User Unified Address |
| created_at | Creation timestamp |

---

# Privacy

TipCash supports Zcash Unified Addresses.

Depending on the wallet configuration, funds may exist in:

- Orchard
- Sapling
- Transparent

The application is designed to support shielded transactions while maintaining compatibility with the Zcash ecosystem.

---

# Zingo CLI Integration

TipCash communicates with the blockchain through **Zingo CLI**.

Commands used include:

### Create Wallet

```bash
zingo-cli --chain testnet --data-dir wallets/<user-id>
```

---

### List Addresses

```bash
zingo-cli addresses
```

---

### Generate Transparent Address

```bash
zingo-cli new_taddress
```

---

### Check Balance

```bash
zingo-cli balance
```

---

### View Transactions

```bash
zingo-cli transactions
```

---

### Send ZEC

```bash
zingo-cli quicksend
```

---

# Running the Project

## Clone

```bash
git clone https://github.com/<username>/tipcash.git
```

---

## Install

```bash
pnpm install
```

---

## Configure Environment

Create:

```text
.env.local
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NETWORK=testnet

ZINGO_CLI_PATH=/usr/local/bin/zingo-cli

WALLETS_DIR=./wallets
```

---

## Start Development

```bash
pnpm dev
```

---

# Testnet

Current implementation targets:

- Zcash Testnet
- Lightwalletd
- Testnet Unified Addresses

The project architecture is designed so it can later be switched to Mainnet with minimal configuration changes.

---

# Current Implementation Status

## ✅ Completed

- User authentication
- Automatic wallet creation
- Independent wallet per user
- Unified Address generation
- Transparent Address generation
- Wallet isolation
- Transaction history
- Balance retrieval
- Testnet integration

---

## 🚧 Planned

- Public user profiles
- Tip links
- Creator pages
- QR payment improvements
- Wallet backup & recovery
- Mainnet deployment
- Mobile application
- Self-hosted Zallet/Zebra backend

---

# Why Zingo CLI?

Instead of requiring contributors or judges to synchronize and maintain a full Zcash node, TipCash currently integrates **Zingo CLI**, which connects to the Zcash network through **Lightwalletd**.

This approach provides:

- Fast wallet creation
- Lightweight synchronization
- Native Unified Address support
- Lower storage requirements
- Easier setup for local development and judging

The application's wallet layer is modular and can later be replaced with a self-hosted **Zallet/Zebra** backend without significant architectural changes.

---

# Security

- Every authenticated user has an independent wallet.
- Wallet files remain on the server.
- Private keys are never exposed to the frontend.
- Wallets are isolated to prevent users from accessing one another's funds.

---

# Future Roadmap

- Privacy-first tipping profiles
- Creator verification
- Donation campaigns
- Payment requests
- Contact list
- Wallet import/export
- Multiple account support
- Push notifications
- Self-hosted validator integration
- Cross-platform mobile application

---

# Acknowledgements

Built with:

- Zcash
- Zingo CLI
- Lightwalletd
- Next.js
- Supabase
- TypeScript
- Tailwind CSS
- shadcn/ui

---

# License

This project is licensed under the MIT License.
