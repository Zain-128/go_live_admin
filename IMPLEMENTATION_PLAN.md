# Admin Dashboard - Backend Integration Implementation Plan

## Overview
This document outlines the complete plan to integrate the Admin Dashboard with the new Universal Secure API Backend running on `http://localhost:5000`.

## Backend API Analysis Summary

### Backend Structure
- **Base URL**: `http://localhost:5000/api/v1`
- **Authentication**: JWT with access tokens (15min) and refresh tokens (7d)
- **Token Storage**: Can be in localStorage or httpOnly cookies
- **Response Format**: `{ success: boolean, data: any, message: string }`
- **Role System**: Uses Role ObjectId references with level-based hierarchy

### Key Differences from Current Implementation

| Feature | Current Admin Expects | New Backend Provides |
|---------|----------------------|---------------------|
| **Login endpoint** | `POST /auth/login` | `POST /auth/login` ✅ |
| **Login request** | `{ login, password }` | `{ email, password }` ❌ |
| **User list endpoint** | `GET /admin/users` | `GET /admin/users` ✅ |
| **User object** | Has `username` field | Has `username` field ✅ |
| **Role structure** | `role: { name, displayName, level }` | `role: ObjectId (ref)` ❌ |
| **Role levels** | Level 3+ for admin | Uses role names like 'Admin', 'Super Admin' ❌ |
| **Create user** | `POST /admin/users` | `POST /admin/users` ✅ |
| **Update user** | `PUT /admin/users/:id` | `PUT /admin/users/:id` ✅ |
| **Delete user** | `DELETE /admin/users/:id` | `DELETE /admin/users/:id` ✅ |
| **Reset password** | `PATCH /admin/users/:id/reset-password` | `PATCH /admin/users/:id/reset-password` ✅ |
| **Dashboard stats** | `GET /dashboard/stats` | `GET /dashboard/stats` ✅ |
| **Dashboard activity** | `GET /dashboard/activity` | `GET /dashboard/activity` ✅ |
| **Dashboard metrics** | `GET /dashboard/metrics` | `GET /dashboard/metrics` ✅ |
| **Get roles** | `GET /admin/roles` | `GET /rbac/roles` ❌ |

---

## Implementation Tasks

### Phase 1: Configuration & Setup

#### Task 1.1: Update Environment Configuration
**File**: `.env`
**Changes**:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

#### Task 1.2: Update API Service Base URL
**File**: `src/services/api.js`
**Changes**:
- Line 3: Update default API base URL from `http://localhost:5001/api/v1` to `http://localhost:5000/api/v1`

---

### Phase 2: Authentication Integration

#### Task 2.1: Update Login Request Format
**File**: `src/components/AdminLoginForm.jsx`
**Current** (Line 34):
```javascript
const response = await api.post('/auth/login', {
  login: formData.login,  // ❌ Backend expects 'email'
  password: formData.password
});
```

**Updated**:
```javascript
const response = await api.post('/auth/login', {
  email: formData.login,  // ✅ Send as 'email'
  password: formData.password
});
```

#### Task 2.2: Update Role-Based Access Check
**File**: `src/components/AdminLoginForm.jsx` (Lines 42-48)
**Current**:
```javascript
const hasLevelAccess = user.role?.level >= 3;
```

**Updated**:
```javascript
// Check if role is populated and has name property
const roleName = user.role?.name || user.role;
const hasLevelAccess = ['Admin', 'Super Admin', 'Moderator'].includes(roleName);
```

#### Task 2.3: Update App-Level Auth Check
**File**: `src/App.jsx` (Lines 18-24)
**Current**:
```javascript
const userData = JSON.parse(user);
return userData.role?.level >= 3;
```

**Updated**:
```javascript
const userData = JSON.parse(user);
const roleName = userData.role?.name || userData.role;
return ['Admin', 'Super Admin', 'Moderator'].includes(roleName);
```

#### Task 2.4: Update Token Refresh
**File**: `src/services/api.js` (Line 63)
**Current**:
```javascript
const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
  refreshToken
});
```

