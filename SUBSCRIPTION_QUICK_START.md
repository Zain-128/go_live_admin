# Subscription Module - Quick Start Guide

## Prerequisites

1. **Backend Running:**
   - Backend API should be running on `http://localhost:5000`
   - Subscription module v2.0.0+ installed
   - MongoDB connection active
   - Stripe credentials configured (optional, for Stripe sync)

2. **Admin User:**
   - You need an admin account with role level >= 3
   - Default admin: `admin@example.com` / `Admin123!` (if using seed data)

## Setup Steps

### 1. Install Dependencies
```bash
cd admin
npm install
```

### 2. Configure Environment
Verify `.env` file contains:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```

The admin panel will open at `http://localhost:5174`

### 4. Login
1. Navigate to `http://localhost:5174/login`
2. Login with admin credentials
3. You should see the dashboard

## Testing the Subscription Features

### Test 1: Create a Package

1. **Navigate to Packages:**
   - Click "Packages" in the sidebar
   - You should see the Package Management page

2. **Create a New Package:**
   - Click "New Package" button
   - Fill in the form:
     ```
     Name: Basic Plan
     Slug: basic
     Description: Perfect for individuals
     Type: Recurring
     Interval: month
     Interval Count: 1
     Price Amount: 999 (for $9.99)
     Currency: USD
     Tier: 2
     ```
   - Add features: `basic_access`, `email_support`
   - Click "Create Package"

3. **Verify:**
   - Package appears in the list
   - Check sync status (should be "synced" if Stripe is configured)
   - Check Stripe Dashboard to see if product was created

### Test 2: View Subscriptions

1. **Navigate to Subscriptions:**
   - Click "Subscriptions" in the sidebar
   - You should see all user subscriptions

2. **Filter Subscriptions:**
   - Try filtering by status (Active, Trialing, etc.)
   - Try filtering by type (One-time, Recurring)

3. **View Details:**
   - Click the eye icon on any subscription
   - View full subscription details

### Test 3: Manage a Subscription

1. **Open Actions:**
   - Click the settings icon on a subscription
   - You'll see the Subscription Actions dialog

2. **Test Cancel:**
   - Select "Cancel Subscription"
   - Choose "At period end"
   - Add a reason
   - Click "Cancel Subscription"
   - Verify status changes

3. **Test Extend:**
   - Select "Extend Subscription"
   - Enter number of days (e.g., 30)
   - Add a reason
   - Click "Extend"
   - Verify new period end date

### Test 4: View Statistics

1. **Navigate to Subscription Stats:**
   - Click "Subscription Stats" in the sidebar

2. **Verify Data:**
   - Check total subscriptions count
   - Check active subscriptions count
   - Check total revenue
   - View revenue by currency
   - View top performing packages
   - View recent subscriptions

### Test 5: Package Management Actions

1. **Edit a Package:**
   - Go to Packages page
   - Click edit icon on any package
   - Update the name or tier
   - Save changes
   - Verify sync status

2. **Toggle Visibility:**
   - Find a package
   - Note if it's Public or Private
   - Edit the package
   - Toggle "Is Public" switch
   - Save
   - Verify badge changes

3. **Delete a Package:**
   - Try to delete a package with active subscribers
   - You should get an error
   - Delete a package with 0 subscribers
   - Should succeed

## Common Issues & Solutions

### Issue 1: "Failed to fetch packages"
**Solution:**
- Verify backend is running on port 5000
- Check `.env` file has correct API URL
- Check browser console for CORS errors
- Verify you're logged in as admin

### Issue 2: "Unauthorized" errors
**Solution:**
- Your token might be expired
- Logout and login again
- Check that your user has admin role (level >= 3)

### Issue 3: "Stripe sync failed"
**Solution:**
- This is expected if Stripe is not configured
- Package will still be created locally
- Admin can retry sync later when Stripe is configured
- Check backend logs for specific Stripe errors

### Issue 4: Can't delete package
**Solution:**
- Check if package has active subscribers
- You can only delete packages with 0 subscribers
- Alternative: Set `isActive: false` to deactivate instead

### Issue 5: Stats not loading
**Solution:**
- Check if there are any subscriptions in the database
- If fresh install, create some test subscriptions first
- Check backend logs for aggregation errors

## API Verification

You can test the API directly using curl:

### Get Packages
```bash
TOKEN="your_admin_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/subscription/admin/packages
```

### Get Stats
```bash
TOKEN="your_admin_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/subscription/admin/stats
```

### Get Subscriptions
```bash
TOKEN="your_admin_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/subscription/admin/subscriptions
```

## Expected Behavior

### Package Creation
- ✅ Form validates all required fields
- ✅ Creates package in database
- ✅ Auto-creates Stripe product (if configured)
- ✅ Shows success toast
- ✅ Refreshes package list
- ✅ Displays sync status badge

### Subscription Management
- ✅ List shows all subscriptions with pagination
- ✅ Filters work correctly
- ✅ Details dialog shows complete information
- ✅ Cancel action updates status
- ✅ Extend action updates period end date
- ✅ Pause/Resume actions change status

### Statistics Page
- ✅ Shows accurate counts
- ✅ Calculates revenue correctly
- ✅ Displays top packages by subscriber count
- ✅ Shows recent activity
- ✅ Handles multiple currencies

## Development Tips

### Debugging
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Verify request/response data

### Toast Notifications
- Success: Green toast
- Error: Red toast with error message
- Info: Blue toast

### Component Hierarchy
```
App.jsx
├── AdminLayout
│   ├── PackageManagement
│   │   ├── PackageFormDialog
│   │   └── StripeProductDialog
│   ├── SubscriptionManagement
│   │   ├── SubscriptionDetailsDialog
│   │   └── SubscriptionActionsDialog
│   └── SubscriptionStats
```

## Next Steps

After verifying everything works:

1. **Configure Stripe:**
   - Add Stripe credentials to backend `.env`
   - Test auto-sync feature
   - Verify products appear in Stripe Dashboard

2. **Create Test Data:**
   - Create multiple packages (different tiers)
   - Create test subscriptions
   - Test all status transitions

3. **Production Deployment:**
   - Update API URL in `.env` to production
   - Build the app: `npm run build`
   - Deploy `dist/` folder to hosting
   - Configure CORS on backend

## Support

If you encounter issues:
1. Check this guide first
2. Review SUBSCRIPTION_IMPLEMENTATION.md for details
3. Check backend subscription module README
4. Verify API responses in Network tab
5. Check backend logs for errors

---

**Happy Testing!** 🚀
