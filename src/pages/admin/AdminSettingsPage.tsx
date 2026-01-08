import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Video,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  const { profile, refetchProfile } = useAuthContext();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    avatar_url: profile?.avatar_url || '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailOnNewViewer: true,
    emailOnStreamEnd: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  // Stream settings
  const [streamSettings, setStreamSettings] = useState({
    defaultCategory: 'General',
    autoRecord: true,
    chatEnabled: true,
    lowLatencyMode: true,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          avatar_url: profileData.avatar_url,
        })
        .eq('id', profile?.id);

      if (error) throw error;

      refetchProfile();
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated',
    });
  };

  const categories = ['Football', 'Basketball', 'MMA', 'Motorsport', 'Tennis', 'Cricket', 'General'];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="streaming" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Streaming
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stream-card p-6"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {profileData.name?.charAt(0) || profile?.email?.charAt(0) || 'A'}
                </div>
                <div>
                  <Button variant="secondary" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="mt-1 bg-secondary"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stream-card p-6"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Viewer Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when viewers join your stream
                  </p>
                </div>
                <Switch
                  checked={notifications.emailOnNewViewer}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailOnNewViewer: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Stream End Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a summary email after each stream
                  </p>
                </div>
                <Switch
                  checked={notifications.emailOnStreamEnd}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailOnStreamEnd: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable browser push notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Analytics Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a weekly summary of your performance
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, weeklyReport: checked })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Check className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Streaming Tab */}
        <TabsContent value="streaming">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stream-card p-6"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Streaming Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label>Default Category</Label>
                <Select
                  value={streamSettings.defaultCategory}
                  onValueChange={(value) => 
                    setStreamSettings({ ...streamSettings, defaultCategory: value })
                  }
                >
                  <SelectTrigger className="mt-1 w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Record Streams</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save recordings of your streams
                  </p>
                </div>
                <Switch
                  checked={streamSettings.autoRecord}
                  onCheckedChange={(checked) => 
                    setStreamSettings({ ...streamSettings, autoRecord: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Live Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable chat during live streams
                  </p>
                </div>
                <Switch
                  checked={streamSettings.chatEnabled}
                  onCheckedChange={(checked) => 
                    setStreamSettings({ ...streamSettings, chatEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Latency Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce stream delay for better interaction
                  </p>
                </div>
                <Switch
                  checked={streamSettings.lowLatencyMode}
                  onCheckedChange={(checked) => 
                    setStreamSettings({ ...streamSettings, lowLatencyMode: checked })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Check className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stream-card p-6"
          >
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Update your account password
                </p>
                <Button variant="secondary">
                  Update Password
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                <Button variant="secondary">
                  Enable 2FA
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all data
                </p>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
