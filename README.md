# Admin Dashboard

A comprehensive admin dashboard for the Universal Project Template with user management, analytics, and role-based access control.

## Features

- **User Management**: Create, edit, delete, and manage user accounts
- **Role Management**: Assign and modify user roles with granular permissions
- **Analytics Dashboard**: Real-time statistics and user activity monitoring
- **Activity Logs**: Track all administrative actions
- **Account Controls**: Activate/deactivate accounts, reset passwords
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Zustand** - State management

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 5001

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

## Development

```bash
# Start development server
npm run dev

# Server runs on http://localhost:5174
```

## Available Scripts

- `npm run dev` - Start development server on port 5174
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
admin/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── AdminLayout.jsx
│   │   ├── UserManagementDialog.jsx
│   │   └── ...
│   ├── pages/           # Route pages
│   │   ├── AdminDashboard.jsx
│   │   ├── UserManagement.jsx
│   │   └── Settings.jsx
│   ├── services/        # API service layer
│   │   ├── api.js       # Axios configuration
│   │   ├── userService.js
│   │   └── dashboardService.js
│   └── App.jsx          # Route definitions
├── package.json
└── vite.config.js
```

## Default Admin Account

```
Email: admin@example.com
Password: Admin123!
```

## Features Overview

### User Management
- View all users in a sortable, filterable table
- Create new user accounts with role assignment
- Edit user details and permissions
- Toggle account activation status
- Reset user passwords
- Delete user accounts

### Dashboard Analytics
- Total users count by role
- Recent registrations
- User activity tracking
- System health metrics

### Role Hierarchy
- **Super Admin** (Level 5): Full system control
- **Admin** (Level 4): User management, content moderation
- **Manager** (Level 3): Department management
- **Staff** (Level 2): Basic administrative tasks
- **User** (Level 1): Standard access

## API Integration

The admin dashboard communicates with the backend API using JWT authentication. All requests include:
- Access tokens in Authorization headers
- Automatic token refresh on expiry
- Role-based endpoint access control

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password handling
- Activity logging for audit trails
- Protected routes with authentication checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT