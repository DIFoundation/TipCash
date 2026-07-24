# TipCash - Zcash Tipping Platform

A modern web application for sending and receiving Zcash tips with ease. Built for the hackathon with a focus on speed, privacy, and user experience.

## Features

✨ **Core Features**
- User authentication with JWT tokens
- Send tips via email, username, or Zcash address
- Receive tips with shareable links and QR codes
- Transaction history with filtering
- User profiles and search
- Favorites system for quick access

🔒 **Privacy Features**
- Anonymous tipping support
- Shielded pool integration
- No unnecessary data collection
- Server-side session management

⚡ **Performance**
- Built with Next.js 16 and React 19
- Server-side rendering for optimal performance
- Real-time balance updates
- Efficient database queries

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase, Neon, Aurora, or your choice (see DATABASE_SETUP.md)
- **Authentication**: JWT + HTTP-only cookies
- **Blockchain**: Zcash RPC integration
- **Styling**: Tailwind CSS with semantic design tokens

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd TipCash
pnpm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-here
ZCASH_RPC_URL=http://localhost:18232
ZCASH_RPC_USER=user
ZCASH_RPC_PASSWORD=password
```

### 3. Setup Database

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions on setting up your chosen database provider.

Quick summary:
- Choose a database provider (Supabase recommended for quick start)
- Create tables using provided SQL schema
- Set database connection environment variables
- Implement database client in `lib/db.ts`

### 4. Setup Zcash Wallet

**IMPORTANT:** You MUST have a running Zcash wallet with RPC enabled for TipCash to work. Without it, you cannot create accounts or process transactions.

See [ZCASH_SETUP.md](./ZCASH_SETUP.md) for detailed instructions on setting up:
- Zallet (recommended modern wallet)

Quick summary for Zallet:
```bash
# Install Rust and build Zallet
git clone https://github.com/zcash/zallet.git
cd zallet
cargo build --release

# Configure and start
./target/release/zallet example-config > ~/.zallet/zallet.toml
./target/release/zallet generate-mnemonic
./target/release/zallet init-wallet-encryption
./target/release/zallet start
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tipcash/
├── app/                      # Next.js app router pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── zcash/          # Zcash RPC endpoints
│   │   ├── tips/           # Tipping endpoints
│   │   └── profiles/       # Profile endpoints
│   ├── auth/               # Auth pages (login, signup)
│   ├── dashboard/          # Main dashboard
│   ├── send/               # Send tips page
│   ├── receive/            # Receive tips page
│   ├── transactions/       # Transaction history
│   ├── search/             # User search
│   ├── profile/            # Public profiles
│   └── settings/           # Settings page
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── balance-card.tsx   # Balance display
│   ├── dashboard-header.tsx
│   ├── quick-actions.tsx
│   └── ...
├── lib/                    # Utility functions
│   ├── auth.ts            # JWT & password utilities
│   ├── auth-context.tsx   # Auth state management
│   ├── db.ts              # Database interface
│   ├── schemas.ts         # Zod validation schemas
│   └── zcash.ts           # Zcash RPC client
└── public/                # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile
- `PATCH /api/auth/profile` - Update user profile

### Zcash Operations
- `GET /api/zcash/balance` - Get user's ZEC balance
- `POST /api/zcash/send` - Send ZEC transaction

### Tipping
- `POST /api/tips/send` - Send tip to user
- `GET /api/tips/history` - Get transaction history

### Profiles
- `GET /api/profiles/search` - Search for users
- `GET /api/profiles/[username]` - Get public profile

## Key Implementation Details

### Authentication Flow
1. User signs up with email, username, and password
2. Password is hashed with bcrypt
3. JWT access token (15min) and refresh token (7 days) are generated
4. Refresh token stored in HTTP-only cookie
5. Access token sent to client for API calls

### Database Operations
The application expects you to implement the database client interface in `lib/db.ts`. This allows flexibility to use any database provider. See DATABASE_SETUP.md for implementation examples.

### Zcash Integration
- Connects to Zcash node via RPC
- Supports both transparent and shielded addresses
- Validates addresses before transactions
- Falls back to mock data for demo purposes

### Security
- All passwords hashed with bcrypt (10+ salt rounds)
- JWT tokens with expiration
- HTTP-only secure cookies for refresh tokens
- CORS and CSRF protection
- Input validation with Zod schemas
- Rate limiting on auth endpoints (recommended)

## Development

### Add New Pages

```bash
mkdir app/new-page
touch app/new-page/page.tsx
```

### Add New Components

```bash
mkdir components/new-component
touch components/new-component.tsx
```

### Add New API Routes

```bash
mkdir app/api/new-endpoint
touch app/api/new-endpoint/route.ts
```

### Testing

```bash
# Run tests (configure test suite in package.json)
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

Set environment variables in Vercel project settings before deploying.

### Deploy to Your Own Server

```bash
# Build
pnpm build

# Start
pnpm start
```

## Environment Variables

See `.env.example` for all available variables:

- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `ZCASH_RPC_URL` - Zcash node RPC endpoint
- `ZCASH_RPC_USER` - RPC username
- `ZCASH_RPC_PASSWORD` - RPC password
- `DATABASE_URL` - Database connection string (varies by provider)

## Roadmap

### Completed (MVP)
- ✅ Authentication system
- ✅ Dashboard with balance display
- ✅ Send/receive tips
- ✅ Transaction history
- ✅ User profiles and search
- ✅ Favorites system

### Planned Features
- 📱 Mobile app
- 🔔 Email notifications
- 💬 In-app messaging
- 🎁 Tip collections/campaigns
- 📊 Analytics dashboard
- 🌐 Multi-language support
- 🔐 Multi-signature support
- 🤖 AI-powered recommendations

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

Having issues? 

1. Check DATABASE_SETUP.md for database setup help
2. Review API route documentation above
3. Check console logs for error messages
4. Ensure all environment variables are set correctly
5. Verify Zcash RPC is running (for transaction features)

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zcash](https://z.cash)

---

Made for the Hackathon 2025. Happy tipping! 🚀
