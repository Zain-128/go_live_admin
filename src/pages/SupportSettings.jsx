import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supportService } from '../services/supportService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Trash2, Plus, AtSign, ShieldCheck } from 'lucide-react';

const SupportSettings = () => {
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const [fallbackEmail, setFallbackEmail] = useState(null);
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await supportService.getSettings();
      setRecipients(data.notificationEmails || []);
      setFallbackEmail(data.fallbackEnvEmail || null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSaving(true);
      await supportService.addRecipient({ email: email.trim(), label: label.trim() });
      setEmail(''); setLabel('');
      toast.success('Recipient added');
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add recipient');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r, checked) => {
    try {
      await supportService.updateRecipient(r._id, { active: checked });
      setRecipients((list) => list.map((x) => x._id === r._id ? { ...x, active: checked } : x));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const handleRemove = async (r) => {
    if (!confirm(`Remove ${r.email}?`)) return;
    try {
      await supportService.removeRecipient(r._id);
      setRecipients((list) => list.filter((x) => x._id !== r._id));
      toast.success('Recipient removed');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Remove failed');
    }
  };

  const activeCount = recipients.filter((r) => r.active).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage who gets an internal alert email when a new support ticket is created.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AtSign className="w-4 h-4" /> Notification recipients</CardTitle>
          <CardDescription>
            Every new ticket sends an internal alert to the active recipients below. If none are active,
            the system falls back to the <code>SUPPORT_NOTIFY_EMAIL</code> environment variable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-gray-500 text-sm">Loading…</div>
          ) : (
            <>
              {recipients.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No recipients configured yet.</div>
              ) : (
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div key={r._id} className="flex items-center justify-between border rounded p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{r.email}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {r.label || <span className="italic">no label</span>}
                          {r.active
                            ? <Badge variant="outline" className="text-green-700 border-green-300">active</Badge>
                            : <Badge variant="outline" className="text-gray-500">disabled</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={!!r.active} onCheckedChange={(v) => handleToggle(r, v)} />
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(r)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeCount === 0 && fallbackEmail && (
                <div className="flex items-center gap-2 p-3 rounded bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <div>
                    No active recipients — alerts will fall back to env value: <code>{fallbackEmail}</code>
                  </div>
                </div>
              )}
              {activeCount === 0 && !fallbackEmail && (
                <div className="flex items-center gap-2 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <div>No active recipients and no env fallback. New-ticket alerts are currently not being sent.</div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add recipient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="support-lead@example.com" />
            </div>
            <div>
              <Label htmlFor="label">Label (optional)</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Support Lead" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !email.trim()}>Add recipient</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportSettings;