**Backend Expects** (Line 504-508 of auth route):
```javascript
POST /auth/refresh-token  // Note: different endpoint name
Body: { refreshToken: string }
```

**Updated**:
```javascript
const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
  refreshToken
});
```

---

### Phase 3: User Management Integration

#### Task 3.1: Update User List API Call
**File**: `src/services/userService.js`
**Current** (Lines 4-14):
```javascript
async getAllUsers(params = {}) {
  const { page = 1, limit = 10, role, search } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(role && { role }),
    ...(search && { search })
  });

  const response = await api.get(`/admin/users?${queryParams}`);
  return response.data;
}
```

**Backend Provides** (admin/route.js Line 70):
```javascript
GET /admin/users
Query params: page, limit, search, role, isActive, isEmailVerified, subscription
Response: { success, data: { users: [], pagination: {} } }
```

**No changes needed** ✅ - API matches expectations

#### Task 3.2: Handle User Response Format
**File**: `src/pages/UserManagement.jsx` (Line 63)
**Current**:
```javascript
setUsers(response.data.users);
setPagination(response.data.pagination);
```

**Backend Response Format**:
```javascript
{
  success: true,
  data: {
    users: [...],
    pagination: {
      current: 1,
      total: 10,
      count: 100,
      totalUsers: 1000
    }
  }
}
```

**Updated**:
```javascript
// Admin returns data wrapped in response.data
setUsers(response.data.data.users);  // Note: double .data
setPagination(response.data.data.pagination);
```

OR update userService to unwrap:
```javascript
// In userService.js getAllUsers
const response = await api.get(`/admin/users?${queryParams}`);
return response.data.data; // Return the inner data object
```

#### Task 3.3: Update Role Display Logic
**File**: `src/pages/UserManagement.jsx` (Lines 314-319)
**Current**:
```javascript
<Badge variant={getRoleBadgeVariant(user.role.name)}>
  {user.role.displayName}
</Badge>
<div className="text-xs text-gray-500 mt-1">
  Level {user.role.level}
</div>
```

**Issue**: Backend returns role as ObjectId reference, need to populate it

**Backend Solution**: The backend already populates role (check admin.controller.js)
**Frontend Update**: Add fallback handling
```javascript
<Badge variant={getRoleBadgeVariant(user.role?.name || 'USER')}>
  {user.role?.name || 'Unknown'}
</Badge>
{user.role?.level && (
  <div className="text-xs text-gray-500 mt-1">
    Level {user.role.level}
  </div>
)}
```

#### Task 3.4: Update Create User API
**File**: `src/services/userService.js` (Lines 22-24)
**Current**:
```javascript
async createUser(userData) {
  const response = await api.post('/admin/users', userData);
  return response.data;
}
```

**Backend Expects** (admin/route.js Lines 148-152):
```javascript
POST /admin/users
Body: {
  firstName: string (required),
  lastName: string (required),
  username: string,
  email: string (required),
  password: string (optional - auto-generated if not provided),
  role: string (role name like 'User', 'Admin'),
  subscription: enum ['free', 'basic', 'premium', 'enterprise']
}
Response: {
  success: true,
  data: {
    user: {...},
    tempPassword: string (if password was auto-generated)
  }
}
```

**File**: `src/components/CreateUserDialog.jsx` (Lines 143-150)
**Current**:
```javascript
const userData = {
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim().toLowerCase(),
  username: formData.username.trim(),
  ...(formData.roleId && { roleId: formData.roleId }),  // ❌ Backend expects 'role' name
  ...(formData.password && { password: formData.password })
};
```

**Updated**:
```javascript
// Need to convert roleId to role name
const selectedRole = roles.find(r => r._id === formData.roleId);
const userData = {
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim().toLowerCase(),
  username: formData.username.trim(),
  ...(selectedRole && { role: selectedRole.name }),  // ✅ Send role name
  ...(formData.password && { password: formData.password })
};
```

#### Task 3.5: Update User Update API
**File**: `src/components/UserManagementDialog.jsx` (Line 193)
**Current**:
```javascript
const response = await api.put(`/admin/users/${user._id}`, formData);
```

