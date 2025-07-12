# E-Commerce Platform

A full-stack e-commerce platform built with Next.js 15, TypeScript, MongoDB, and modern UI components. This platform supports multiple user roles (customers, vendors, and admins) with comprehensive features for online commerce.

## 🚀 Features

### 🏪 Multi-Role Platform
- **Customers**: Browse products, manage cart, place orders, profile management
- **Vendors**: Product management, order tracking, business analytics, profile verification
- **Admins**: Complete platform management, user management, analytics

### 🛍️ Core E-Commerce Features
- **Product Catalog**: Advanced search, filtering, and categorization
- **Shopping Cart**: Persistent cart with session management
- **Order Management**: Complete order lifecycle from placement to fulfillment
- **Payment Integration**: Razorpay payment gateway integration
- **Inventory Management**: Real-time stock tracking

### 🔐 Authentication & Security
- **NextAuth.js**: Secure authentication with multiple providers
- **Role-Based Access**: Protected routes and API endpoints
- **Email/Mobile Verification**: OTP-based verification system
- **Input Sanitization**: Protection against XSS and injection attacks

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **shadcn/ui Components**: Modern, accessible UI components
- **Custom Date Picker**: Enhanced date selection interface
- **Toast Notifications**: Real-time feedback system

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── customer/      # Customer profile & settings
│   │   └── vendor/        # Vendor dashboard & tools
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── products/          # Product pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── admin/            # Admin-specific components
│   ├── customer/         # Customer-specific components
│   └── vendor/           # Vendor-specific components
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # NextAuth configuration
│   ├── database.ts      # MongoDB connection
│   └── utils.ts         # Utility functions
├── models/              # MongoDB schemas
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form handling and validation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database with Mongoose ODM
- **NextAuth.js**: Authentication library
- **Zod**: Schema validation
- **bcrypt**: Password hashing

### Third-Party Services
- **Razorpay**: Payment processing
- **Twilio**: SMS notifications
- **Nodemailer**: Email services

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce-website
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/ecommerce

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # Razorpay
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret

   # Email (Optional)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # SMS (Optional)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE=your-twilio-phone
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🚀 Getting Started

### Default Categories
The platform automatically creates 10 default product categories:
- Electronics
- Clothing
- Home & Garden
- Sports & Outdoors
- Health & Beauty
- Books & Media
- Toys & Games
- Food & Beverages
- Automotive
- Other

### User Roles

#### Customer Features
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- Profile management with verification
- Address book management

#### Vendor Features
- Business dashboard with analytics
- Product management (CRUD operations)
- Inventory tracking
- Order fulfillment
- Business profile verification
- Bank details for payments

#### Admin Features
- User management
- Product oversight
- Category management
- Order monitoring
- Platform analytics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/verify` - Email/mobile verification

### Products
- `GET /api/products` - Get products with filtering
- `POST /api/products` - Create product (vendor only)
- `PUT /api/products/[id]` - Update product (vendor only)
- `DELETE /api/products/[id]` - Delete product (vendor only)

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

## 🎨 UI Components

### Custom Components
- **DatePicker**: Enhanced date selection with month/year navigation
- **EmailVerification**: OTP-based email verification
- **MobileVerification**: SMS-based mobile verification
- **ProductCard**: Responsive product display component

### Styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: (Coming soon)
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Docker
```bash
# Build and run with Docker
docker build -t ecommerce-app .
docker run -p 3000:3000 ecommerce-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch
- [ ] Real-time chat support
- [ ] Subscription management
- [ ] Advanced reporting tools
