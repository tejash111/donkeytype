# DonkeyType - Deployment Guide

## Environment Variables

### Frontend (Client)

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

For production, update this to your deployed server URL:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-server-domain.com
```

### Backend (Server)

Create a `.env` file in the `server` directory:

```env
PORT=4000
CORS_ORIGIN=*
NODE_ENV=development
```

For production:

```env
PORT=4000
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

## Installation

### Server

```bash
cd server
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

## Production Deployment

### Server Deployment (e.g., Railway, Render, Heroku)

1. Set environment variables in your hosting platform
2. Deploy the `server` folder
3. Note the deployed server URL

### Client Deployment (e.g., Vercel, Netlify)

1. Set `NEXT_PUBLIC_SOCKET_URL` to your deployed server URL
2. Deploy the `client` folder

## Environment Variable Notes

- All frontend environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- Never commit `.env` files to git (they are gitignored)
- Use `.env.example` files as templates for required variables
