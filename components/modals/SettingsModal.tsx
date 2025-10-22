'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { User, Bell, Shield, Moon, Sun, Camera, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchUserData();
    }
  }, [user, isOpen]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('users')
        .select('username, bio, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setFormData(prev => ({
          ...prev,
          username: data.username || '',
          bio: data.bio || ''
        }));
        setProfilePicture(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setProfilePicture(data.publicUrl);
      
      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      toast.success('Profile picture updated!', {
        description: 'Your new profile picture is now visible'
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture', {
        description: (error as Error)?.message || 'Unknown error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadProfilePicture(file);
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          bio: formData.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated!', {
        description: 'Your profile changes have been saved'
      });
      // Trigger a page refresh to update all components
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile', {
        description: (error as Error)?.message || 'Unknown error'
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 mb-3 block">Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('profile-picture-upload')?.click()}
                      disabled={uploading}
                      className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Change Picture'}
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveAccount}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" className="border-zinc-700 text-gray-300" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Use dark theme across the forum</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-gray-400" />
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  <Moon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about replies and mentions</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-gray-300">Email Updates</Label>
                  <p className="text-sm text-gray-500">Receive weekly digest emails</p>
                </div>
                <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">Save Preferences</Button>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="text-gray-300">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-gray-300">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            
            <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <Label className="text-gray-300">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security (Coming Soon)</p>
                </div>
                <Button variant="outline" disabled className="border-zinc-700 text-gray-500">
                  Enable 2FA
                </Button>
              </div>
            </div>
            
            <Button className="bg-orange-500 hover:bg-orange-600">Update Password</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 border-r border-zinc-800 p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
}
