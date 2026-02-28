import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Check, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PasswordResetDialog = ({
  isOpen,
  onClose,
  user,
  tempPassword
}) => {
  const [copied, setCopied] = useState(false);

  if (!user || !tempPassword) return null;

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-green-600" />
            <DialogTitle>Password Reset Successful</DialogTitle>
          </div>
          <DialogDescription>
            A new temporary password has been generated for{' '}
            <span className="font-medium">{user.firstName} {user.lastName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">User:</span>
                <span className="text-gray-900">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Username:</span>
                <span className="text-gray-900">@{user.username}</span>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Temporary Password
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tempPassword}
                readOnly
                className="font-mono bg-blue-50 border-blue-200"
              />
              <Button
                onClick={handleCopyPassword}
                variant="outline"
                size="sm"
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-amber-800">Important Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>Share this password securely with the user</li>
                  <li>The user should change this password upon next login</li>
                  <li>This password will not be shown again</li>
                  <li>Consider sending via secure communication channels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};