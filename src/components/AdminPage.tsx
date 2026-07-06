import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  UserMinus, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  MessageCircle, 
  Heart, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  RefreshCw 
} from 'lucide-react';
import { Post } from '../types';

interface AdminUser {
  username: string;
  status: 'active' | 'removed';
}

interface AdminPageProps {
  adminToken: string | null;
  users: AdminUser[];
  posts: Post[];
  isLoadingUsers: boolean;
  onClose: () => void;
  onRemoveUser: (username: string) => Promise<void>;
  onRestoreUser: (username: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  users,
  posts,
  isLoadingUsers,
  onClose,
  onRemoveUser,
  onRestoreUser,
  onDeletePost
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredPosts = posts.filter(post => 
    post.username.toLowerCase().includes(postSearch.toLowerCase()) ||
    (post.content && post.content.toLowerCase().includes(postSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-gray-100 flex flex-col z-50">
      {/* Top Banner / Header */}
      <header className="border-b border-[#222] bg-[#0F0F0F] px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center border border-white/20">
            <ShieldAlert className="w-5.5 h-5.5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-serif italic text-white tracking-wide">Hidayakkar Admin Panel</h1>
            <p className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-mono mt-0.5">Central Management Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-red-950/30 hover:bg-red-950 text-red-300 border border-red-900/30 text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" /> Exit Admin
          </button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">
        
        {/* Left Column: User Directory Control (5 cols) */}
        <section className="lg:col-span-5 bg-[#0F0F0F] border border-[#222] rounded-3xl p-6 flex flex-col h-[75vh]">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider font-mono">User Directory</h2>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-mono text-gray-400">
                {users.length} Total
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search usernames..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#111] focus:bg-[#1A1A1A] border border-[#222] focus:border-[#D4AF37]/40 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* User List scroll container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isLoadingUsers ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#D4AF37] animate-spin" />
                <span className="text-[10px] text-gray-500 font-mono">Synchronizing directory...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div 
                  key={user.username} 
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    user.status === 'removed' 
                      ? 'bg-red-950/10 border-red-950/30 opacity-80' 
                      : 'bg-[#151515] border-[#222]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-[#222] text-gray-300 font-bold flex items-center justify-center text-sm border border-white/5">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white">@{user.username}</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'removed' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-[9px] uppercase tracking-wider font-mono opacity-50">
                          {user.status === 'removed' ? 'Banned / Removed' : 'Active Member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {user.status === 'removed' ? (
                      <button
                        onClick={() => onRestoreUser(user.username)}
                        className="px-3 py-1.5 bg-green-950/20 hover:bg-green-900 text-green-300 border border-green-800/30 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => onRemoveUser(user.username)}
                        className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950 text-red-400 border border-red-900/20 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <p className="text-xs text-gray-500 font-light italic">No matching users found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Central Feed Moderation (7 cols) */}
        <section className="lg:col-span-7 bg-[#0F0F0F] border border-[#222] rounded-3xl p-6 flex flex-col h-[75vh]">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider font-mono">Central Feed Moderation</h2>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-mono text-gray-400">
                {posts.length} Active Posts
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search posts by author or keyword..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="w-full bg-[#111] focus:bg-[#1A1A1A] border border-[#222] focus:border-[#D4AF37]/40 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 transition-colors"
              />
            </div>
          </div>

          {/* Posts List scroll container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => {
                const getPostIcon = () => {
                  if (post.type === 'photo') return <ImageIcon className="w-3.5 h-3.5" />;
                  if (post.type === 'video') return <VideoIcon className="w-3.5 h-3.5" />;
                  if (post.type === 'voice') return <Mic className="w-3.5 h-3.5" />;
                  return <FileText className="w-3.5 h-3.5" />;
                };

                return (
                  <div key={post.id} className="p-4 bg-[#151515] border border-[#222] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#333]">
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      {/* Media Thumbnail or Type Icon */}
                      <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                        {post.mediaUrl ? (
                          <img 
                            src={post.mediaUrl} 
                            alt="thumbnail" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-[#D4AF37]">{getPostIcon()}</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">@{post.username}</span>
                          <span className="text-[8.5px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center gap-1">
                            {getPostIcon()} {post.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-light line-clamp-2 mt-1 italic">
                          {post.content ? `"${post.content}"` : 'No caption text'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-[10px] text-gray-500 font-mono">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#D4AF37]" /> {post.likes.length}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments.length}</span>
                          <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:justify-end">
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="px-3 py-2 bg-red-950/20 hover:bg-red-950 text-red-400 border border-red-900/20 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Delete Post permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <p className="text-xs text-gray-500 font-light italic">No posts found.</p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};
