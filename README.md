# TeeLab Frontend

Frontend aplikasi e-commerce golf TeeLab, dibangun dengan Next.js 16 App Router.

## Teknologi
- **Framework**: Next.js 16 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Animasi**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+
- npm or yarn

## Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will run on `http://localhost:3000`

## Available Routes

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Register page
- `/products` - Products listing
- `/products/:id` - Product detail

### Protected Routes (require login)
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/orders/:id` - Order detail
- `/profile/addresses` - Address management

### Admin Routes (require admin role)
- `/admin/categories` - Category management
- `/admin/products/create` - Create product
- `/admin/products/:id/edit` - Edit product

## Project Structure
app/                  # Next.js App Router pages
├── components/       # Reusable components
│   └── providers/    # Context providers
├── lib/              # Utilities and configurations
│   └── axios.ts      # Axios instance
└── store/            # Zustand stores
├── useAuthStore.ts
└── useCartStore.ts

## Default Credentials

**Admin:**
- Email: admin@example.com
- Password: admin123

**User:**
- Email: user@example.com
- Password: user123

## Development
```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## API Integration

Backend API should be running at `http://localhost:8000`

API endpoints are configured in `src/lib/axios.ts`

## Features

- ✅ User authentication (login/register)
- ✅ Product browsing and search
- ✅ Shopping cart management
- ✅ Checkout with address selection
- ✅ Order management
- ✅ Payment integration (Xendit)
- ✅ Admin panel for product/category management
- ✅ Image upload for products
- ✅ Responsive design

## License

MIT