**Backend Expects** (admin/route.js Lines 198-202):
```javascript
PUT /admin/users/:id
Body: {
  firstName, lastName, username, email, role (role name), isActive, subscription
}
```

**Updated** (Lines 186-206):
```javascript
const handleSave = async () => {
  if (!user?._id) return;

  setLoading(true);
  setError('');

  try {
    // Convert roleId to role name if role was changed
    const selectedRole = formData.roleId !== user.role?._id
      ? roles.find(r => r._id === formData.roleId)
      : null;

    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username,
      isActive: formData.isActive,
      ...(selectedRole && { role: selectedRole.name })  // Send role name
    };

    const response = await api.put(`/admin/users/${user._id}`, updateData);
    // ... rest of the code
  }
};
```

#### Task 3.6: Update Delete User API
**File**: `src/services/userService.js`
**Status**: ✅ No changes needed - endpoint matches

#### Task 3.7: Update Reset Password API
**File**: `src/components/UserManagementDialog.jsx` (Line 225)
**Current**:
```javascript
const response = await api.patch(`/admin/users/${user._id}/reset-password`);
```

**Backend Provides** (admin/route.js Line 264):
```javascript
PATCH /admin/users/:id/reset-password
Response: {
  success: true,
  message: string,
  data: {
    userId: string,
    tempPassword: string
  }
}
```

**Status**: ✅ Endpoint matches, just need to handle response format
**Updated** (Lines 222-240):
```javascript
const handleResetPassword = async () => {
  setResetPasswordLoading(true);
  try {
    const response = await api.patch(`/admin/users/${user._id}/reset-password`);

    if (response.data.success) {
      const newTempPassword = response.data.data.tempPassword;  // ✅ Correct path
      setTempPassword(newTempPassword);
      setShowTempPassword(true);
      toast.success('Password reset successfully!');
    }
  } catch (error) {
    console.error('Failed to reset password:', error);
    const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
    toast.error(errorMessage);
  } finally {
    setResetPasswordLoading(false);
  }
};
```

---

### Phase 4: Roles Integration

#### Task 4.1: Update Roles Endpoint
**File**: `src/components/UserManagementDialog.jsx` (Line 95) & `src/components/CreateUserDialog.jsx` (Line 64)
**Current**:
```javascript
const response = await api.get('/admin/roles');
```

**Backend Provides** (rbac/route.js Line 45):
```javascript
GET /rbac/roles  // ❌ Different endpoint
Response: {
  success: true,
  data: [
    {
      _id: string,
      name: string,  // e.g., 'Admin', 'User', 'Super Admin'
      description: string,
      level: number,
      permissions: []
    }
  ]
}
```

**Updated**:
```javascript
const response = await api.get('/rbac/roles');  // ✅ New endpoint
if (response.data.success) {
  setRoles(response.data.data);  // ✅ Unwrap data
}
```

#### Task 4.2: Update Role Display Names
**Backend roles don't have `displayName`**, only `name` and `description`.

**File**: `src/components/CreateUserDialog.jsx` (Line 348)
**Current**:
```javascript
<SelectItem key={role._id} value={role._id}>
  {role.displayName}
</SelectItem>
```

**Updated**:
```javascript
<SelectItem key={role._id} value={role._id}>
  <div className="flex items-center justify-between w-full">
    <span>{role.name}</span>  {/* ✅ Use name instead of displayName */}
    <Badge variant="outline" className="ml-2">
      Level {role.level}
    </Badge>
  </div>
</SelectItem>
```

**File**: `src/components/UserManagementDialog.jsx` (Lines 417-427)
**Similar updates needed**

---

### Phase 5: Dashboard Integration

#### Task 5.1: Update Dashboard Stats API
**File**: `src/services/dashboardService.js` (Lines 5-13)
**Current**:
```javascript
getStats: async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
}
```

**Backend Provides** (dashboard/route.js Lines 75-80):
```javascript
GET /dashboard/stats
Auth: Required (Admin, Moderator, Super Admin)
Response: {
  success: true,
  data: {
    totalUsers: { count: number, change: string, changeType: string },
    activeUsers: { count: number, change: string, changeType: string },
    adminUsers: { count: number, change: string, changeType: string }
  }
}
```

