import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Bell, Palette, ChevronRight, Check, 
  Lock, Mail, Key, Trash2, Edit2, Save, X, AlertCircle,
  Download, Upload, Globe, Moon, Sun, Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { 
    user, 
    getUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    updateCurrentUser,
    changePassword,
    logout 
  } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    email: '' 
  });
  const [securityForm, setSecurityForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [userForm, setUserForm] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    password: '', 
    role: 'user' 
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    maintenance: false,
    lowStock: true,
    weeklyReport: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    compactMode: false
  });

  useEffect(() => {
    loadUsers();
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || `${user.id}@company.com`
      });
    }
  }, [user]);

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers || []);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (await updateCurrentUser(profileForm)) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    try {
      if (await changePassword(securityForm.currentPassword, securityForm.newPassword)) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (!userForm.id || !userForm.name || !userForm.password) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      setIsLoading(false);
      return;
    }

    try {
      if (await addUser(userForm)) {
        setMessage({ type: 'success', text: 'User added successfully!' });
        setIsAddUserOpen(false);
        setUserForm({ id: '', name: '', email: '', password: '', role: 'user' });
        loadUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'User ID already exists' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updates = { ...userForm };
      if (!updates.password) delete updates.password;

      if (await updateUser(editingUser.id, updates)) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setEditingUser(null);
        setUserForm({ id: '', name: '', email: '', password: '', role: 'user' });
        loadUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsLoading(true);
    try {
      if (await deleteUser(deleteConfirmUser.id)) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setDeleteConfirmUser(null);
        loadUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUserForm({ 
      ...user, 
      password: '',
      email: user.email || `${user.id}@company.com`
    });
  };

  const exportData = () => {
    // Implement data export functionality
    const data = {
      users: users,
      settings: {
        notifications,
        appearance,
        user: profileForm
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SettingsSection = ({ title, icon: Icon, children, id }) => (
    <div 
      id={id}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-light-blue-100 to-light-blue-50 flex items-center justify-center">
          <Icon size={24} className="text-light-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">Manage your {title.toLowerCase()} settings</p>
        </div>
        <button
          onClick={() => setActiveSection(id)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className={activeSection === id ? 'rotate-90' : ''} />
        </button>
      </div>
      {activeSection === id && (
        <div className="p-6 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );

  const NotificationToggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className="font-medium text-slate-900 text-sm">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-light-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-light-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 h-full overflow-y-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Download size={16} />
            Export Data
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Lock size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message.text && (
        <div className={`rounded-xl p-4 flex items-center gap-3 animate-fadeIn ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-100' 
            : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? (
            <Check size={20} className="text-green-600" />
          ) : (
            <AlertCircle size={20} className="text-red-600" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  <Shield size={14} />
                  {user?.role?.toUpperCase()}
                </span>
                <span className="text-white/80 text-sm">{user?.id}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-white/80 text-sm">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-white/80 text-sm">Admins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-white/80 text-sm">Last Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Navigation */}
        <div className="lg:col-span-1 space-y-4">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'users', label: 'User Management', icon: User, adminOnly: true },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'data', label: 'Data & Backup', icon: Download },
          ]
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-light-blue-50 to-indigo-50 border border-light-blue-200 text-light-blue-700 shadow-sm'
                    : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeSection === item.id 
                    ? 'bg-light-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <item.icon size={20} />
                </div>
                <span className="font-medium text-left flex-1">{item.label}</span>
                <ChevronRight 
                  size={16} 
                  className={activeSection === item.id ? 'text-light-blue-500' : 'text-slate-400'} 
                />
              </button>
            ))}
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <SettingsSection title="Profile" icon={User} id="profile">
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">User ID</label>
                    <input
                      type="text"
                      value={user?.id}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-light-blue-600 to-cyan-600 hover:from-light-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg shadow-light-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? 'Saving...' : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </SettingsSection>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <SettingsSection title="Security" icon={Shield} id="security">
              <form onSubmit={handleSecuritySave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Key size={16} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent"
                      placeholder="Create new password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-amber-800 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span className="font-medium">Password Requirements:</span>
                  </p>
                  <ul className="text-amber-700 text-xs mt-2 space-y-1">
                    <li>• Minimum 8 characters</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one number</li>
                    <li>• At least one special character</li>
                  </ul>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-200 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? 'Updating...' : (
                      <>
                        <Lock size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </SettingsSection>
          )}

          {/* User Management (Admin Only) */}
          {activeSection === 'users' && user?.role === 'admin' && (
            <SettingsSection title="User Management" icon={User} id="users">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">System Users</h4>
                    <p className="text-slate-500 text-sm">Manage user access and permissions</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddUserOpen(true);
                      setUserForm({ id: '', name: '', email: '', password: '', role: 'user' });
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center gap-2"
                  >
                    <User size={16} />
                    Add User
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">User</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-light-blue-100 to-cyan-100 flex items-center justify-center text-light-blue-700 font-medium text-sm">
                                  {u.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{u.name}</p>
                                  <p className="text-slate-500 text-xs">{u.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${
                                  u.id === user.id ? 'bg-green-500' : 'bg-slate-300'
                                }`}></div>
                                <span className="text-slate-600 text-xs">
                                  {u.id === user.id ? 'Current' : 'Active'}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit2 size={16} />
                                </button>
                                {u.id !== user.id && (
                                  <button
                                    onClick={() => setDeleteConfirmUser(u)}
                                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SettingsSection>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <SettingsSection title="Notifications" icon={Bell} id="notifications">
              <div className="space-y-1">
                <NotificationToggle
                  label="Email Notifications"
                  description="Receive updates via email"
                  checked={notifications.email}
                  onChange={() => setNotifications({...notifications, email: !notifications.email})}
                />
                <NotificationToggle
                  label="Push Notifications"
                  description="Get instant browser alerts"
                  checked={notifications.push}
                  onChange={() => setNotifications({...notifications, push: !notifications.push})}
                />
                <NotificationToggle
                  label="Maintenance Alerts"
                  description="Service and repair reminders"
                  checked={notifications.maintenance}
                  onChange={() => setNotifications({...notifications, maintenance: !notifications.maintenance})}
                />
                <NotificationToggle
                  label="Low Stock Alerts"
                  description="Get notified when inventory is low"
                  checked={notifications.lowStock}
                  onChange={() => setNotifications({...notifications, lowStock: !notifications.lowStock})}
                />
                <NotificationToggle
                  label="Weekly Reports"
                  description="Receive weekly summary emails"
                  checked={notifications.weeklyReport}
                  onChange={() => setNotifications({...notifications, weeklyReport: !notifications.weeklyReport})}
                />
              </div>
              <div className="pt-6 border-t border-slate-100">
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-200 transition-all">
                  Save Notification Settings
                </button>
              </div>
            </SettingsSection>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <SettingsSection title="Appearance" icon={Palette} id="appearance">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAppearance({...appearance, theme: 'light'})}
                      className={`flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                        appearance.theme === 'light'
                          ? 'border-light-blue-500 bg-light-blue-50 text-light-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Sun size={20} />
                      <span className="font-medium">Light</span>
                      {appearance.theme === 'light' && <Check size={20} className="text-light-blue-600" />}
                    </button>
                    <button
                      onClick={() => setAppearance({...appearance, theme: 'dark'})}
                      className={`flex items-center justify-center gap-3 px-4 py-4 rounded-xl border-2 transition-all ${
                        appearance.theme === 'dark'
                          ? 'border-slate-800 bg-slate-900 text-white'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Moon size={20} />
                      <span className="font-medium">Dark</span>
                      {appearance.theme === 'dark' && <Check size={20} className="text-white" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Language</label>
                  <select
                    value={appearance.language}
                    onChange={(e) => setAppearance({...appearance, language: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-light-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Compact Mode</p>
                    <p className="text-slate-500 text-sm">Reduce spacing for more content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearance.compactMode}
                      onChange={() => setAppearance({...appearance, compactMode: !appearance.compactMode})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-light-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-light-blue-600"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>
          )}

          {/* Data & Backup */}
          {activeSection === 'data' && (
            <SettingsSection title="Data & Backup" icon={Download} id="data">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Backup & Restore</h4>
                      <p className="text-slate-600 text-sm mt-1">Export your data or restore from backup</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={exportData}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Download size={16} />
                        Export Data
                      </button>
                      <button className="px-4 py-2.5 bg-light-blue-600 text-white rounded-xl hover:bg-light-blue-700 transition-colors flex items-center gap-2 font-medium">
                        <Upload size={16} />
                        Import Data
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Data Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-slate-200 rounded-xl hover:border-red-200 hover:bg-red-50 transition-colors text-left">
                      <p className="font-medium text-red-600">Clear Cache</p>
                      <p className="text-slate-500 text-sm mt-1">Remove temporary files</p>
                    </button>
                    <button className="p-4 border border-slate-200 rounded-xl hover:border-amber-200 hover:bg-amber-50 transition-colors text-left">
                      <p className="font-medium text-amber-600">Reset Preferences</p>
                      <p className="text-slate-500 text-sm mt-1">Restore default settings</p>
                    </button>
                  </div>
                </div>
              </div>
            </SettingsSection>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">User ID *</label>
                <input
                  type="text"
                  value={userForm.id}
                  onChange={(e) => setUserForm({ ...userForm, id: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., john.doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">User ID</label>
                <input
                  type="text"
                  value={userForm.id}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h2>
              <p className="text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteConfirmUser.name}</span>?
              </p>
              <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;