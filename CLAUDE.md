# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Admin Dashboard project.

## Project Overview

This is an **Admin Dashboard** built with React 18 and Vite for managing users, viewing analytics, and system administration. It's designed to work with a backend API and uses role-based access control (RBAC) to restrict access to users with admin privileges (role level 3+).

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server (runs on port 5174)
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built UI components (Radix UI primitives)
- **Axios** - HTTP client with automatic token refresh
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

## Development Commands

```bash
npm run dev          # Start development server on port 5174
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## Project Structure

```
admin/
├── src/
│   ├── App.jsx                      # Main app with routes and auth
│   ├── main.jsx                     # App entry point
│   ├── index.css                    # Global styles with Tailwind
│   │
│   ├── pages/                       # Route pages
│   │   ├── AdminLogin.jsx           # Login page
│   │   ├── AdminDashboard.jsx       # Dashboard with stats
│   │   ├── UserManagement.jsx       # User list and management
│   │   └── Settings.jsx             # Settings placeholder
│   │
│   ├── components/                  # Reusable components
│   │   ├── AdminLayout.jsx          # Layout with sidebar & topbar
│   │   ├── AdminLoginForm.jsx       # Login form component
│   │   ├── UserManagementDialog.jsx # Edit/delete user dialog
│   │   ├── CreateUserDialog.jsx     # Create new user dialog
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── dialog.jsx
│   │       ├── input.jsx
│   │       ├── select.jsx
│   │       ├── switch.jsx
│   │       ├── table.jsx
│   │       ├── badge.jsx
│   │       └── ... (other UI components)
│   │
│   ├── services/                    # API services
│   │   ├── api.js                   # Axios instance with interceptors
│   │   ├── userService.js           # User CRUD operations
│   │   └── dashboardService.js      # Dashboard stats/metrics
│   │
│   ├── hooks/                       # Custom React hooks (if any)
│   └── lib/
│       └── utils.js                 # cn() utility for Tailwind classes
│
├── public/                          # Static assets
├── components.json                  # shadcn/ui configuration
├── tailwind.config.js              # Tailwind configuration
├── vite.config.js                  # Vite configuration
└── package.json                    # Dependencies and scripts
```

## Authentication & Authorization

### Auth Flow
1. User logs in via `/login` with email/username and password
2. Backend validates and returns JWT tokens + user object
3. Only users with `role.level >= 3` OR `admin_dashboard` permission can access
4. Tokens stored in localStorage with `admin` prefix to avoid conflicts
5. Automatic token refresh via axios interceptors on 401 errors

### Local Storage Keys
- `adminAccessToken` - JWT access token (1h expiry)
- `adminRefreshToken` - JWT refresh token (7d expiry)
- `adminUser` - Serialized user object with role information

### Role Levels
- **Level 5**: Super Admin (full access)
- **Level 4**: Admin (user management)
- **Level 3**: Staff (can create/edit users below their level)
- **Level 2**: User (no admin access)
- **Level 1**: Guest (no admin access)

### Permission Checks
```javascript
// Check if user can access admin panel
const isAuthenticated = () => {
  const token = localStorage.getItem('adminAccessToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return token && user.role?.level >= 3;
};

// Check if user can manage another user
const canManageUser = (targetUser) => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return currentUser.role?.level > targetUser.role?.level;
};
```

## API Integration

### Base Configuration
```javascript
// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
```

### API Endpoints

#### Authentication
- `POST /auth/login`
  - **Request**: `{ login: string, password: string }`
  - **Response**: `{ success: boolean, data: { user: User, tokens: { accessToken: string, refreshToken: string } } }`
  - **Used in**: `AdminLoginForm.jsx:33`

- `POST /auth/refresh`
  - **Request**: `{ refreshToken: string }`
  - **Response**: `{ data: { tokens: { accessToken: string, refreshToken: string } } }`
  - **Used in**: `services/api.js:63` (automatic via interceptor)

#### User Management
- `GET /admin/users?page=1&limit=10&role=&search=`
  - **Response**: `{ success: boolean, data: { users: User[], pagination: { current: number, total: number, count: number, totalUsers: number } } }`
  - **Used in**: `services/userService.js:13`, `pages/UserManagement.jsx:56`

- `GET /admin/users/:id`
  - **Response**: `{ success: boolean, data: User }`
  - **Used in**: `services/userService.js:18`

- `POST /admin/users`
  - **Request**: `{ firstName: string, lastName: string, email: string, username: string, password?: string, roleId?: string }`
  - **Response**: `{ success: boolean, data: { user: User, tempPassword?: string } }`
  - **Used in**: `services/userService.js:23`, `CreateUserDialog.jsx:151`

- `PUT /admin/users/:id`
  - **Request**: `{ firstName?: string, lastName?: string, email?: string, username?: string, isActive?: boolean, roleId?: string }`
  - **Response**: `{ success: boolean, data: User }`
  - **Used in**: `services/userService.js:28`, `UserManagementDialog.jsx:193`

- `PATCH /admin/users/:id/reset-password`
  - **Response**: `{ success: boolean, data: { tempPassword: string } }`
  - **Used in**: `UserManagementDialog.jsx:225`

- `DELETE /admin/users/:id`
  - **Response**: `{ success: boolean }`
  - **Used in**: `UserManagementDialog.jsx:245`

#### Roles
- `GET /admin/roles`
  - **Response**: `{ success: boolean, data: Role[] }`
  - **Used in**: `UserManagementDialog.jsx:95`, `CreateUserDialog.jsx:64`

#### Dashboard
- `GET /dashboard/stats`
  - **Response**: `{ success: boolean, data: { totalUsers: { count: number, change: string, changeType: string }, activeUsers: { ... }, adminUsers: { ... } } }`
  - **Used in**: `services/dashboardService.js:7`, `AdminDashboard.jsx:39`

- `GET /dashboard/activity?limit=10`
  - **Response**: `{ success: boolean, data: Activity[] }` where Activity = `{ id: string, type: string, action: string, user: string, time: string }`
  - **Used in**: `services/dashboardService.js:17`, `AdminDashboard.jsx:40`

- `GET /dashboard/metrics`
  - **Response**: `{ success: boolean, data: { databaseSize: string, activeSessions: string, apiRequestsPerHour: string, averageResponse: string } }`
  - **Used in**: `services/dashboardService.js:29`, `AdminDashboard.jsx:41`

### Data Models

#### User Object
```typescript
{
  _id: string
  firstName: string
  lastName: string
  email: string
  username: string
  isActive: boolean
  role: {
    _id: string
    name: string          // e.g., "SUPER_ADMIN", "ADMIN", "STAFF", "USER"
    displayName: string   // e.g., "Super Admin", "Admin", "Staff", "User"
    level: number         // 1-5
    permissions?: Array<{
      resource: string
      action: string
    }>
  }
  createdAt: string       // ISO date
  lastLogin?: string      // ISO date
}
```

#### Role Object
```typescript
{
  _id: string
  name: string
  displayName: string
  level: number
  permissions: Array<{
    resource: string
    action: string
  }>
}
```

## Component Architecture

### Page Components

1. **AdminLogin** (`pages/AdminLogin.jsx`)
   - Renders `AdminLoginForm` component
   - Handles login success callback
   - Public route (no auth required)

2. **AdminDashboard** (`pages/AdminDashboard.jsx`)
   - Fetches and displays dashboard stats, recent activity, and metrics
   - Shows stat cards (total users, active users, admin users)
   - Displays recent activity feed
   - Shows system metrics (database size, sessions, API requests, response time)
   - Protected route (requires level 3+)

3. **UserManagement** (`pages/UserManagement.jsx`)
   - Lists all users in paginated table
   - Search by name, email, or username
   - Filter by role (ALL, ADMIN, STAFF, USER)
   - Stats cards showing user counts
   - Opens `UserManagementDialog` for editing
   - Opens `CreateUserDialog` for creating new users
   - Protected route (requires level 3+)

4. **Settings** (`pages/Settings.jsx`)
   - Placeholder page with setting categories
   - No active functionality (for future expansion)
   - Protected route (requires level 3+)

### Dialog Components

1. **UserManagementDialog** (`components/UserManagementDialog.jsx`)
   - View/Edit user details (name, email, username, role)
   - Toggle user active status (optimistic update)
   - Reset password (generates temp password)
   - Delete user (with confirmation)
   - Permission check: can only manage users with lower role level
   - Fetches roles from `/admin/roles`

2. **CreateUserDialog** (`components/CreateUserDialog.jsx`)
   - Create new user form
   - Fields: firstName, lastName, email, username, password (optional), role
   - Auto-generate password button
   - Frontend validation (email format, username alphanumeric, password strength)
   - Backend returns tempPassword if no password provided
   - Only shows roles below current user's level

### Layout Component

**AdminLayout** (`components/AdminLayout.jsx`)
- Responsive sidebar navigation (desktop + mobile)
- Top bar with user info
- Logout functionality
- Navigation items:
  - Dashboard (`/`)
  - User Management (`/users`)
  - Settings (`/settings`)

### Form Component

**AdminLoginForm** (`components/AdminLoginForm.jsx`)
- Login form with email/username and password
- Validates admin access (level 3+ or admin_dashboard permission)
- Stores tokens with `admin` prefix in localStorage
- Shows demo credentials

## Routing

```javascript
// App.jsx routes
<Routes>
  <Route path="/" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
  <Route path="/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
  <Route path="/login" element={<AdminLogin />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## State Management

### Component-Level State
- No global state management library (no Redux, Zustand, etc.)
- User state passed down from `App.jsx` to components via props
- Each page manages its own local state (users list, pagination, loading, etc.)

### Auth State
- User object stored in `App.jsx` state
- Also persisted in localStorage as `adminUser`
- Checked on app load via `useEffect` in `App.jsx:38`

### Data Fetching Pattern
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await service.getData();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## Styling Approach

### Tailwind CSS
- Utility-first CSS framework
- Custom configuration in `tailwind.config.js`
- Base styles in `src/index.css`

### shadcn/ui Components
- Pre-built accessible components from Radix UI
- Located in `src/components/ui/`
- Configured via `components.json`
- Customized with Tailwind classes

### Utility Function
```javascript
// lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```
Used to conditionally merge Tailwind classes without conflicts.

## Error Handling

### Toast Notifications
```javascript
import { toast } from 'sonner';

// Success
toast.success('User updated successfully!');

// Error
toast.error('Failed to update user');

// Info
toast.info('Processing...');
```

### API Error Handling
- Axios interceptor catches 401 errors and refreshes tokens
- Individual components handle other errors with try/catch
- Error messages shown via toast notifications
- Form validation errors displayed inline

## Development Workflow

### Adding a New Page
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `AdminLayout.jsx` if needed
4. Wrap in `ProtectedRoute` if auth required

### Adding a New API Endpoint
1. Add service function in `src/services/` (e.g., `userService.js`)
2. Use `api` instance from `services/api.js` (handles auth automatically)
3. Handle errors with try/catch
4. Show success/error via toast notifications

### Adding a New shadcn/ui Component
```bash
# If shadcn CLI is set up
npx shadcn-ui@latest add <component-name>

# Components are added to src/components/ui/
```

### Working with Forms
1. Use controlled components with `useState`
2. Validate on submit or onChange
3. Show errors inline below inputs
4. Disable form during submission
5. Show loading state on submit button

## Important Patterns

### Optimistic Updates
```javascript
// Example: Toggle user status
const handleStatusToggle = async (checked) => {
  const previousValue = formData.isActive;

  // Update UI immediately
  setFormData(prev => ({ ...prev, isActive: checked }));

  try {
    await api.put(`/admin/users/${user._id}`, { ...formData, isActive: checked });
    toast.success('Status updated');
  } catch (err) {
    // Rollback on error
    setFormData(prev => ({ ...prev, isActive: previousValue }));
    toast.error('Failed to update status');
  }
};
```

### Pagination Pattern
```javascript
const [pagination, setPagination] = useState({
  current: 1,
  total: 1,
  count: 0,
  totalUsers: 0
});

// Backend should return this pagination object
const response = await userService.getAllUsers({ page, limit, search, role });
setPagination(response.data.pagination);
```

### Permission-Based Rendering
```javascript
const canManageUser = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return currentUser.role?.level > targetUser.role?.level;
};

return (
  <>
    {canManageUser() && (
      <Button onClick={handleEdit}>Edit User</Button>
    )}
  </>
);
```

## Environment Variables

Create a `.env` file in the root:
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

Access in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

## Common Tasks

### Update Backend API URL
1. Update `VITE_API_BASE_URL` in `.env`
2. Restart dev server

### Add New Role Badge Color
```javascript
// In any component with getRoleBadgeVariant function
const getRoleBadgeVariant = (roleName) => {
  switch (roleName) {
    case 'NEW_ROLE':
      return 'default'; // or 'destructive', 'secondary', 'outline'
    // ... other cases
  }
};
```

### Modify Token Storage Keys
Update all occurrences of:
- `adminAccessToken`
- `adminRefreshToken`
- `adminUser`

In files:
- `src/App.jsx`
- `src/services/api.js`
- `src/components/AdminLoginForm.jsx`
- `src/components/AdminLayout.jsx`

## Testing Considerations

Currently no automated tests, but when adding tests:
- Mock API calls using MSW or axios-mock-adapter
- Test protected routes with various role levels
- Test form validation
- Test optimistic updates and rollbacks
- Test token refresh flow

## Known Limitations

1. **Settings page** is a placeholder with no functionality
2. **Dashboard metrics** may show dummy data if backend doesn't provide real metrics
3. **No real-time updates** - requires manual refresh
4. **No bulk operations** - users must be edited one at a time
5. **No role management UI** - roles are read-only from backend

## Future Improvements

When adding new features, consider:
- Real-time updates via WebSockets
- Bulk user operations (delete, role assignment)
- Advanced search with filters
- Export user data (CSV, Excel)
- Activity logs per user
- Email notification settings
- Two-factor authentication
- Profile picture uploads

## Backend Compatibility Requirements

When integrating with a new backend, ensure it provides:

### Required Auth Endpoints
- `POST /auth/login` with JWT tokens
- `POST /auth/refresh` for token renewal
- Role level or permission check for admin access

### Required User Endpoints
- `GET /admin/users` with pagination
- `POST /admin/users` to create
- `PUT /admin/users/:id` to update
- `DELETE /admin/users/:id` to delete
- `PATCH /admin/users/:id/reset-password` to reset

### Required Role Endpoint
- `GET /admin/roles` to fetch all roles

### Optional Dashboard Endpoints
- `GET /dashboard/stats`
- `GET /dashboard/activity`
- `GET /dashboard/metrics`

### Expected Response Format
All endpoints should return:
```json
{
  "success": boolean,
  "data": any,
  "message"?: string,
  "errors"?: Array
}
```

## Migration Checklist for New Backend

When you provide a new backend, Claude will need to:

1. [ ] Update API base URL in `.env`
2. [ ] Verify authentication endpoint matches (`/auth/login`)
3. [ ] Check token response structure
4. [ ] Verify user object structure (especially `role` field)
5. [ ] Update all service functions if endpoint paths changed
6. [ ] Test token refresh flow
7. [ ] Verify pagination format matches expected structure
8. [ ] Test role-based access control
9. [ ] Update any hardcoded role names if changed
10. [ ] Test all CRUD operations (create, read, update, delete)
11. [ ] Verify error response format
12. [ ] Update toast messages if needed
13. [ ] Test form validation matches backend requirements
14. [ ] Run full manual test of all features

## Contact & Support

When working with this codebase:
- All API calls are documented in this file with exact request/response formats
- Component hierarchy is documented with file locations
- State management is component-based, no global state
- All form validations are client-side (may need backend validation too)
