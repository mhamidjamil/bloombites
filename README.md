# BloomBites 🍫✨

A modern, AI-powered e-commerce platform for custom snack bouquets. Create personalized gift experiences with our intuitive bouquet builder, powered by Google Gemini AI for creative descriptions and naming.

![Next.js](https://img.shields.io/badge/Next.js-15.3.6-black)
![React](https://img.shields.io/badge/React-19.2.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)
![Google GenAI](https://img.shields.io/badge/Google_GenAI-1.20.0-green)

## 🌟 Features

### 🛍️ Customer Experience
- **Custom Bouquet Builder**: Interactive tool to create personalized snack bouquets
- **AI-Powered Descriptions**: Google Gemini AI generates creative names and descriptions
- **Product Catalog**: Browse pre-made bouquets with high-quality images
- **Shopping Cart**: Seamless cart management with real-time price calculation
- **Secure Checkout**: Complete checkout flow with customer details and address
- **User Authentication**: Email/password authentication with role-based access

### 👨‍💼 Admin Dashboard
- **Bouquet Management**: Create, edit, and manage bouquet offerings
- **Item Management**: Manage snack items with variants and pricing
- **Order Management**: View and update customer order statuses
- **Category Management**: Organize products and items by categories
- **Analytics**: Monitor sales and customer data

### 🎨 Design & UX
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Elegant Theme**: Gold and chocolate brown color scheme for premium feel
- **Smooth Animations**: Framer Motion for enhanced user interactions
- **Mobile-First**: Fully responsive across all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Backend & Infrastructure
- **Firebase** - Authentication, Firestore database, and hosting
- **Google Cloud Storage** - Image storage and delivery
- **Google GenAI** - AI-powered content generation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Genkit** - AI development toolkit

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Google Cloud project with GenAI API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mhamidjamil/bloombites.git
   cd bloombites
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Firebase and Google Cloud credentials:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Cloud GenAI
   GOOGLE_GENAI_API_KEY=your_genai_api_key

   # AWS S3 (for image uploads)
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   AWS_S3_BUCKET=your_bucket_name
   ```

4. **Firebase Setup**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication with Email/Password provider
   - Enable Firestore Database
   - Enable Storage

5. **Google Cloud Setup**
   - Enable Google AI (Gemini) API in Google Cloud Console
   - Generate an API key

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:9004](http://localhost:9004) to view the application.

## 📁 Project Structure

```
bloombites/
├── src/
│   ├── ai/                    # AI flows and Genkit configuration
│   │   ├── flows/            # AI-powered features
│   │   └── genkit.ts         # Genkit setup
│   ├── app/                  # Next.js app router pages
│   │   ├── (admin)/          # Admin routes
│   │   ├── (shop)/           # Customer-facing routes
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable React components
│   │   ├── ui/               # UI component library
│   │   └── custom-bouquet-builder.tsx
│   ├── firebase/             # Firebase configuration and utilities
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions and types
├── docs/                     # Documentation
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind configuration
├── next.config.ts           # Next.js configuration
├── eslint.config.mjs        # ESLint configuration
└── package.json
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server on port 9004
npm run genkit:dev       # Start Genkit AI development server
npm run genkit:watch     # Start Genkit with file watching

# Building
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run typecheck        # Run TypeScript type checking
npm run code:check       # Run all code quality checks
npm run code:fix         # Fix and format code
```

## 🎨 Design System

### Colors
- **Primary**: Gold (#FFD700) - Premium, celebratory feel
- **Background**: Light Beige (#F5F5DC) - Warm, neutral backdrop
- **Accent**: Dark Chocolate Brown (#3E2723) - Luxurious, sophisticated

### Typography
- **Headlines**: Playfair Display (serif) - Elegant, high-end feel
- **Body**: PT Sans (sans-serif) - Clean, readable

### Components
Built with Radix UI primitives and styled with Tailwind CSS for accessibility and consistency.

## 🤖 AI Features

### Bouquet Description Generation
- Uses Google Gemini AI to create creative names and descriptions
- Analyzes selected items and theme to generate marketing copy
- Integrated into the custom bouquet builder workflow

## 🔐 Authentication & Security

- **Role-based Access**: Customer and Admin roles
- **Firebase Auth**: Secure authentication with email/password
- **Protected Routes**: Admin dashboard requires admin privileges
- **Data Validation**: Zod schemas for type-safe data validation

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Enhancement**: Full feature set on larger screens
- **Touch-Friendly**: Optimized interactions for touch devices

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Environment Variables
Ensure all environment variables are set in your deployment environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for code quality
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is private and proprietary. All rights reserved.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Firebase** - Backend-as-a-Service platform
- **Google GenAI** - AI-powered content generation
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

---

Built with ❤️ for creating memorable gifting experiences
