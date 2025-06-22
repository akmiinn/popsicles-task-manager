
import { useState, useEffect } from 'react';
import { User, Mail, Globe, Bell, Clock, Calendar, Save, Camera, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ProfileProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  onSignOut: () => void;
}

const Profile = ({ profile, onProfileUpdate, onSignOut }: ProfileProps) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onProfileUpdate(formData);
      setIsSaving(false);
    }, 500);
  };

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 p-8 mb-8 animate-scale-in">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-600" />
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all duration-300 hover:scale-110 glass-3d">
                <Camera className="w-4 h-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-1">{formData.name}</h2>
              <p className="text-gray-600">{formData.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 p-8 animate-slide-up">
          <h3 className="text-xl font-light text-gray-900 mb-6">Profile Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 h-24 resize-none shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Timezone
                </label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger className="glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London Time</SelectItem>
                    <SelectItem value="Europe/Paris">Paris Time</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger className="glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Time Format
                </label>
                <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value as '12h' | '24h')}>
                  <SelectTrigger className="glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Week Starts On
                </label>
                <Select value={formData.weekStart} onValueChange={(value) => handleInputChange('weekStart', value as 'sunday' | 'monday')}>
                  <SelectTrigger className="glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Preference
              </label>
              <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value as 'light' | 'dark')}>
                <SelectTrigger className="glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.notifications}
                onChange={(e) => handleInputChange('notifications', e.target.checked)}
                className="w-4 h-4 text-gray-600 rounded focus:ring-gray-300 transition-all duration-300"
              />
              <label htmlFor="notifications" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Enable Notifications
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] glossy-button-3d mb-4"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium flex items-center justify-center gap-2 hover:scale-[1.02] glossy-button-3d"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
