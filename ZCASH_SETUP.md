# Zcash Wallet Setup Guide

This guide explains how to set up Zcash/Zallet for TipCash. **You need a running Zcash wallet with RPC enabled** for the application to work properly.

## Why Do You Need a Local Node?

TipCash requires a Zcash wallet to:
- Generate new Zcash addresses for user accounts
- Check balances
- Send and receive ZEC transactions
- Manage transaction history

Without a running wallet, the application will fall back to mock data, but you won't be able to create real accounts or process real transactions.

## Option 1: Using zingo-cli with RPC Wrapper (Recommended for Development)

This is the easiest setup for development. It uses zingo-cli (a light wallet) with a custom RPC wrapper that provides zcashd-compatible JSON-RPC interface.

### Prerequisites

```bash
# Install zingo-cli (if not already installed)
snap install --edge zingo-cli

# Or download from https://github.com/ZcashFoundation/zingo-cli/releases
```

### Setup RPC Wrapper

The RPC wrapper is already included in your TipCash project as `zcash-rpc-wrapper.js`.

```bash
# Start the RPC wrapper
node /home/doctor-ibrahim/Desktop/TipCash/zcash-rpc-wrapper.js
```

The wrapper will start on `http://127.0.0.1:18232` with:
- **Username:** `user`
- **Password:** `password`

### Initialize zingo-cli Wallet

```bash
# Create a new wallet
zingo-cli -c testnet --seed "your 24-word seed phrase here"

# Or restore from existing seed
zingo-cli -c testnet --seed "your existing seed phrase" --birthday <block_height>

# Sync the wallet
zingo-cli -c testnet sync
```

### Verify Setup

```bash
# Test RPC connection
curl --user user:password \
  --data-binary '{"jsonrpc":"2.0","id":"1","method":"getblockchaininfo","params":[]}' \
  -H 'content-type: text/plain;' \
  http://127.0.0.1:18232/
```

### Keep RPC Wrapper Running

The RPC wrapper needs to stay running while using TipCash. You can:

1. Run it in a separate terminal
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start /home/doctor-ibrahim/Desktop/TipCash/zcash-rpc-wrapper.js --name zcash-rpc
pm2 save
pm2 startup
```

## Option 2: Using Zallet (Advanced)

Zallet is the modern replacement for zcashd and is actively maintained, but requires building from source and a backend component.

### Installation

```bash
# Install Rust (required for Zallet)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone and build Zallet
git clone https://github.com/zcash/zallet.git
cd zallet
cargo build --release

# The binary will be at target/release/zallet
```

### Initial Setup

```bash
# Create a data directory
mkdir -p ~/.zallet

# Generate example config
./target/release/zallet example-config > ~/.zallet/zallet.toml

# Edit the config to enable RPC
nano ~/.zallet/zallet.toml
```

### Configure RPC in zallet.toml

```toml
[rpc]
bind = "127.0.0.1:18232"

[[rpc.auth]]
username = "your_rpc_user"
password = "your_rpc_password"
```

### Initialize Wallet

```bash
# Generate a new mnemonic
./target/release/zallet generate-mnemonic

# Save the mnemonic somewhere safe!

# Initialize wallet with the mnemonic
./target/release/zallet init-wallet-encryption

# Start the wallet
./target/release/zallet start
```

### Verify RPC is Working

```bash
# Test RPC connection
curl --user your_rpc_user:your_rpc_password \
  --data-binary '{"jsonrpc":"2.0","id":"1","method":"getblockchaininfo","params":[]}' \
  -H 'content-type: text/plain;' \
  http://127.0.0.1:18232/
```

## Option 2: Using zcashd (Legacy)

zcashd is the original Zcash full node, but it's being deprecated.

### Installation

**macOS:**
```bash
brew install zcash
```

**Linux:**
```bash
# Download from https://z.cash/download/
wget https://z.cash/downloads/zcash-linux-v5.5.0.tar.gz
tar -xvf zcash-linux-v5.5.0.tar.gz
```

**Windows:**
Download from https://z.cash/download/

### Configuration

Create `~/.zcash/zcash.conf`:

```conf
# Testnet configuration (recommended for development)
testnet=1
server=1
rpcuser=your_rpc_user
rpcpassword=your_rpc_password
rpcport=18232
rpcallowip=127.0.0.1

