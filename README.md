# OutreachAI 🤖

**OutreachAI** is a comprehensive AI-powered outreach automation platform that combines intelligent candidate discovery, personalized message generation, and blockchain-based payment processing. The platform features a modern Next.js frontend with an autonomous Python AI agent backend for seamless outreach automation.

![OutreachAI](public/outreachAI.png)

## ✨ Features

### 🎯 **Intelligent Outreach Automation**
- **AI-Powered Candidate Discovery**: Find potential podcast guests, influencers, co-founders, and professional connections
- **Smart Scoring System**: AI-driven candidate ranking and evaluation
- **Personalized Message Generation**: Custom outreach messages tailored to each prospect
- **Multi-Platform Search**: Integration with Google Search, YouTube, and web scraping

### 🔐 **Authentication & User Management**
- **Google OAuth Integration**: Seamless login with Google accounts
- **Wallet-Based Authentication**: Web3 wallet integration for decentralized identity
- **NextAuth.js**: Secure session management and authentication flows

### 💰 **Blockchain Integration**
- **OnchainKit Integration**: Built on Coinbase's OnchainKit for Web3 functionality
- **Multi-Currency Support**: USDC and EURC payment processing
- **Decentralized payment and transaction management**

### 🚀 **Real-Time Operations**
- **Live Streaming Updates**: Real-time progress tracking via Server-Sent Events
- **Session Management**: Persistent state across user interactions
- **Background Processing**: Autonomous agent operations with minimal user intervention

### 📊 **Campaign Management**
- **Campaign Creation**: Define outreach objectives and target criteria
- **Budget Management**: Set and track campaign budgets in multiple currencies
- **Contact Management**: Organized contact database with relationship tracking
- **Analytics Dashboard**: Performance metrics and campaign insights

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Web3**: Coinbase OnchainKit for blockchain interactions

### Backend (Python AI Agent)
- **AI Engine**: Google Gemini integration for intelligent processing
- **Search Capabilities**: Google Search API and YouTube Data API
- **Web Scraping**: FireCrawl for content extraction
- **Real-time Communication**: Flask with Server-Sent Events

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Python** 3.8+ with pip
- **PostgreSQL** database
- **Google Cloud Platform** account (for APIs)
- **Web3 Wallet** (for blockchain features)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd outreachy
```

### 2. Frontend Setup

Install dependencies:
```bash
npm install
```

Set up environment variables (create `.env`) and refere to `.example.env`

Run database migrations:
```bash
npx prisma migrate dev
```

Start the development server:
```bash
npm run dev
```

### 3. AI Agent Setup

Navigate to the AI Agent directory:
```bash
cd "AI Agent"
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Set up credentials (create `.env`):
```
GOOGLE_SEARCH_API_KEY=
FIRECRAWL_API_KEY=
GOOGLE_API_KEY=
YOUTUBE_API_KEY=
YOUTUBE_API_KEY_2=
CSE_ID=
```

Start the AI agent:
```bash
python app.py
```

### 4. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **AI Agent API**: [http://localhost:5050](http://localhost:5050)

---

**OutreachAI** - Automate your outreach, amplify your connections. 🚀