**Updated**:
```javascript
getStats: async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data.data;  // ✅ Unwrap to return inner data object
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
}
```

**File**: `src/pages/AdminDashboard.jsx` (Lines 45-68)
**Current**:
```javascript
const formattedStats = [
  {
    title: 'Total Users',
    value: statsResponse.data.totalUsers.count.toString(),  // ❌ Double .data
    change: statsResponse.data.totalUsers.change,
    changeType: statsResponse.data.totalUsers.changeType,
    icon: Users
  },
  // ... more stats
];
```

**Updated**:
```javascript
// Since dashboardService now unwraps, we can use directly
const formattedStats = [
  {
    title: 'Total Users',
    value: statsResponse.totalUsers.count.toString(),  // ✅ Single level
    change: statsResponse.totalUsers.change,
    changeType: statsResponse.totalUsers.changeType,
    icon: Users
  },
  // ... more stats
];
```

#### Task 5.2: Update Dashboard Activity API
**File**: `src/services/dashboardService.js` (Lines 16-24)
**Backend Provides** (dashboard/route.js Lines 135-140):
```javascript
GET /dashboard/activity?limit=10
Response: {
  success: true,
  data: [
    {
      id: string,
      action: string,
      user: string,
      details: string,
      time: string,  // e.g., '2 hours ago'
      type: string   // e.g., 'user', 'role', 'status', 'security'
    }
  ]
}
```

**Updated**:
```javascript
getActivity: async (limit = 10) => {
  try {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data.data;  // ✅ Unwrap array
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
    throw error;
  }
}
```

**File**: `src/pages/AdminDashboard.jsx` (Line 71)
**Updated**:
```javascript
setRecentActivity(activityResponse || []);  // ✅ Direct use, no .data
```

#### Task 5.3: Update Dashboard Metrics API
**File**: `src/services/dashboardService.js` (Lines 27-35)
**Backend Provides** (dashboard/route.js Lines 185-190):
```javascript
GET /dashboard/metrics
Response: {
  success: true,
  data: {
    databaseSize: string,      // e.g., '2.5 GB'
    activeSessions: string,     // e.g., '45'
    apiRequestsPerHour: string, // e.g., '1.2K'
    systemUptime: string,       // e.g., '24.5 hours'
    memoryUsage: string         // e.g., '256.50 MB'
  }
}
```

**Note**: Backend has `systemUptime` and `memoryUsage` but frontend expects `averageResponse`

**Updated**:
```javascript
getMetrics: async () => {
  try {
    const response = await api.get('/dashboard/metrics');
    const metrics = response.data.data;

    // Map backend fields to frontend expectations
    return {
      databaseSize: metrics.databaseSize,
      activeSessions: metrics.activeSessions,
      apiRequestsPerHour: metrics.apiRequestsPerHour,
      averageResponse: metrics.systemUptime || 'N/A'  // Use systemUptime as fallback
    };
  } catch (error) {
    console.error('Failed to fetch system metrics:', error);
    throw error;
  }
}
```

**File**: `src/pages/AdminDashboard.jsx` (Lines 74-79)
**Updated**:
```javascript
const formattedMetrics = [
  { label: 'Database Size', value: metricsResponse.databaseSize, icon: Database },
  { label: 'Active Sessions', value: metricsResponse.activeSessions, icon: Activity },
  { label: 'API Requests/hr', value: metricsResponse.apiRequestsPerHour, icon: TrendingUp },
  { label: 'System Uptime', value: metricsResponse.averageResponse, icon: Clock }  // ✅ Change label
];
```

---

## Phase 6: Testing Checklist

### Authentication Tests
- [ ] Login with email and password works
- [ ] Admin/Moderator roles can access dashboard
- [ ] Non-admin roles are rejected
- [ ] Token refresh works automatically
- [ ] Logout clears tokens correctly

### User Management Tests
- [ ] List users with pagination
- [ ] Search users by name/email
- [ ] Filter users by role
- [ ] Create new user (with and without password)
- [ ] Update user details
- [ ] Update user role
- [ ] Toggle user active status
- [ ] Reset user password
- [ ] Delete user
- [ ] View user details dialog

