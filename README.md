# AIGNE Image Smith

A base AI image service for creating AI image applications, built as a Blocklet on the ArcBlock platform. Powered by the AIGNE framework and integrated with AIGNE Hub services for advanced AI capabilities.

## Overview

ImageSmith is a comprehensive AI-powered image processing service that provides a foundation for building various AI image applications. Built on the AIGNE framework, it combines a React frontend with a Node.js backend, leveraging AIGNE Hub services and AI runtime capabilities for advanced image generation, restoration, and manipulation.

## Features

- **AIGNE Framework Integration**: Built on the powerful AIGNE framework for AI image processing
- **AIGNE Hub Services**: Connected to AIGNE Hub for access to advanced AI models and capabilities
- **AI Image Processing**: Advanced image generation and restoration capabilities
- **Credit-based Billing**: Integrated payment system using Blocklet Payment Kit
- **User Authentication**: Secure login with ArcBlock DID Connect
- **File Upload**: Robust image upload functionality
- **Admin Dashboard**: Management interface for projects and settings
- **Responsive UI**: Modern Material-UI based interface
- **TypeScript Support**: Full TypeScript implementation for better code quality

## Architecture

```
Frontend (React + Material-UI)
        ↓
Backend API (Express.js)
        ↓
AIGNE Framework & Hub Services
        ↓
AI Runtime (@blocklet/ai-runtime)
        ↓
Database (SQLite/MariaDB)
```

## Quick Start

### Prerequisites

- Node.js (latest LTS version)
- Blocklet CLI (`npm install -g @blocklet/cli`)
- ArcBlock Developer account

### Development

```bash
# Install dependencies
npm install

# Start development server
blocklet dev
# or
npm run start

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

### Building & Deployment

```bash
# Lint and check code quality
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run bundle

# Deploy to local Blocklet server
npm run deploy

# Upload to Blocklet Store
npm run upload
```

## Project Structure

```
├── src/                    # React frontend application
├── api/                    # Express.js backend server
│   ├── src/               # API source code
│   ├── hooks/             # Deployment hooks
│   └── dist/              # Compiled API code
├── public/                # Static assets
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
├── screenshots/           # Application screenshots
├── .blocklet/            # Generated bundle directory
├── blocklet.yml          # Blocklet configuration
└── package.json          # Project dependencies
```

## Technology Stack

### Frontend
- **React 19**: Latest React with modern features
- **Material-UI**: Comprehensive UI component library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **Sequelize**: ORM for database operations
- **SQLite/MariaDB**: Database options

### AI & Blockchain
- **AIGNE Framework**: Core AI framework for image processing and generation
- **@aigne/aigne-hub**: AIGNE Hub services integration for advanced AI capabilities
- **@aigne/core**: AIGNE core runtime and utilities
- **@blocklet/ai-runtime**: AI processing capabilities
- **@blocklet/aigne-sdk**: AIGNE AI SDK integration
- **@arcblock/did-connect**: Decentralized identity authentication
- **@blocklet/payment-js**: Credit-based payment system

## Configuration

### Environment Variables

Create `.env.local` file:

```bash
# Database
DATABASE_URL=sqlite://api/db/app.db

# AI Configuration
AI_RUNTIME_ENDPOINT=your-ai-endpoint
AI_API_KEY=your-api-key

# Payment
PAYMENT_ENDPOINT=your-payment-endpoint
```

### Blocklet Configuration

Key settings in `blocklet.yml`:
- **Main Entry**: `api/dist/index.js`
- **Web Interface**: Port-based HTTP service
- **Navigation**: Admin dashboard and project management
- **Requirements**: Blocklet Server >= 1.16.28

## API Documentation

The service provides comprehensive APIs for:
- Image processing and AI operations
- User authentication and management
- Credit and payment handling
- Project and asset management

See `AI_API.md` and `PAYMENT_API.md` for detailed API documentation.

## Development Guidelines

### Code Quality
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Pre-commit hooks ensure code quality
- Maintain test coverage for critical functions

### Database Migrations
- Located in `api/src/store/migrations/`
- Use Sequelize migration system
- Run migrations before deployment

### Git Workflow
- Feature branch workflow
- Pre-commit hooks run linting and formatting
- Semantic versioning for releases

## Version Management

```bash
# Bump version (patch/minor/major)
npm run bump-version

# Update dependencies
npm run update:deps
```

## Admin Features

The application includes an admin dashboard accessible at `/admin` with:
- **Dashboard**: Overview and analytics
- **Projects**: Project management interface
- **Settings**: Configuration management

Access requires owner or admin privileges.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Licensed under the terms specified in the LICENSE file.

## Support

For issues and questions:
- Check the documentation in the `docs/` directory
- Review API documentation files
- Contact the development team

---

Built with ❤️ using [ArcBlock](https://www.arcblock.io/) and [Blocklet](https://www.blocklet.io/) platform.
