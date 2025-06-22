
import { useState } from 'react';
import { User, Settings, Bell, Globe, Calendar, Clock, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ProfileProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  onSignOut: () => void;
}

const Profile = ({ profile, onProfileUpdate, onSignOut }: ProfileProps) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState(profile);
  const { user } = useAuth();

  const handleSave = () => {
    onProfileUpdate(formData);
    setEditingProfile(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditingProfile(false);
  };

  return (
    <div className="flex-1 p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="glass-3d rounded-2xl p-8 text-center animate-scale-in">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-2">{profile.name}</h2>
          <p className="text-gray-600 mb-4">{user?.email || profile.email}</p>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">{profile.bio}</p>
        </div>

        {/* Profile Settings */}
        <div className="glass-3d rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
            </div>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-105"
            >
              {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 glass-3d transition-all duration-300 focus:scale-[1.02]"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 glass-3d">{profile.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600 glass-3d">{user?.email || profile.email}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {editingProfile ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none glass-3d transition-all duration-300 focus:scale-[1.02]"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 glass-3d min-h-[80px]">{profile.bio}</div>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Language
                  </label>
                  {editingProfile ? (
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 glass-3d transition-all duration-300 focus:scale-[1.02]"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 glass-3d">{profile.language}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Format
                  </label>
                  {editingProfile ? (
                    <select
                      value={formData.dateFormat}
                      onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value as '12h' | '24h' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 glass-3d transition-all duration-300 focus:scale-[1.02]"
                    >
                      <option value="12h">12 Hour</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 glass-3d">{profile.dateFormat === '12h' ? '12 Hour' : '24 Hour'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Week Start
                  </label>
                  {editingProfile ? (
                    <select
                      value={formData.weekStart}
                      onChange={(e) => setFormData({ ...formData, weekStart: e.target.value as 'sunday' | 'monday' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 glass-3d transition-all duration-300 focus:scale-[1.02]"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 glass-3d capitalize">{profile.weekStart}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </label>
                  {editingProfile ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.notifications}
                        onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-300 transition-all duration-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Enable notifications</span>
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 glass-3d">{profile.notifications ? 'Enabled' : 'Disabled'}</div>
                  )}
                </div>
              </div>
            </div>

            {editingProfile && (
              <div className="flex gap-3 pt-4 animate-slide-in-right">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm font-medium hover:scale-[1.02] glass-3d"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium hover:scale-[1.02]"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="glass-3d rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
            <button
              onClick={onSignOut}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
