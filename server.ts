import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

interface Post {
  id: string;
  username: string;
  type: 'photo' | 'video' | 'voice' | 'text';
  content?: string;
  mediaUrl?: string;
  voiceUrl?: string;
  sticker?: string;
  filter?: string;
  timestamp: string;
  likes: string[];
  comments: Comment[];
}

// Ensure database and upload folders exist
function initDB() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialPosts: Post[] = [
      {
        id: 'post_1',
        username: 'Sinan',
        type: 'photo',
        content: 'Assalamu Alaikum friends! Welcome to Hidayakkar, our private space for the brothers. Wear your finest sunglasses and join the vibes! 😎🐫✨',
        mediaUrl: 'https://images.unsplash.com/photo-1547989453-11e67ffb3885?auto=format&fit=crop&q=80&w=1200',
        filter: 'sepia contrast-125 saturate-150 brightness-110 hue-rotate-15', // Arabian Gold
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        likes: ['Muhammed', 'Faris'],
        comments: [
          {
            id: 'c_1',
            username: 'Muhammed',
            text: 'Wa Alaikum Assalam! The logo is pure class, love the Arab cooling glass man! 🕶️🔥',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString()
          },
          {
            id: 'c_2',
            username: 'Faris',
            text: 'MashaAllah, super clean design and total privacy. Best website ever!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
          }
        ]
      },
      {
        id: 'post_2',
        username: 'Muhammed',
        type: 'photo',
        content: 'Traditional Gahwa on a fine evening. The aroma of cardamom is perfection. ☕️🌴',
        mediaUrl: 'https://images.unsplash.com/photo-1600002415506-dd0609260c18?auto=format&fit=crop&q=80&w=1200',
        filter: '',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        likes: ['Sinan', 'Hassan'],
        comments: [
          {
            id: 'c_3',
            username: 'Hassan',
            text: 'Save a cup for me! I am coming over right now. 🤝',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7.5).toISOString()
          }
        ]
      },
      {
        id: 'post_3',
        username: 'Hassan',
        type: 'text',
        content: 'Just standard procedure for close friends: Always wear your cool sunglasses indoors. It is an attitude, not a choice. 😎🔥💯',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        likes: ['Sinan', 'Muhammed', 'Aisha', 'Faris'],
        comments: []
      }
    ];

    fs.writeFileSync(DB_PATH, JSON.stringify({ posts: initialPosts }, null, 2));
  }
}

initDB();

// Helper to read and write database
function readDB(): { posts: Post[]; removedUsers: string[] } {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      posts: parsed.posts || [],
      removedUsers: parsed.removedUsers || []
    };
  } catch (error) {
    console.error('Error reading database, resetting...', error);
    return { posts: [], removedUsers: [] };
  }
}

