import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple user context - in production, use proper auth
function getUser(req: VercelRequest) {
  // For now, use a simple header-based auth
  // In production, integrate with Vercel Auth or Supabase Auth
  const userId = req.headers['x-user-id'] as string;
  const userName = req.headers['x-user-name'] as string;
  
  if (!userId) {
    return null;
  }
  
  return {
    user_id: userId,
    name: userName || 'User',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { method, query, body } = req;
    const path = '/' + (Array.isArray(query.path) ? query.path.join('/') : (query.path as string) || '');
    
    // Debug: log the received path and query
    console.log('Received request:', { method, path, query, url: req.url });
    
    const user = getUser(req);

    // Get user profile to check role
    let userProfile = null;
    let isAdmin = false;
    
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', user.user_id)
        .maybeSingle();
      
      userProfile = data;
      isAdmin = data?.role === 'admin';
    }

    // Route handling
    if (path === '/users' || path === '') {
      if (method === 'POST' && path === '/users') {
        // Register new user
        const { name, student_id, invite_code } = body;
        if (!name) {
          return res.status(400).json({ error: 'missing_name' });
        }

        // Check invite code if not first user
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .limit(1);

        if (count > 0 && invite_code !== '药学2602') {
          return res.status(400).json({ error: 'invalid_invite_code' });
        }

        const role = count === 0 ? 'admin' : 'member';
        const userId = crypto.randomUUID();
        const userAuthId = req.headers['x-user-id'] as string || userId;

        const { data, error } = await supabase
          .from('users')
          .insert({
            id: userId,
            user_id: userAuthId,
            name,
            student_id: student_id || '',
            role,
            created_at: new Date().toISOString()
          })
          .select('id,name,student_id,role,created_at')
          .single();

        if (error) {
          console.error('User creation error:', error);
          return res.status(500).json({ error: 'user_creation_failed' });
        }
        return res.status(200).json(data);
      }

      if (method === 'GET' && path === '/users') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        
        const { data, error } = await supabase
          .from('users')
          .select('id,name,student_id,role,avatar_url,bio,contact,created_at')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (error) {
          return res.status(500).json({ error: 'user_fetch_failed' });
        }
        return res.status(200).json(data);
      }

      if (method === 'PATCH' && path === '/users') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        if (!userProfile) {
          return res.status(404).json({ error: 'user_not_found' });
        }
        
        const { name, bio, contact, avatar_url } = body;

        const { data, error } = await supabase
          .from('users')
          .update({
            name: name || userProfile.name,
            bio: bio || '',
            contact: contact || '',
            avatar_url: avatar_url || ''
          })
          .eq('user_id', user.user_id)
          .select('id,name,student_id,role,avatar_url,bio,contact')
          .single();

        if (error) {
          return res.status(500).json({ error: 'user_update_failed' });
        }
        return res.status(200).json(data);
      }
    }

    // Classmates directory
    if (path === '/classmates') {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('users')
          .select('id,name,student_id,avatar_url,bio,contact,created_at')
          .order('created_at', { ascending: true });

        if (error) {
          return res.status(500).json({ error: 'classmates_fetch_failed' });
        }
        return res.status(200).json({ classmates: data || [] });
      }
    }

    // Announcements
    if (path === '/announcements') {
      if (method === 'GET') {
        const offset = parseInt((query.offset as string) || '0');
        const { data, error } = await supabase
          .from('announcements')
          .select('id,title,content,author_name,created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + 19);

        if (error) {
          return res.status(500).json({ error: 'announcements_fetch_failed' });
        }
        return res.status(200).json({ announcements: data || [] });
      }

      if (method === 'POST') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        if (!isAdmin) {
          return res.status(403).json({ error: 'admin_only' });
        }
        
        const { title, content } = body;
        if (!title || !content) {
          return res.status(400).json({ error: 'missing_fields' });
        }

        const { data, error } = await supabase
          .from('announcements')
          .insert({
            id: crypto.randomUUID(),
            title,
            content,
            author_id: user.user_id,
            author_name: userProfile?.name || 'Unknown',
            created_at: new Date().toISOString()
          })
          .select('id,title,content,author_name,created_at')
          .single();

        if (error) {
          return res.status(500).json({ error: 'announcement_creation_failed' });
        }
        return res.status(201).json(data);
      }

      if (method === 'DELETE') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        if (!isAdmin) {
          return res.status(403).json({ error: 'admin_only' });
        }
        
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: 'missing_id' });
        }

        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);

        if (error) {
          return res.status(500).json({ error: 'announcement_delete_failed' });
        }
        return res.status(200).json({ success: true });
      }
    }

    // Activities/Album
    if (path === '/activities') {
      if (method === 'GET') {
        const offset = parseInt((query.offset as string) || '0');
        const { data, error } = await supabase
          .from('activities')
          .select('id,title,description,activity_date,photos,author_name,created_at')
          .order('activity_date', { ascending: false })
          .range(offset, offset + 19);

        if (error) {
          return res.status(500).json({ error: 'activities_fetch_failed' });
        }
        return res.status(200).json({ activities: data || [] });
      }

      if (method === 'POST') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        if (!isAdmin) {
          return res.status(403).json({ error: 'admin_only' });
        }
        
        const { title, description, activity_date, photos } = body;
        if (!title || !activity_date) {
          return res.status(400).json({ error: 'missing_fields' });
        }

        const { data, error } = await supabase
          .from('activities')
          .insert({
            id: crypto.randomUUID(),
            title,
            description: description || '',
            activity_date,
            photos: photos || [],
            author_id: user.user_id,
            author_name: userProfile?.name || 'Unknown',
            created_at: new Date().toISOString()
          })
          .select('id,title,description,activity_date,photos,author_name,created_at')
          .single();

        if (error) {
          return res.status(500).json({ error: 'activity_creation_failed' });
        }
        return res.status(201).json(data);
      }

      if (method === 'DELETE') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        if (!isAdmin) {
          return res.status(403).json({ error: 'admin_only' });
        }
        
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: 'missing_id' });
        }

        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);

        if (error) {
          return res.status(500).json({ error: 'activity_delete_failed' });
        }
        return res.status(200).json({ success: true });
      }
    }

    // Learning resources
    if (path === '/resources') {
      if (method === 'GET') {
        const offset = parseInt((query.offset as string) || '0');
        const { data, error } = await supabase
          .from('resources')
          .select('id,title,description,file_url,file_name,uploader_name,created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + 19);

        if (error) {
          return res.status(500).json({ error: 'resources_fetch_failed' });
        }
        return res.status(200).json({ resources: data || [] });
      }

      if (method === 'POST') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        if (!userProfile) {
          return res.status(404).json({ error: 'user_not_found' });
        }
        
        const { title, description, file_url, file_name } = body;
        if (!title || !file_url) {
          return res.status(400).json({ error: 'missing_fields' });
        }

        const { data, error } = await supabase
          .from('resources')
          .insert({
            id: crypto.randomUUID(),
            title,
            description: description || '',
            file_url,
            file_name: file_name || '',
            uploader_id: user.user_id,
            uploader_name: userProfile.name || 'Unknown',
            created_at: new Date().toISOString()
          })
          .select('id,title,description,file_url,file_name,uploader_name,created_at')
          .single();

        if (error) {
          return res.status(500).json({ error: 'resource_creation_failed' });
        }
        return res.status(201).json(data);
      }

      if (method === 'DELETE') {
        if (!user) {
          return res.status(401).json({ error: 'login_required' });
        }
        
        const { id } = body;
        if (!id) {
          return res.status(400).json({ error: 'missing_id' });
        }

        // Check if user can delete (admin or uploader)
        const { data: resource } = await supabase
          .from('resources')
          .select('uploader_id')
          .eq('id', id)
          .maybeSingle();

        if (!resource) {
          return res.status(404).json({ error: 'resource_not_found' });
        }
        if (!isAdmin && resource.uploader_id !== user.user_id) {
          return res.status(403).json({ error: 'forbidden' });
        }

        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', id);

        if (error) {
          return res.status(500).json({ error: 'resource_delete_failed' });
        }
        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'not_found' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
}
