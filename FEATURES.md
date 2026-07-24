# TipCash - Complete Feature Guide

## Overview

TipCash is a comprehensive Zcash tipping platform with all core features implemented for the 4-day hackathon sprint. This guide details all available features and how to use them.

## Authentication & Accounts

### Signup
- **Route**: `/auth/signup`
- **Requirements**:
  - Email (must be unique)
  - Username (3-30 chars, alphanumeric + underscores/hyphens)
  - Password (8+ chars, uppercase, lowercase, number)
  - Display Name
- **Features**:
  - Automatic Zcash address generation
  - JWT token generation
  - Refresh token stored in HTTP-only cookie

### Login
- **Route**: `/auth/login`
- **Features**:
  - Email/password authentication
  - Session persistence via tokens
  - Automatic redirect to dashboard

### Profile Management
- **Route**: `/settings`
- **Editable Fields**:
  - Display Name
  - Bio (up to 500 chars)
  - Avatar URL
- **Read-only**:
  - Email
  - Username
  - Zcash Address

## Core Tipping Features

### Send Tips
- **Route**: `/send`
- **Send To**:
  - Email address (system finds user)
  - Username (exact match)
  - Zcash address (direct transfer)
- **Options**:
  - Amount in ZEC
  - Optional memo/note
  - Anonymous sending
- **Transaction Flow**:
  1. Validate recipient
  2. Create transaction record
  3. Send via Zcash RPC
  4. Track status (pending/confirmed/failed)

### Receive Tips
- **Route**: `/receive`
- **Options**:
  - Display your Zcash address (direct tips)
  - Generate shareable receive link
  - One-click copy to clipboard
- **How it works**:
  - Users can send directly to your address
  - Or use your shareable link
  - Notifications when tips arrive

### Receive Links
- **Route**: `/receive-links`
- **Link Types**:
  - **Regular**: Recipient knows your identity
  - **Anonymous**: Sender remains unknown
- **Create Links**:
  - One-click generation
  - Shareable via social media
  - Track usage (remaining uses)
- **Share Methods**:
  - Copy link to clipboard
  - Generate QR code (UI ready for integration)
  - Share on social platforms

### Anonymous Tipping
- **Route**: `/tip/[token]`
- **How It Works**:
  - User accesses shareable link
  - Enters tip amount and optional message
  - Sends without authentication
  - Recipient doesn't know sender identity
- **Features**:
  - Simple, minimal UI
  - No account required
  - Fast transaction processing

## Transaction Management

### Transaction History
- **Route**: `/transactions`
- **Features**:
  - View all sent and received tips
  - Filter by:
    - All transactions
    - Sent tips
    - Received tips
  - Display info:
    - Direction (sent/received)
    - Amount
    - Status (pending/confirmed/failed)
    - Timestamp
    - Transaction ID

### Dashboard
- **Route**: `/dashboard`
- **Displays**:
  - Total ZEC balance
  - Recent transactions (last 5)
  - Quick action buttons
  - Overall account summary
- **Quick Actions**:
  - Send Tip
  - Receive
  - View History
  - Search Users
  - View Favorites
  - Manage Receive Links

## User Discovery

### Search Users
- **Route**: `/search`
- **Features**:
  - Real-time user search
  - Search by username or display name
  - View profile cards with:
    - Display name
    - Username
    - Bio
    - One-click tip button
  - Add to favorites directly from search

### Public Profiles
- **Route**: `/profile/[username]`
- **Display Information**:
  - Display name
  - Username
  - Bio
  - Account creation date
- **Actions**:
  - Send tip to this user
  - Add/remove from favorites
  - View their public profile

### Favorites
- **Route**: `/favorites`
- **Features**:
  - Bookmark users for quick access
  - One-click tipping to favorites
  - Remove from favorites
  - Quick tip from favorites list
- **Use Cases**:
  - Save frequently tipped users
  - Build your tip circle
  - Quick access from dashboard

## Balance & Transactions

### Balance Display
- Real-time ZEC balance from Zcash node
- Displayed prominently on dashboard
- Updates on page refresh
- Mock fallback for demo purposes

### Transaction Tracking
- All tips recorded in database
- Status tracking:
  - **Pending**: Transaction submitted
  - **Confirmed**: Confirmed on blockchain
  - **Failed**: Transaction error
- Transaction details:
  - Sender/recipient info
  - Amount in ZEC
  - Transaction ID (txid)
  - Memo/notes
  - Timestamp
  - Confirmation status

## Security Features

### Authentication
- **JWT Tokens**:
  - Access tokens: 15-minute expiration
  - Refresh tokens: 7-day expiration
  - Automatic token refresh
  - HTTP-only cookie storage

