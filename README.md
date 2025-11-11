# QR Feedback Router

This is the GitHub page for the Absolutely Brilliant Concepts, Inc - Automated Customer Feedback Routing & Social Review Platform (QR Code and or URL-Driven) capstone project. We will use this GitHub to code a SaaS web-based application for small businesses that customers can use to send feedback to said businesses or publicly upload their reviews to Yelp, Google Reviews, etc.

## Project Structure

```
qr-feedback-router/
├── frontend/          # React + Vite frontend application
├── backend/           # Python Flask backend
└── README.md
```

## Prerequisites

Before running this application, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- Python 3.8+ (for backend, if applicable)

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - The `.env` file should already contain the necessary Google OAuth Client ID

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Backend Setup

The backend is currently minimal. If you need to run it:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if a requirements.txt is added):
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

## Application Features

### Current Implementation

The application includes the following pages and flows:

- **Home Page** (`/`) - Navigation hub for all application features
- **Login Page** (`/login`) - Business owner authentication
- **Feedback Page** (`/feedback`) - Customer-facing review submission form
- **Reward Page** (`/reward`) - Google OAuth integration for reward redemption
- **Dashboard** (`/dashboard`) - Customer service dashboard for reviewing feedback
- **Business Portal** (`/portal`) - Business management interface

### User Flow

1. Customer scans QR code or accesses feedback URL
2. Customer submits rating (1-5 stars) and optional comments
3. Customer is redirected to reward page
4. Customer signs in with Google to claim promotional reward
5. Customer receives promo code for next visit

## Technology Stack

### Frontend
- React 19.1.1
- TypeScript
- Vite 7.x
- React Router DOM 7.x
- Tailwind CSS 4.x
- Google OAuth (@react-oauth/google)

### Backend
- Python Flask
- (Additional dependencies to be added)

## Development Scripts

Frontend commands (run from `frontend/` directory):

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Important Notes

### Google OAuth Configuration

The application uses Google OAuth for user authentication on the reward redemption flow. The OAuth client ID is configured in the `.env` file. For this project, the credentials are shared among team members via the `.env.example` file.

If you encounter OAuth-related errors, verify that:
1. The `.env` file exists in the `frontend/` directory
2. The `VITE_GOOGLE_CLIENT_ID` variable is set correctly
3. Your local development server is running on `http://localhost:5173`

### Git Workflow

This project follows a branch-based development workflow. Please create feature branches for new work and submit pull requests for review before merging to main.

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual URL.

### Dependencies Not Installing
Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

### OAuth Not Working
Ensure your `.env` file is properly configured with the Google Client ID. The file should not be committed to version control but should be created from `.env.example`.


