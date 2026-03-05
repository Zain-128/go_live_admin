import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, AlertCircle } from 'lucide-react';
import api from '../services/api';

export function AdminLoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        login: formData.login,
        password: formData.password
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;

        // Backend only allows admin/moderator to log in; optional client-side check by role name or level
        const roleName = (user.role?.name || user.role || '').toUpperCase();
        const hasLevelAccess = user.role?.level >= 3 || ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'STAFF'].includes(roleName);
        if (!hasLevelAccess) {
          setError('Access denied. Admin dashboard access required.');
          setLoading(false);
          return;
        }

        // Store tokens
        localStorage.setItem('adminAccessToken', tokens.accessToken);
        localStorage.setItem('adminRefreshToken', tokens.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(user));

        // Call success callback
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Admin Panel Access
          </CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="login">Email or Username</Label>
                <Input
                  id="login"
                  name="login"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.login}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-800 mb-3">Demo Credentials:</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Super Admin:</strong> admin@example.com / Abcd@1234</p>
            <p><strong>Staff:</strong> staff1@example.com / Staff123!</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-500 text-balance">
        Admin access requires elevated privileges.{' '}
        <br />
        Contact your system administrator if you need access.
      </div>
    </div>
  );
}