### Password Security
- **Hashing**: bcrypt with 10+ salt rounds
- **Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Never Transmitted**: Hashed server-side only

### Data Protection
- **Validation**: All inputs validated with Zod schemas
- **HTTPS Ready**: Deploy on Vercel for automatic HTTPS
- **CORS Ready**: API routes properly configured
- **Rate Limiting**: Ready for middleware implementation

### Anonymous Tipping Security
- **No Authentication**: Anonymous tips work without login
- **Link-based**: Secure tokens for receive links
- **Sender Privacy**: Optional anonymous flag
- **Recipient Privacy**: Optional shielded pool support

## API Endpoints (All Protected with JWT)

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/refresh` - Refresh token

### Zcash Operations
- `GET /api/zcash/balance` - Get ZEC balance
- `POST /api/zcash/send` - Send ZEC transaction

### Tipping
- `POST /api/tips/send` - Send tip
- `GET /api/tips/history` - Get transaction history

### Profiles & Search
- `GET /api/profiles/search` - Search users
- `GET /api/profiles/[username]` - Get profile

### Favorites
- `GET /api/favorites` - List favorites
- `POST /api/favorites/[userId]` - Add favorite
- `DELETE /api/favorites/[userId]` - Remove favorite

### Receive Links
- `GET /api/receive-links` - List links
- `POST /api/receive-links` - Create link

## User Experience Features

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly buttons and inputs
- Optimized mobile navigation

### Dark Mode
- Full dark theme support
- System preference detection
- Consistent across all pages
- Easy on the eyes

### Loading States
- Skeleton loaders for content
- Disabled buttons during loading
- Spinner animations
- Clear feedback to users

### Error Handling
- User-friendly error messages
- Form validation feedback
- API error responses
- Recovery suggestions

### Notifications
- Success messages for actions
- Error alerts for failures
- Status confirmations
- Transaction notifications (ready for backend)

## Navigation

### Main Pages
- `/` - Landing page
- `/dashboard` - Main dashboard
- `/send` - Send tips
- `/receive` - Receive tips
- `/receive-links` - Manage receive links
- `/transactions` - Transaction history
- `/search` - Search users
- `/profile/[username]` - View profile
- `/favorites` - Manage favorites
- `/settings` - Edit profile
- `/tip/[token]` - Anonymous tipping page

### Auth Pages
- `/auth/login` - Login
- `/auth/signup` - Sign up

## Deployment Considerations

### Environment Variables Needed
```
JWT_SECRET=secure-random-string
JWT_REFRESH_SECRET=secure-random-string
ZCASH_RPC_URL=http://localhost:18232
ZCASH_RPC_USER=user
ZCASH_RPC_PASSWORD=password
DATABASE_URL=your-database-url
NEXT_PUBLIC_APP_URL=https://yourdomain.com (for production)
```

### Deployment Platforms
- **Vercel** (Recommended): `vercel deploy`
- **Self-hosted**: `pnpm build && pnpm start`
- **Docker**: Create Dockerfile for containerization
- **Cloud Functions**: Compatible with serverless

### Performance Tips
- Database connection pooling for high load
- Redis caching for frequently accessed data
- CDN for static assets
- Rate limiting for API endpoints
- Monitoring and logging

## Future Enhancement Ideas

### Phase 2 Features
- QR code generation for links
- Email notifications
- In-app push notifications
- User avatars and profile pictures
- Follow/follower system
- Tip campaigns or collections
- Analytics dashboard
- Transaction export (CSV/PDF)

### Phase 3 Features
- Mobile app (React Native)
- Batch tipping
- Recurring tips
- Tip requests
- Leaderboards
- Achievements/badges
- Multi-currency support
- Escrow system

### Integration Ideas
- Zapier integration
- Discord bot
- Telegram bot
- Twitter integration
- GitHub integration
- Slack bot

## Troubleshooting

### Common Issues

**Can't send tips**
- Check Zcash RPC is running
- Verify database is connected
- Check balance is sufficient
- Validate recipient address

**Login not working**
- Verify email is correct
- Check password (case-sensitive)
- Clear browser cookies
- Check NEXT_PUBLIC_SUPABASE_URL if using Supabase

**Balance not showing**
- Ensure Zcash node is running
- Check RPC credentials
- Verify Zcash address is correct
- Try page refresh

**Database errors**
- Check DATABASE_URL is correct
- Verify database tables exist
- Check user has proper permissions
- Review database connection pooling

---

For more details, see:
- README.md - Project overview
- DATABASE_SETUP.md - Database configuration
- IMPLEMENTATION_SUMMARY.md - Implementation details
