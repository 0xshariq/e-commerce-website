"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function CustomerSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState({
    newsletter: false,
    notifications: true,
    twoFactorAuth: false,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as { role?: string }).role !== "customer") {
      router.push("/auth/signin");
      return;
    }
    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      setSettings(data.settings);
    } catch (_error) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      setSuccess("Settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (_error) {
      setError("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Update your notification and newsletter settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="newsletter">Subscribe to Newsletter</Label>
              <Input type="checkbox" id="newsletter" checked={settings.newsletter} onChange={e => setSettings(s => ({ ...s, newsletter: e.target.checked }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Input type="checkbox" id="notifications" checked={settings.notifications} onChange={e => setSettings(s => ({ ...s, notifications: e.target.checked }))} />
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth" className="flex items-center gap-2"><Shield className="h-4 w-4" />Two-Factor Authentication</Label>
              <Input type="checkbox" id="twoFactorAuth" checked={settings.twoFactorAuth} onChange={e => setSettings(s => ({ ...s, twoFactorAuth: e.target.checked }))} />
            </div>
            <Button onClick={handleSaveSettings} disabled={saving} className="mt-4 bg-blue-600 hover:bg-blue-700">
              {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4 mr-2" />Save Settings</>)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
