# 🚀 ChakriGO : AI-Powered Job Interview Preparation and Anti-Cheating Hiring Platform

A comprehensive, next-generation platform that revolutionizes career development through AI-powered interviews, resume optimization, skill assessments, and community-driven learning.


## ✨ Features

### 🤖 AI-Powered Interview System
- **Real-time Voice Interviews**: Conduct practice interviews with AI using advanced voice recognition
- **Anti-Cheating Measures**: Eye-tracking and tab-focus monitoring using face-api.js and TensorFlow
- **Instant Feedback**: Get detailed performance analysis and improvement suggestions
- **Multiple Interview Types**: Technical, behavioral, and role-specific interviews

### 📄 Smart Resume Tools
- **AI Resume Builder**: Create ATS-optimized resumes with intelligent suggestions
- **Resume Analyzer**: Deep analysis of resume content, job fit, and optimization recommendations
- **Keyword Optimization**: Automatic detection and suggestion of missing keywords
- **Multiple Export Formats**: PDF, Word, and other professional formats

### 🧠 Skill Assessment Engine
- **Comprehensive Testing**: Evaluate technical and soft skills across various domains
- **Personalized Learning Paths**: AI-generated improvement recommendations
- **Progress Tracking**: Monitor skill development over time
- **Industry Benchmarking**: Compare skills against industry standards

### 🌐 Community & Networking
- **Developer Community**: Connect with like-minded professionals
- **Knowledge Sharing**: Share experiences, tips, and career advice
- **Mentorship Programs**: Connect with industry mentors
- **Job Opportunities**: Community-driven job sharing and referrals

### 🔧 Developer Tools
- **Algorithm Visualizer**: Interactive visualization of algorithms and data structures
- **Code Snippet Manager**: Store, organize, and share code snippets
- **System Design Tools**: Design and document system architectures
- **Interview Preparation**: Curated coding challenges and system design problems

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Hooks + Context

### Backend & AI
- **Runtime**: Node.js
- **AI Integration**: 
  - Google Generative AI (Gemini)
  - OpenAI GPT Models
  - LangChain for AI orchestration
- **Voice Processing**: Vapi for real-time voice interactions
- **Computer Vision**: TensorFlow.js + face-api.js for proctoring

### Database & Storage
- **Primary Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Cloud Infrastructure**: AWS (EC2, Lambda, S3, RDS, DynamoDB)

### Additional Technologies
- **PDF Processing**: PDF-lib for resume generation
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: Sonner for toast notifications
- **Analytics**: Built-in performance monitoring

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/candid-minds.git
   cd candid-minds
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # AI API Keys
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
   OPENAI_API_KEY=your_openai_key

   # Voice AI
   VAPI_API_KEY=your_vapi_key

   # Other Services
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
candid-minds/
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                # Authentication routes
│   ├── (root)/                # Main application routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── interview-home/    # AI Interview system
│   │   ├── resume-builder/    # Resume builder
│   │   ├── resume-analyzer/   # Resume analysis
│   │   ├── skill-assessment/  # Skill testing
│   │   └── community/         # Community features
│   ├── api/                   # API routes
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/               # Reusable components
│   ├── ui/                  # Shadcn/ui components
│   ├── forms/               # Form components
│   ├── charts/              # Data visualization
│   └── shared/              # Shared components
├── lib/                     # Utility functions
│   ├── actions/             # Server actions
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Helper functions
│   └── validations/         # Schema validations
├── schemas/                 # Data schemas
├── firebase/               # Firebase configuration
├── public/                 # Static assets
└── types/                  # TypeScript definitions
```



### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional Commits for commit messages
- Comprehensive testing for new features

## 📊 Performance & Scalability

- **Client-Side Optimization**: Code splitting and lazy loading
- **Server-Side Rendering**: Next.js SSR for optimal performance
- **Database Optimization**: Efficient Firestore queries and indexing
- **CDN Integration**: Global content delivery for fast load times
- **Progressive Web App**: Offline capabilities and mobile optimization

## 🔒 Security & Privacy

- **Data Encryption**: End-to-end encryption for sensitive data
- **Authentication**: Secure Firebase Auth implementation
- **Privacy First**: GDPR compliant data handling
- **Secure APIs**: Rate limiting and input validation
- **Audit Logs**: Comprehensive activity tracking

## 📱 Mobile Responsive

- **Mobile-First Design**: Optimized for all device sizes
- **Touch Interactions**: Gesture-friendly interface
- **Offline Support**: Core features available offline
- **Native App Feel**: PWA with app-like experience



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT models and AI capabilities
- **Google** for Generative AI and cloud services
- **Firebase** for backend infrastructure
- **Vercel** for deployment and hosting
- **Shadcn** for beautiful UI components
- **The Open Source Community** for amazing tools and libraries


## 🎯 Made with ❤️ by the Candid Minds Team

Empowering careers through AI-driven innovation.

---

⭐ **Star this repository if you find it helpful!** ⭐