# Mainnet configuration (for production)
# testnet=0
# rpcport=8232
```

### Start zcashd

```bash
# Testnet
zcashd -testnet

# Mainnet
zcashd
```

### Verify RPC is Working

```bash
# Test RPC connection
curl --user your_rpc_user:your_rpc_password \
  --data-binary '{"jsonrpc":"2.0","id":"1","method":"getblockchaininfo","params":[]}' \
  -H 'content-type: text/plain;' \
  http://127.0.0.1:18232/
```

## Option 3: Using a Cloud Service

If you don't want to run a local node, you can use cloud services:

### Tatum.io

Tatum provides Zcash wallet APIs (not RPC gateway):

```bash
# Sign up at https://tatum.io
# Get API key
# Use their REST API instead of RPC
```

**Note:** This would require rewriting the `lib/zcash.ts` file to use Tatum's REST API instead of RPC.

### Block.io

```bash
# Sign up at https://block.io
# Get API key
# Use their API
```

## Configure TipCash

Once your Zcash wallet is running, update your `.env.local`:

```bash
# Zcash RPC Configuration
ZCASH_RPC_URL=http://localhost:18232
ZCASH_RPC_USER=your_rpc_user
ZCASH_RPC_PASSWORD=your_rpc_password

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

## Troubleshooting

### Error: "Address cannot be created"

This error occurs when:
1. Zcash wallet is not running
2. RPC is not enabled
3. Wrong RPC credentials
4. Wrong RPC port

**Solutions:**

1. **Check if wallet is running:**
```bash
# For Zallet
ps aux | grep zallet

# For zcashd
ps aux | grep zcashd
```

2. **Check RPC port:**
```bash
netstat -an | grep 18232
```

3. **Test RPC connection:**
```bash
curl --user your_rpc_user:your_rpc_password \
  --data-binary '{"jsonrpc":"2.0","id":"1","method":"getblockchaininfo","params":[]}' \
  -H 'content-type: text/plain;' \
  http://127.0.0.1:18232/
```

4. **Check wallet logs:**
```bash
# For Zallet
tail -f ~/.zallet/debug.log

# For zcashd
tail -f ~/.zcash/debug.log
```

### Error: "Database not configured"

Make sure you've:
1. Set up Supabase (or your chosen database)
2. Created the required tables
3. Set environment variables in `.env.local`
4. Implemented the database client in `lib/db.ts` (already done for Supabase)

### Error: "RPC call failed with status 401"

Wrong RPC credentials. Check:
- `ZCASH_RPC_USER` in `.env.local` matches your config
- `ZCASH_RPC_PASSWORD` in `.env.local` matches your config

## Quick Start Checklist

- [ ] Install Zallet or zcashd
- [ ] Configure RPC in wallet config
- [ ] Start the wallet
- [ ] Test RPC connection with curl
- [ ] Set environment variables in `.env.local`
- [ ] Set up database (Supabase)
- [ ] Run database migrations
- [ ] Start TipCash: `pnpm dev`
- [ ] Test signup at http://localhost:3000/auth/signup

## Development vs Production

### Development (Testnet)
- Use testnet for development
- Get free testnet ZEC from faucets
- No real money at risk
- Faster block times

### Production (Mainnet)
- Use mainnet for production
- Requires real ZEC
- Slower block times
- Higher security requirements

## Testnet Faucets

Get free testnet ZEC from:
- https://faucet.zcash.foundation/
- https://testnet.z.cash/

## Security Best Practices

1. **Never commit `.env.local`** to git
2. **Use strong RPC passwords**
3. **Restrict RPC to localhost** in production
4. **Keep wallet mnemonics secure**
5. **Use testnet for development**
6. **Backup your wallet regularly**

## Additional Resources

- [Zallet Documentation](https://zcash.github.io/wallet/)
- [Zcash Developer Guide](https://zcash.github.io/)
- [ZecHub Wiki](https://zechub.wiki/)
- [Zcash RPC Documentation](https://zcash.github.io/rpc/)