function writeDB(data: { posts: Post[]; removedUsers: string[] }) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Base64 save helper
function saveBase64File(base64Data: string, prefix: string): string {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 format');
  }
  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  
  let ext = 'bin';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
  else if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('webp')) ext = 'webp';
  else if (mimeType.includes('gif')) ext = 'gif';
  else if (mimeType.includes('mp4')) ext = 'mp4';
  else if (mimeType.includes('quicktime')) ext = 'mov';
  else if (mimeType.includes('webm')) ext = 'webm';
  else if (mimeType.includes('ogg')) ext = 'ogg';
  else if (mimeType.includes('mp3')) ext = 'mp3';
  else if (mimeType.includes('wav')) ext = 'wav';
  else if (mimeType.includes('m4a') || mimeType.includes('audio/x-m4a') || mimeType.includes('audio/mp4')) ext = 'm4a';

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function startServer() {
  const app = express();

  // Increase payload limit to support base64 uploads
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ limit: '60mb', extended: true }));

  // Static files for uploaded photos/videos/voice notes
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- API Routes ---

  // Secure Password Authentication Gate
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Normalise and check password
    if (password !== 'hidaya 10') {
      return res.status(401).json({ error: 'Wrong password code! Keep it private.' });
    }

    const cleanUsername = username.trim();

    // Check if user is removed
    const db = readDB();
    if (db.removedUsers && db.removedUsers.includes(cleanUsername)) {
      return res.status(403).json({ error: 'This user account has been removed/deactivated by the administrator.' });
    }

    // Return mock token and username
    const token = Buffer.from(`${cleanUsername}:hidaya 10`).toString('base64');
    
    return res.json({
      success: true,
      token,
      username: cleanUsername,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}` // fallback avatar if not matched
    });
  });

  // Authentication Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Please login first.' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username, password] = decoded.split(':');
      if (password === 'hidaya 10' && username) {
        // Check if user is removed
        const db = readDB();
        if (db.removedUsers && db.removedUsers.includes(username)) {
          return res.status(403).json({ error: 'Your account has been deactivated.' });
        }
        req.headers['x-auth-user'] = username;
        return next();
      }
    } catch (e) {
      // invalid token format
    }
    
    return res.status(401).json({ error: 'Session invalid or expired.' });
  };

  // Get all posts
  app.get('/api/posts', requireAuth, (req, res) => {
    const db = readDB();
    // Return posts sorted by timestamp desc
    const sorted = [...db.posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(sorted);
  });

  // Create a new post (handles base64 text, photo, video, and voice notes)
  app.post('/api/posts', requireAuth, (req, res) => {
    const username = req.headers['x-auth-user'] as string;
    const { type, content, mediaBase64, voiceBase64, sticker, filter } = req.body;

    if (!type || !['photo', 'video', 'voice', 'text'].includes(type)) {
      return res.status(400).json({ error: 'Invalid post type' });
    }

    let mediaUrl = undefined;
    let voiceUrl = undefined;

    try {
      if (type === 'photo' && mediaBase64) {
        mediaUrl = saveBase64File(mediaBase64, 'photo');
      } else if (type === 'video' && mediaBase64) {
        mediaUrl = saveBase64File(mediaBase64, 'video');
      } else if (type === 'voice' && voiceBase64) {
        voiceUrl = saveBase64File(voiceBase64, 'voice');
      }
    } catch (err: any) {
      console.error('File saving failed:', err);
      return res.status(500).json({ error: 'Failed to process media attachment: ' + err.message });
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username,
      type,
      content,
      mediaUrl,
      voiceUrl,
      sticker,
      filter: filter || '',
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    };

    const db = readDB();
    db.posts.push(newPost);
    writeDB(db);

    res.status(201).json(newPost);
  });

  // Toggle Like Post
  app.post('/api/posts/:id/like', requireAuth, (req, res) => {
    const username = req.headers['x-auth-user'] as string;
    const { id } = req.params;

    const db = readDB();
    const postIndex = db.posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = db.posts[postIndex];
    const likedIndex = post.likes.indexOf(username);
    if (likedIndex === -1) {
      post.likes.push(username); // Like
    } else {
      post.likes.splice(likedIndex, 1); // Unlike
    }

    writeDB(db);
    res.json({ likes: post.likes });
  });

  // Add Comment
  app.post('/api/posts/:id/comments', requireAuth, (req, res) => {
    const username = req.headers['x-auth-user'] as string;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const db = readDB();
    const postIndex = db.posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment: Comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      username,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    db.posts[postIndex].comments.push(newComment);
    writeDB(db);

    res.status(201).json(newComment);
  });

  // --- Admin API Routes ---

  // Admin authentication middleware
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Admin session required.' });
    }
    const token = authHeader.split(' ')[1];
    const expectedToken = Buffer.from('admin:admin 123').toString('base64');
    if (token === expectedToken) {
      return next();
    }
    return res.status(401).json({ error: 'Invalid admin credentials or session.' });
  };

  // Admin Login
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin 123') {
      const adminToken = Buffer.from('admin:admin 123').toString('base64');
      return res.json({ success: true, token: adminToken });
    }
    return res.status(401).json({ error: 'Incorrect admin password code!' });
  });

  // Admin list all users
  app.get('/api/admin/users', requireAdminAuth, (req, res) => {
    const db = readDB();
    const presetUsernames = ['Sinan', 'Muhammed', 'Faris', 'Hassan', 'Aisha'];
    const postUsernames = db.posts.map(p => p.username);
    const commentUsernames = db.posts.flatMap(p => p.comments.map(c => c.username));
    
    // Combine all usernames
    const allUsernames = Array.from(new Set([...presetUsernames, ...postUsernames, ...commentUsernames]));
    
    const usersList = allUsernames.map(username => {
      const isRemoved = db.removedUsers && db.removedUsers.includes(username);
      return {
        username,
        status: isRemoved ? 'removed' : 'active'
      };
    });
    
    res.json(usersList);
  });

  // Admin remove user
  app.post('/api/admin/users/remove', requireAdminAuth, (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const cleanUsername = username.trim();
    const db = readDB();
    if (!db.removedUsers) {
      db.removedUsers = [];
    }
    if (!db.removedUsers.includes(cleanUsername)) {
      db.removedUsers.push(cleanUsername);
    }
    writeDB(db);
    res.json({ success: true, message: `User ${cleanUsername} removed successfully.`, removedUsers: db.removedUsers });
  });

  // Admin restore user
  app.post('/api/admin/users/restore', requireAdminAuth, (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const cleanUsername = username.trim();
    const db = readDB();
    if (db.removedUsers) {
      db.removedUsers = db.removedUsers.filter(u => u !== cleanUsername);
    }
    writeDB(db);
    res.json({ success: true, message: `User ${cleanUsername} restored successfully.`, removedUsers: db.removedUsers || [] });
  });

  // Admin remove post
  app.delete('/api/admin/posts/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const initialCount = db.posts.length;
    db.posts = db.posts.filter(p => p.id !== id);
    if (db.posts.length === initialCount) {
      return res.status(404).json({ error: 'Post not found' });
    }
    writeDB(db);
    res.json({ success: true, message: 'Post deleted successfully.' });
  });

  // --- Vite & Production SPA Serving ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start fullstack server:', err);
});
