#!/usr/bin/env node

/**
 * Simple RPC wrapper for zingo-cli
 * This provides a JSON-RPC interface compatible with zcashd
 * by wrapping zingo-cli commands
 */

const { spawn } = require('child_process');
const http = require('http');

const PORT = 18232;
const RPC_USER = 'user';
const RPC_PASSWORD = 'password';

// Basic HTTP Basic Auth
function checkAuth(req) {
  const auth = req.headers.authorization;
  if (!auth) return false;
  
  const token = auth.split(' ')[1];
  const decoded = Buffer.from(token, 'base64').toString();
  const [user, pass] = decoded.split(':');
  
  return user === RPC_USER && pass === RPC_PASSWORD;
}

// Execute zingo-cli command and parse output
function executeZingoCommand(args) {
  return new Promise((resolve, reject) => {
    const zingo = spawn('zingo-cli', args);
    
    let stdout = '';
    let stderr = '';
    
    zingo.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    zingo.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    zingo.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Command failed with code ${code}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

// RPC method handlers
const handlers = {
  async getbalance(params) {
    // zingo-cli balance
    const output = await executeZingoCommand(['balance']);
    // Parse output and return balance
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('Total')) {
        const match = line.match(/[\d.]+/);
        if (match) return parseFloat(match[0]);
      }
    }
    return 0;
  },
  
  async getnewaddress(params) {
    // zingo-cli new_address
    const output = await executeZingoCommand(['new_address']);
    // Parse output to get address
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('z') || line.startsWith('t')) {
        return line.trim();
      }
    }
    throw new Error('Failed to generate address');
  },
  
  async listaddresses(params) {
    // zingo-cli addresses
    const output = await executeZingoCommand(['addresses']);
    // Parse output to get addresses
    const addresses = [];
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('z') || line.startsWith('t')) {
        addresses.push(line.trim());
      }
    }
    return addresses;
  },
  
  async validateaddress(params) {
    const address = params[0];
    // zingo-cli check_address
    try {
      await executeZingoCommand(['check_address', address]);
      return { isvalid: true, address };
    } catch {
      return { isvalid: false, address };
    }
  },
  
  async getblockchaininfo(params) {
    // zingo-cli info
    const output = await executeZingoCommand(['info']);
    return {
      chain: 'testnet',
      blocks: 0,
      headers: 0,
    };
  }
};

// HTTP server
const server = http.createServer(async (req, res) => {
  // Check authentication
  if (!checkAuth(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  // Only handle POST requests
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      const { method, params = [], id } = request;
      
      console.log(`RPC call: ${method}`, params);
      
      if (handlers[method]) {
        const result = await handlers[method](params);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          result,
          id
        }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${method}` },
          id
        }));
      }
    } catch (error) {
      console.error('RPC error:', error);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -1, message: error.message },
        id: request.id
      }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Zcash RPC wrapper running on http://127.0.0.1:${PORT}`);
  console.log(`RPC user: ${RPC_USER}`);
  console.log(`RPC password: ${RPC_PASSWORD}`);
});