### Roles Tests
- [ ] Fetch all roles from /rbac/roles
- [ ] Display role names correctly
- [ ] Role dropdown shows all available roles
- [ ] Role assignment works

### Dashboard Tests
- [ ] Stats cards show correct data
- [ ] Stats show change percentages
- [ ] Recent activity feed displays
- [ ] Activity shows correct icons by type
- [ ] System metrics display
- [ ] All metrics have proper formatting

---

## Implementation Order

### Priority 1: Critical (Must work for basic functionality)
1. Update .env configuration
2. Update API base URL in api.js
3. Update login request format (email instead of login)
4. Update role-based auth checks
5. Update token refresh endpoint
6. Update roles endpoint (/rbac/roles)

### Priority 2: Core Features
7. Update user list response unwrapping
8. Update create user (role name instead of roleId)
9. Update update user (role name instead of roleId)
10. Update reset password response handling
11. Update dashboard services unwrapping

### Priority 3: Polish
12. Update role display names
13. Update dashboard metrics mapping
14. Add error handling improvements
15. Add loading states

---

## File Changes Summary

| File | Changes | Priority |
|------|---------|----------|
| `.env` | Update API URL | 1 |
| `src/services/api.js` | Update base URL, refresh endpoint | 1 |
| `src/components/AdminLoginForm.jsx` | Update login format, role check | 1 |
| `src/App.jsx` | Update auth check | 1 |
| `src/services/userService.js` | Update response unwrapping | 2 |
| `src/pages/UserManagement.jsx` | Update data access paths | 2 |
| `src/components/UserManagementDialog.jsx` | Update roles endpoint, role handling | 1 |
| `src/components/CreateUserDialog.jsx` | Update roles endpoint, role name | 2 |
| `src/services/dashboardService.js` | Update unwrapping, metrics mapping | 2 |
| `src/pages/AdminDashboard.jsx` | Update data access paths | 2 |

---

## Notes & Considerations

### Role System Differences
- **Old**: Admin uses `role.level >= 3` for access control
- **New**: Backend uses role names like 'Admin', 'Super Admin', 'Moderator'
- **Solution**: Check role name in array instead of level

### Response Format
- **Backend**: Always wraps in `{ success, data, message }`
- **Frontend**: Services should unwrap to return just the data
- **Benefits**: Cleaner component code, easier error handling

### Role Assignment
- **Old**: Frontend sends `roleId`
- **New**: Backend expects `role` (name string)
- **Solution**: Convert roleId to role name before sending

### Token Refresh
- **Old**: Endpoint `/auth/refresh`
- **New**: Endpoint `/auth/refresh-token`
- **Impact**: Critical for session management

### Dashboard Metrics
- **Backend**: Provides `systemUptime` and `memoryUsage`
- **Frontend**: Expects `averageResponse`
- **Solution**: Map systemUptime to averageResponse field

---

## Backward Compatibility Notes

If you need to support both old and new backends:

1. **Use environment variable**:
```javascript
const USE_NEW_BACKEND = import.meta.env.VITE_USE_NEW_BACKEND === 'true';
```

2. **Conditional logic**:
```javascript
const checkAdminAccess = (user) => {
  if (USE_NEW_BACKEND) {
    const roleName = user.role?.name || user.role;
    return ['Admin', 'Super Admin', 'Moderator'].includes(roleName);
  } else {
    return user.role?.level >= 3;
  }
};
```

---

## Error Handling Strategy

### Backend Error Format
```javascript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Error message",
    statusCode: 400
  }
}
```

### Frontend Handling
```javascript
try {
  const response = await api.post('/endpoint', data);
  if (response.data.success) {
    // Handle success
  }
} catch (error) {
  const errorMessage = error.response?.data?.error?.message
    || error.response?.data?.message
    || 'An error occurred';
  toast.error(errorMessage);
}
```

---

This plan provides a complete roadmap for integrating the admin dashboard with your new backend. Each task is clearly defined with before/after code examples and file locations.
