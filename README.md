# Hitty Deliveries React App

This is a React application for the customer-facing side of Hitty Deliveries, allowing customers to browse products, place orders, and track deliveries.

## Features

- Customer registration and login
- Browse products from the admin inventory
- Place orders with secure checkout
- View order history and delivery status
- Customer profile management
- Points and rewards system integration

## Tech Stack

- React 18
- React Router v6
- Axios for API requests
- TailwindCSS for styling
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

3. Create a `.env` file based on `.env.example` (if provided)

4. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## API Integration

This app connects to the Laravel backend API for Hitty Deliveries. The API endpoints are configured in the `src/services/api.js` file. The app uses auth tokens for secure API communication.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

## Project Structure

- `src/components` - Reusable UI components
- `src/pages` - Application pages/views
- `src/services` - API and other services
- `src/assets` - Static assets
- `public` - Public assets and HTML template

## Learn More

To learn more about the technologies used:

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Router Documentation](https://reactrouter.com/docs/en/v6)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

## License

This project is proprietary and is owned by Hitty Deliveries.
