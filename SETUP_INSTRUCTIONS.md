# PetWorld Chat Setup Instructions

This guide will walk you through setting up and running the PetWorld application with AI-powered chat functionality.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v22 or higher)
2. **npm** (comes with Node.js)
3. **Rust** and **Cargo** (for Stellar contracts)
4. **Stellar CLI** tools
5. **OpenAI API Key** (for chat functionality)

## Step-by-Step Setup

### Step 1: Install Dependencies

Navigate to the `pet-world` directory and install all npm dependencies:

```bash
cd pet-world
npm install
```

### Step 2: Set Up Environment Variables

The project uses **dotenv** to load environment variables. Create a `.env` file in the `pet-world` root directory with the following variables:

```env
# OpenAI API Key (REQUIRED for chat functionality)
PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# PetWorld Contract Address (from testnet deployment)
PUBLIC_PETWORLD_CONTRACT=CBDGYGMN4MJOTMGBGPY6VF2JCIDBYUFKPWB4ZDP2AGRV7BFOFWYPATKT

# Stellar Network Configuration
PUBLIC_STELLAR_NETWORK=TESTNET
PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
```

**Important Notes:**
- Replace `your_openai_api_key_here` with your actual OpenAI API key
- You can get an OpenAI API key from: https://platform.openai.com/api-keys
- The contract address is already set for testnet, but you can change it if needed
- **All environment variables must be prefixed with `PUBLIC_`** to be accessible in the browser
- The `.env` file is automatically loaded by dotenv (configured in `vite.config.ts`)
- **After creating/updating `.env`, restart the development server** for changes to take effect

### Step 3: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in to your account
3. Navigate to API Keys section: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key and paste it into your `.env` file

### Step 4: Verify Contract Configuration

The application is configured to use the PetWorld contract on Stellar Testnet. The contract address is:
- **Contract ID**: `CBDGYGMN4MJOTMGBGPY6VF2JCIDBYUFKPWB4ZDP2AGRV7BFOFWYPATKT`

If you need to use a different contract address, update the `PUBLIC_PETWORLD_CONTRACT` in your `.env` file.

### Step 5: Start the Development Server

Run the development server:

```bash
npm run dev
```

This will:
- Start the Vite development server
- Watch for contract changes (if using `stellar scaffold watch`)
- Open the app in your browser (usually at `http://localhost:5173`)

### Step 6: Connect Your Wallet

1. Open the application in your browser
2. Click "Connect Account" in the top right
3. Select your Stellar wallet (e.g., Freighter)
4. Approve the connection

### Step 7: View and Chat with Your Pets

1. Once connected, you'll see a list of your pets (if you have any)
2. Click on a pet to view its details
3. The chat window will automatically appear on the right side
4. The pet will greet you when you open its profile
5. Type a message and press Enter to chat with your pet!

## Features

### Chat Functionality
- **AI-Powered Responses**: Uses OpenAI GPT-4o model for intelligent, context-aware responses
- **Context-Aware**: Pet responses reflect their current stats (happiness, hunger, health)
- **Stage-Based Personality**: Each evolution stage has a unique personality:
  - 🥚 **Egg**: Mystical and mysterious
  - 🐣 **Baby**: Innocent and excitable
  - 🦖 **Teen**: Curious and sometimes moody
  - 🐲 **Adult**: Wise and loyal
- **Auto-Greeting**: Pet automatically greets you when you open their profile
- **Real-time Updates**: Chat reflects pet's current emotional and physical state

### Pet Actions
- **Feed**: Reduces hunger and increases happiness
- **Play**: Increases happiness significantly
- **Update State**: Updates pet stats based on time passed

## Troubleshooting

### Chat Not Working

1. **Check OpenAI API Key**:
   - Verify `PUBLIC_OPENAI_API_KEY` is set in `.env`
   - Ensure the key is valid and has credits
   - Check browser console for API errors

2. **Check Network Tab**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for failed requests to `api.openai.com`
   - Check error messages

### Contract Calls Failing

1. **Verify Contract Address**:
   - Ensure `PUBLIC_PETWORLD_CONTRACT` matches your deployed contract
   - Check that you're on the correct network (Testnet)

2. **Check Wallet Connection**:
   - Ensure wallet is connected
   - Verify you're on the correct network
   - Check that you have XLM for transaction fees

3. **Check RPC URL**:
   - Verify `PUBLIC_STELLAR_RPC_URL` is correct
   - Testnet: `https://soroban-testnet.stellar.org`

### Pet Not Loading

1. **Check Token ID**:
   - Ensure the pet exists on the contract
   - Verify you own the pet

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

## Project Structure

```
pet-world/
├── src/
│   ├── components/
│   │   ├── PetChat.tsx          # Chat component
│   │   ├── PetDetail.tsx        # Pet detail view with chat
│   │   └── PetList.tsx          # List of user's pets
│   ├── services/
│   │   ├── openaiService.ts    # OpenAI API integration
│   │   └── petworldContract.ts  # Stellar contract interactions
│   ├── pages/
│   │   └── Home.tsx             # Main page with pet list/detail
│   └── index.css                # Styles including chat styles
├── .env                         # Environment variables (create this)
└── package.json
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PUBLIC_OPENAI_API_KEY` | OpenAI API key for chat | Yes | - |
| `PUBLIC_PETWORLD_CONTRACT` | PetWorld contract address | Yes | Testnet contract |
| `PUBLIC_STELLAR_NETWORK` | Stellar network | No | TESTNET |
| `PUBLIC_STELLAR_RPC_URL` | Stellar RPC endpoint | No | Testnet RPC |
| `PUBLIC_STELLAR_HORIZON_URL` | Stellar Horizon endpoint | No | Testnet Horizon |

## API Costs

**OpenAI GPT-4o Pricing** (as of setup):
- Input: ~$2.50 per 1M tokens
- Output: ~$10.00 per 1M tokens
- Average chat message: ~100 tokens
- Estimated cost per chat: ~$0.001

**Note**: Chat responses are limited to 100 tokens to keep costs low.

## Next Steps

1. **Customize Personalities**: Edit `PERSONALITY_PROMPTS` in `src/services/openaiService.ts`
2. **Add More Interactions**: Extend the `PetContext` interface for new interaction types
3. **Improve Error Handling**: Add better fallback responses
4. **Add Message History**: Persist chat history in localStorage or backend
5. **Add Backend**: Move OpenAI API calls to backend for better security

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure your OpenAI API key is valid and has credits
4. Verify contract address and network configuration

## Security Notes

⚠️ **Important**: The OpenAI API key is currently exposed in the frontend. For production:
- Move API calls to a backend server
- Use environment variables on the server
- Implement rate limiting
- Add authentication/authorization

