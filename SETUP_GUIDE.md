# Hitty Deliveries Setup & Connection Guide

This guide will help you set up and verify the connection between the React frontend and Laravel backend.

## 🚀 Quick Start

### 1. Start Laravel Backend

```bash
# Navigate to Laravel directory
cd C:\xampp\htdocs\hitty-deliveries

# Start XAMPP MySQL service (if not already running)
# Make sure Apache and MySQL are running in XAMPP Control Panel

# Install dependencies (if not already done)
composer install

# Run database migrations (if needed)
php artisan migrate

# Start Laravel development server
php artisan serve
```

Laravel will start on: `http://127.0.0.1:8000`

### 2. Start React Frontend

```bash
# Navigate to React directory
cd C:\ReactApplications\hitty-deliveries-app

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

React will start on: `http://localhost:5174`

## 🔧 Configuration Files Updated

### Laravel Backend (`.env`)
```env
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5174,127.0.0.1,127.0.0.1:5174,127.0.0.1:3000
```

### React Frontend (`.env`)
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_LARAVEL_BASE_URL=http://127.0.0.1:8000
```

### Vite Configuration (`vite.config.js`)
Updated proxy configuration to properly forward API calls:
```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  },
  '/sanctum': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false
  }
}
```

## 🧪 Testing the Connection

### Method 1: Use the Connection Test Component

1. Import the ConnectionTest component in your React app:
```javascript
import ConnectionTest from './components/ConnectionTest';

// Add to your app
<ConnectionTest />
```

2. Click "Test Connection" to verify the Laravel API is accessible

### Method 2: Manual API Testing

Open browser console in React app and run:
```javascript
// Test API connection
fetch('http://127.0.0.1:8000/api/test-connection')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));

// Test CSRF cookie
fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', {
  credentials: 'include'
})
  .then(() => console.log('CSRF cookie set'))
  .catch(error => console.error('CSRF Error:', error));
```

### Method 3: Browser Network Tab

1. Open Developer Tools → Network tab
2. Navigate to your React app
3. Check for API calls to `127.0.0.1:8000/api/*`
4. Verify response status codes (200 = success)

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. "Connection failed" or "Network Error"
- **Check Laravel server**: Ensure `php artisan serve` is running
- **Check port**: Laravel should be on port 8000
- **Check XAMPP**: Ensure MySQL is running in XAMPP

#### 2. CORS Errors
```
Access to fetch at 'http://127.0.0.1:8000/api/...' from origin 'http://localhost:5174' has been blocked by CORS policy
```
- **Solution**: Laravel CORS middleware is configured, but restart both servers
- **Alternative**: Use Vite proxy by setting `VITE_API_URL=/api`

#### 3. Authentication Issues
- **Check Sanctum configuration**: Stateful domains should include `localhost:5174`
- **Clear browser storage**: Remove old tokens from localStorage
- **Check CSRF cookie**: Ensure CSRF endpoint is accessible

#### 4. 404 Errors on API Calls
- **Verify API routes**: Check `routes/api.php` for endpoint definitions
- **Check URL format**: Ensure API calls include `/api/` prefix
- **Check Laravel routing**: Run `php artisan route:list` to see available routes

## 📋 Connection Checklist

- [ ] XAMPP MySQL service is running
- [ ] Laravel development server is running on port 8000
- [ ] React development server is running on port 5174
- [ ] Can access Laravel at `http://127.0.0.1:8000`
- [ ] Can access React at `http://localhost:5174`
- [ ] API test endpoint returns success: `http://127.0.0.1:8000/api/test-connection`
- [ ] CSRF endpoint is accessible: `http://127.0.0.1:8000/sanctum/csrf-cookie`
- [ ] No CORS errors in browser console
- [ ] Authentication flow works (login/logout)

## 🛠️ Development Workflow

1. **Start Laravel**: `php artisan serve`
2. **Start React**: `npm run dev`
3. **Test connection**: Use ConnectionTest component or manual testing
4. **Develop features**: Both apps will hot-reload on changes
5. **Debug issues**: Check browser console and Laravel logs

## 📚 Key Endpoints

### Laravel API Endpoints
- `GET /api/test-connection` - Test API connectivity
- `GET /sanctum/csrf-cookie` - Get CSRF protection cookie
- `POST /api/customers/login` - Customer authentication
- `GET /api/products` - Get products list
- `POST /api/checkout` - Process orders

### React App URLs
- `http://localhost:5174` - Main application
- `http://localhost:5174/login` - Customer login
- `http://localhost:5174/products` - Product catalog
- `http://localhost:5174/orders` - Order history

## 🔧 Environment Switching

### Use Vite Proxy (Alternative Setup)
1. Update React `.env`:
```env
VITE_API_URL=/api
```

2. API calls will automatically proxy through Vite to Laravel

### Use Direct API Calls (Current Setup)
1. Keep React `.env`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

2. Direct communication between React and Laravel

Both approaches work - choose based on your preference!
