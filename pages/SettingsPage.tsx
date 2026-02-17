import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Link } from 'react-router-dom';
import { useNotification } from '../components/ui/NotificationContext';

interface SettingsPageProps {
  user: User;
}

type SettingsTab = 'security' | 'profile' | 'notifications';

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('security');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotification();
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: '+1 (555) 000-0000',
    bio: 'Premium automotive enthusiast.',
    avatarUrl: ''
  });

  // Notifications State
  const [notifs, setNotifs] = useState({
    inventoryAlerts: true,
    tradeUpdates: true,
    securityLogs: true,
    marketing: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addNotification({
        source: 'Security',
        title: 'Validation Error',
        description: 'New passwords do not match. Please verify your entry.',
        type: 'warning',
        icon: <i className="fa-solid fa-triangle-exclamation"></i>
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addNotification({
        source: 'Security',
        title: 'Credentials Updated',
        description: 'Your account password has been successfully changed.',
        type: 'success',
        icon: <i className="fa-solid fa-shield-check"></i>
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addNotification({
        source: 'Profile',
        title: 'Information Saved',
        description: `Profile for ${profileData.firstName} has been updated across the system.`,
        type: 'success',
        icon: <i className="fa-solid fa-user-check"></i>
      });
    }, 1200);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileData(prev => ({ ...prev, avatarUrl: base64 }));
      addNotification({
        source: 'Media',
        title: 'Photo Uploaded',
        description: 'Profile picture has been staged. Click save to commit changes.',
        type: 'info',
        icon: <i className="fa-solid fa-image"></i>
      });
    };
    reader.readAsDataURL(file);
  };

  const handleToggleNotif = (key: keyof typeof notifs) => {
    const newValue = !notifs[key];
    setNotifs(prev => ({ ...prev, [key]: newValue }));
    // Fix: Wrap key in String() to prevent potential symbol-to-string implicit conversion error in template literal
    addNotification({
      source: 'Settings',
      title: 'Rule Changed',
      description: `Notification preference for ${String(key)} set to ${newValue ? 'Enabled' : 'Disabled'}.`,
      type: 'info',
      icon: <i className="fa-solid fa-bell"></i>
    });
  };

  const renderSecurity = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="relative z-10 space-y-8">
          <div className="space-y-2 border-b border-slate-50 pb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Security Credentials</h2>
            <p className="text-sm text-slate-500">Manage your access and protect your account.</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
              <input 
                type="password" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-key"></i>}
                Update Credentials
              </button>
            </div>
          </form>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <i className="fa-solid fa-shield-halved text-[15rem]"></i>
        </div>
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 border-dashed flex flex-col items-center text-center space-y-4">
         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 text-2xl shadow-sm">
           <i className="fa-solid fa-mobile-screen"></i>
         </div>
         <div className="space-y-1">
           <h3 className="text-lg font-bold text-slate-800">Two-Factor Authentication</h3>
           <p className="text-xs text-slate-500 leading-relaxed max-w-xs">Add an extra layer of security to your account by requiring a verification code from your mobile device.</p>
         </div>
         <button disabled className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-50 cursor-not-allowed">Setup (Coming Soon)</button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-50 pb-8">
            <div className="relative group/avatar">
              <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-4xl overflow-hidden border-4 border-white shadow-xl">
                 {profileData.avatarUrl ? (
                   <img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   <i className="fa-solid fa-user"></i>
                 )}
              </div>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-900 transition-colors border-2 border-white active:scale-90"
              >
                <i className="fa-solid fa-camera text-xs"></i>
              </button>
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
            </div>
            <div className="text-center md:text-left space-y-1">
               <h2 className="text-3xl font-serif font-bold text-slate-900">{profileData.firstName} {profileData.lastName}</h2>
               <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Verified Member</p>
               <p className="text-sm text-slate-500">Member since February 2024</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                value={profileData.firstName}
                onChange={e => setProfileData({...profileData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                value={profileData.lastName}
                onChange={e => setProfileData({...profileData, lastName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                value={profileData.email}
                onChange={e => setProfileData({...profileData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                type="tel" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                value={profileData.phone}
                onChange={e => setProfileData({...profileData, phone: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio / Preferences</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all h-32"
                value={profileData.bio}
                onChange={e => setProfileData({...profileData, bio: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <i className="fa-solid fa-user-gear text-[15rem]"></i>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="relative z-10 space-y-8">
          <div className="space-y-2 border-b border-slate-50 pb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Notification Rules</h2>
            <p className="text-sm text-slate-500">Configure how and when you receive updates from OldRoad Auto.</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'inventoryAlerts', icon: 'fa-car-side', label: 'Inventory New Arrivals', desc: 'Alert me when vehicles matching my saved searches arrive.', color: 'text-blue-500' },
              { id: 'tradeUpdates', icon: 'fa-tags', label: 'Trade-in Status Updates', desc: 'Receive instant alerts on appraisal offers and status changes.', color: 'text-emerald-500' },
              { id: 'securityLogs', icon: 'fa-shield-halved', label: 'Security & Access Alerts', desc: 'Notify me of new logins or security changes to my account.', color: 'text-amber-500' },
              { id: 'marketing', icon: 'fa-bullhorn', label: 'Exclusive Offers & News', desc: 'Periodic updates on private sales and dealership events.', color: 'text-purple-500' }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group/item">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-slate-50 group-hover/item:scale-110 transition-transform ${item.color}`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.label}</h4>
                    <p className="text-xs text-slate-500 max-w-xs">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleNotif(item.id as keyof typeof notifs)}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${notifs[item.id as keyof typeof notifs] ? 'bg-red-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${notifs[item.id as keyof typeof notifs] ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
             <div className="flex-1 p-6 bg-slate-900 rounded-[2rem] text-white space-y-3 relative overflow-hidden group/card">
                <h4 className="text-sm font-bold uppercase tracking-widest relative z-10">Email Preference</h4>
                <p className="text-xs text-slate-400 relative z-10">Active: primary_email@oldroad.auto</p>
                <i className="fa-solid fa-envelope absolute -right-4 -bottom-4 text-6xl text-white/5 -rotate-12 group-hover/card:rotate-0 transition-transform"></i>
             </div>
             <div className="flex-1 p-6 bg-white border border-slate-100 rounded-[2rem] text-slate-900 space-y-3 relative overflow-hidden group/card shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-widest relative z-10 text-slate-400">SMS Alerts</h4>
                <p className="text-xs text-blue-600 font-bold relative z-10">Setup Mobile Link</p>
                <i className="fa-solid fa-mobile-screen absolute -right-4 -bottom-4 text-6xl text-slate-50 -rotate-12 group-hover/card:rotate-0 transition-transform"></i>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
           <i className="fa-solid fa-bell text-[15rem]"></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-6 mb-12">
        <Link 
          to="/dashboard" 
          className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-90"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-4xl font-serif font-black text-slate-900 uppercase tracking-tighter leading-none">Account <span className="text-red-600">Settings</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('security'); }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-red-600 text-white shadow-xl shadow-red-500/10' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-shield-halved"></i> Security & Access
          </button>
          <button 
            onClick={() => { setActiveTab('profile'); }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-xl shadow-red-500/10' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-user-gear"></i> Profile Information
          </button>
          <button 
            onClick={() => { setActiveTab('notifications'); }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-red-600 text-white shadow-xl shadow-red-500/10' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-bell"></i> Notification Rules
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'notifications' && renderNotifications()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;