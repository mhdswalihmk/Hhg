import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  PlusCircle,
  LogOut,
  Sparkles,
  Users,
  Flame,
  Activity,
  Check,
  Compass,
  AlertCircle,
  TrendingUp,
  MessageSquareCode,
  X
} from 'lucide-react';
import { Logo } from './components/Logo';
import { StoryTray } from './components/StoryTray';
import { PostCard } from './components/PostCard';
import { CreatePostModal } from './components/CreatePostModal';
import { AdminPage } from './components/AdminPage';
import { Post, Comment, PRESET_USERS } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hidayakkar_token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('hidayakkar_user'));
  
  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Application States
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'media' | 'voice' | 'text'>('all');
  const [systemAlert, setSystemAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Admin Management States
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('hidayakkar_admin_token'));
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminPasswordPromptOpen, setIsAdminPasswordPromptOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<{ username: string, status: 'active' | 'removed' }[]>([]);
  const [isAdminLoadingUsers, setIsAdminLoadingUsers] = useState(false);

  // Auto-clear system alerts
  useEffect(() => {
    if (systemAlert) {
      const t = setTimeout(() => setSystemAlert(null), 4000);
      return () => clearTimeout(t);
    }
  }, [systemAlert]);

  // Load Posts from Server
  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        const errData = await res.json();
        if (res.status === 401) {
          handleLogout();
        }
        throw new Error(errData.error || 'Failed to fetch posts');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [token]);

  // Fetch posts when authenticated
  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token, fetchPosts]);

  // Admin Methods
  const fetchAdminUsers = useCallback(async (tokenToUse?: string) => {
    const activeToken = tokenToUse || adminToken;
    if (!activeToken) return;
    setIsAdminLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdminLoadingUsers(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken && isAdminOpen) {
      fetchAdminUsers();
    }
  }, [adminToken, isAdminOpen, fetchAdminUsers]);

  const handleLogoDoubleClick = () => {
    setIsAdminPasswordPromptOpen(true);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('hidayakkar_admin_token', data.token);
        setAdminToken(data.token);
        setIsAdminPasswordPromptOpen(false);
        setIsAdminOpen(true);
        setAdminPasswordInput('');
        setSystemAlert({ type: 'success', message: 'Admin control room unlocked successfully!' });
        fetchAdminUsers(data.token);
      } else {
        setAdminPasswordError(data.error || 'Invalid admin password');
      }
    } catch (err) {
      setAdminPasswordError('Failed to connect to authentication gateway.');
    }
  };

  const handleRemoveUser = async (userToBlock: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/users/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ username: userToBlock })
      });
      if (res.ok) {
        setSystemAlert({ type: 'success', message: `Successfully deactivated user @${userToBlock}` });
        fetchAdminUsers();
        fetchPosts();
      } else {
        const data = await res.json();
        setSystemAlert({ type: 'error', message: data.error || 'Failed to deactivate user' });
      }
    } catch (e) {
      setSystemAlert({ type: 'error', message: 'Deactivation gateway error' });
    }
  };

  const handleRestoreUser = async (userToRestore: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/users/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ username: userToRestore })
      });
      if (res.ok) {
        setSystemAlert({ type: 'success', message: `Successfully reactivated user @${userToRestore}` });
        fetchAdminUsers();
        fetchPosts();
      } else {
        const data = await res.json();
        setSystemAlert({ type: 'error', message: data.error || 'Failed to reactivate user' });
      }
    } catch (e) {
      setSystemAlert({ type: 'error', message: 'Reactivation gateway error' });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        setSystemAlert({ type: 'success', message: 'Post successfully deleted from central registry.' });
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        const data = await res.json();
        setSystemAlert({ type: 'error', message: data.error || 'Failed to delete post' });
      }
    } catch (e) {
      setSystemAlert({ type: 'error', message: 'Post deletion gateway error' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!loginUsername.trim()) {
      setLoginError('Please select or write a username!');
      return;
    }
    if (loginPassword !== 'hidaya 10') {
      setLoginError('Incorrect secret password! This network is invite-only.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('hidayakkar_token', data.token);
        localStorage.setItem('hidayakkar_user', data.username);
        setToken(data.token);
        setUsername(data.username);
        setSystemAlert({ type: 'success', message: `Ahlan wa Sahlan, ${data.username}! Welcome to Hidayakkar.` });
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Could not reach server. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hidayakkar_token');
    localStorage.removeItem('hidayakkar_user');
    setToken(null);
    setUsername(null);
    setPosts([]);
  };

  // Like Toggle
  const handleLike = async (postId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (e) {
      console.error("Failed to like post", e);
    }
  };

  // Submit Comment
  const handleComment = async (postId: string, text: string): Promise<Comment> => {
    if (!token) throw new Error("Not logged in");
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const newComment = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
      return newComment;
    } else {
      const err = await res.json();
      throw new Error(err.error || "Failed to post comment");
    }
  };

  // Create Post
  const handleCreatePost = async (postData: {
    type: 'photo' | 'video' | 'voice' | 'text';
    content: string;
    mediaBase64?: string;
    voiceBase64?: string;
    sticker?: string;
    filter?: string;
  }) => {
    if (!token) return;
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    if (res.ok) {
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      setSystemAlert({ type: 'success', message: 'Your post was successfully shared with close friends!' });
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to publish post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (feedFilter === 'all') return true;
    return post.type === feedFilter;
  });

  return (
    <div className="min-h-screen bg-brand-charcoal text-gray-100 flex flex-col lg:flex-row selection:bg-brand-gold selection:text-brand-charcoal relative">
      
      {/* Dynamic Header System Alerts */}
      {systemAlert && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-2 border shadow-xl text-sm transition-all duration-300 ${
          systemAlert.type === 'success' 
            ? 'bg-brand-slate text-[#D4AF37] border-[#D4AF37]/30' 
            : 'bg-red-950/90 text-red-200 border-red-500/30'
        }`}>
          {systemAlert.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="font-semibold">{systemAlert.message}</span>
        </div>
      )}

      {isAdminOpen ? (
        <AdminPage 
          adminToken={adminToken}
          users={adminUsers}
          posts={posts}
          isLoadingUsers={isAdminLoadingUsers}
          onClose={() => setIsAdminOpen(false)}
          onRemoveUser={handleRemoveUser}
          onRestoreUser={handleRestoreUser}
          onDeletePost={handleDeletePost}
        />
      ) : token && username ? (
        <>
          {/* Left Sidebar: Brand & Navigation (Visible on lg and above) */}
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#222] flex flex-col justify-between p-6 lg:p-10 bg-[#0F0F0F] lg:h-screen lg:sticky lg:top-0">
            <div className="space-y-10 lg:space-y-12">
              {/* Brand Logo & Serif Title */}
              <div className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                  <Logo size="sm" onDoubleClick={handleLogoDoubleClick} />
                </div>
                <div>
                  <h1 className="text-2xl font-serif italic tracking-tight text-white leading-tight">Hidayakkar</h1>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-mono font-medium">Close Friends Circle</p>
                </div>
              </div>
              
              {/* Sidebar Navigation */}
              <nav className="space-y-4">
                <button 
                  onClick={() => setFeedFilter('all')}
                  className={`w-full flex items-center space-x-3 text-lg font-light transition-all pl-4 text-left border-l-2 focus:outline-none ${
                    feedFilter === 'all'
                      ? 'text-white border-[#D4AF37] opacity-100 font-normal'
                      : 'text-gray-300 border-transparent opacity-45 hover:opacity-100'
                  }`}
                >
                  <span>Feed</span>
                </button>
                <button 
                  onClick={() => setFeedFilter('photo')}
                  className={`w-full flex items-center space-x-3 text-lg font-light transition-all pl-4 text-left border-l-2 focus:outline-none ${
                    feedFilter === 'photo'
                      ? 'text-white border-[#D4AF37] opacity-100 font-normal'
                      : 'text-gray-300 border-transparent opacity-45 hover:opacity-100'
                  }`}
                >
                  <span>Discover</span>
                </button>
                <button 
                  onClick={() => setFeedFilter('voice')}
                  className={`w-full flex items-center space-x-3 text-lg font-light transition-all pl-4 text-left border-l-2 focus:outline-none ${
                    feedFilter === 'voice'
                      ? 'text-white border-[#D4AF37] opacity-100 font-normal'
                      : 'text-gray-300 border-transparent opacity-45 hover:opacity-100'
                  }`}
                >
                  <span>Messages</span>
                </button>
                <button 
                  onClick={() => setFeedFilter('text')}
                  className={`w-full flex items-center space-x-3 text-lg font-light transition-all pl-4 text-left border-l-2 focus:outline-none ${
                    feedFilter === 'text'
                      ? 'text-white border-[#D4AF37] opacity-100 font-normal'
                      : 'text-gray-300 border-transparent opacity-45 hover:opacity-100'
                  }`}
                >
                  <span>Vault</span>
                </button>
              </nav>
            </div>

            {/* Sidebar bottom keys */}
            <div className="space-y-6 mt-8 lg:mt-0">
              <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#333]">
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1 font-semibold">Access Key</p>
                <p className="font-mono text-xs opacity-60">hidaya 10</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-rose-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-black border-2 border-black overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">@{username}</p>
                  <p className="text-[10px] opacity-40 uppercase font-mono">Member Since 2026</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col bg-[#050505]">
            {/* Header section (Height 20 / h-20) */}
            <header className="h-20 px-6 lg:px-10 flex items-center justify-between border-b border-[#222] shrink-0">
              <div>
                <h2 className="text-xs uppercase tracking-[0.3em] font-medium opacity-60 text-white">Inner Circle / Private Feed</h2>
                <p className="text-[10px] text-[#D4AF37] tracking-wider uppercase font-mono mt-0.5">Confidential access point</p>
              </div>
              <div className="flex space-x-3 items-center">
                <button 
                  onClick={() => setIsCreateOpen(true)}
                  className="px-5 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#AA7C11] transition-all cursor-pointer shadow-md"
                >
                  + Share Media
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full border border-gray-800 hover:bg-[#1A1A1A] text-gray-400 hover:text-white transition-all lg:hidden"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Stories, Filters & Feed List */}
            <section className="flex-1 p-4 lg:p-10 space-y-8 overflow-y-auto max-w-4xl w-full mx-auto">
              {/* Close Friend Stories */}
              <div>
                <StoryTray />
              </div>

              {/* Feed Filters Tabs */}
              <div className="flex items-center justify-between bg-[#111] border border-[#222] p-1 rounded-2xl">
                {(['all', 'photo', 'video', 'voice', 'text'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFeedFilter(filter)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize transition-all focus:outline-none ${
                      feedFilter === filter
                        ? 'bg-[#1A1A1A] text-[#D4AF37] border border-[#333] shadow-inner'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter === 'all' ? 'All Vibes' : filter}
                  </button>
                ))}
              </div>

              {/* Active Posts Feed */}
              <div className="space-y-8 max-w-2xl mx-auto">
                {isLoadingPosts ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
                    <span className="text-xs text-gray-500 font-mono">Loading secure feed...</span>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUsername={username}
                      onLike={handleLike}
                      onComment={handleComment}
                    />
                  ))
                ) : (
                  <div className="bg-[#0F0F0F] border border-[#222] rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <p className="text-gray-400 text-sm font-light italic">No posts shared in this category yet.</p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold transition-all uppercase tracking-wider"
                    >
                      Be the first to share!
                    </button>
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* Right Sidebar: Contacts & Encryption info (Visible on xl and above) */}
          <aside className="w-64 border-l border-[#222] p-8 space-y-10 bg-[#0F0F0F] lg:h-screen lg:sticky lg:top-0 hidden xl:flex flex-col justify-between shrink-0">
            <div className="space-y-10">
              {/* Close Friends Header & List */}
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-6 font-semibold">Close Friends</h3>
                <ul className="space-y-6">
                  {PRESET_USERS.map((user) => (
                    <li key={user.username} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-sm font-light text-gray-300">@{user.username}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Encryption widgets */}
              <div className="pt-10 border-t border-[#222]">
                <h3 className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-4 font-semibold">Privacy Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] opacity-60">
                    <span>Encrypted</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-[#222] h-1 rounded-full overflow-hidden">
                    <div className="bg-[#D4AF37] h-full w-[100%]"></div>
                  </div>
                  <p className="text-[9px] italic opacity-45 mt-4 leading-relaxed">Hidayakkar uses end-to-end security for all shared media assets.</p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[#333] rounded-xl hover:border-red-900/30 hover:bg-red-950/10 hover:text-red-300 text-gray-400 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Gated App
              </button>
            </div>
          </aside>

          {/* New Post Dialog Modal */}
          {isCreateOpen && (
            <CreatePostModal
              onClose={() => setIsCreateOpen(false)}
              onSubmit={handleCreatePost}
            />
          )}
        </>
      ) : (
        
        // 2. UNAUTHENTICATED LOGIN SCREEN
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-gradient-to-b from-[#050505] to-black relative overflow-hidden">
          
          {/* Ambient sandy golden visual glows */}
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

          {/* Main Card */}
          <div className="w-full max-w-md bg-[#0F0F0F] border border-[#222] rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm">
            
            {/* Logo illustration */}
            <div className="flex justify-center mb-6">
              <Logo size="xl" onDoubleClick={handleLogoDoubleClick} />
            </div>

            {/* Heading text */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="font-serif italic text-3xl tracking-wide text-white">
                Hidayakkar
              </h1>
              <p className="text-xs text-gray-400 font-light max-w-xs mx-auto leading-relaxed italic">
                A private, Instagram-style space for close friends to share photos, videos, voice notes, and stickers.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {loginError && (
                <div className="flex items-start gap-2 bg-red-950/40 text-red-300 border border-red-500/20 p-3.5 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium leading-tight">{loginError}</span>
                </div>
              )}

              {/* Username selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Select or Enter Username
                </label>
                
                {/* Standard Input for custom usernames */}
                <input
                  type="text"
                  placeholder="Type your username..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-[#111] focus:bg-[#1A1A1A] border border-[#222] focus:border-[#D4AF37] focus:outline-none rounded-2xl px-4 py-3.5 text-sm text-white placeholder-gray-600 transition-colors shadow-inner"
                  required
                />

                {/* Preset quick links */}
                <div className="pt-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold block mb-1.5">Or choose a preset:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_USERS.map((user) => (
                      <button
                        key={user.username}
                        type="button"
                        onClick={() => setLoginUsername(user.username)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          loginUsername === user.username
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-[#111] text-gray-400 border-[#222] hover:text-white hover:bg-[#1A1A1A]'
                        }`}
                      >
                        {user.username}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Password Gating */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Privacy Gate Password
                  </label>
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#D4AF37]/80">
                    Invite-Only
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="Enter the close friends code..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#111] focus:bg-[#1A1A1A] border border-[#222] focus:border-[#D4AF37] focus:outline-none rounded-2xl px-4 py-3.5 text-sm text-white placeholder-gray-600 transition-colors shadow-inner font-mono tracking-widest"
                  required
                />
              </div>

              {/* Submit / Unlock */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#AA7C11] text-black font-bold text-xs uppercase tracking-widest transition-colors shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 mt-2"
                id="login-submit-btn"
              >
                <Lock className="w-3.5 h-3.5 fill-black" />
                {isLoggingIn ? 'Verifying Code...' : 'Unlock Hidayakkar'}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-[#222] pt-6">
              <span className="text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1">
                🔒 Gated Private Access Point
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Admin Password Prompt Modal */}
      {isAdminPasswordPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0F0F0F] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsAdminPasswordPromptOpen(false);
                setAdminPasswordError(null);
                setAdminPasswordInput('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/25">
                <Lock className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-serif italic text-white">Enter Admin Password</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">System Override Authentication</p>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              {adminPasswordError && (
                <div className="bg-red-950/40 text-red-300 border border-red-500/20 p-3 rounded-xl text-xs text-center">
                  {adminPasswordError}
                </div>
              )}
              <input
                type="password"
                placeholder="Enter password..."
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-[#111] focus:bg-[#1A1A1A] border border-[#222] focus:border-[#D4AF37] focus:outline-none rounded-2xl px-4 py-3 text-sm text-center text-white placeholder-gray-600 transition-colors tracking-widest"
                required
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#AA7C11] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-md"
              >
                Unlock Panel
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
