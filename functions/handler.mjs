// Business logic handler for 药学2602 class website
import { requireUser, UserContextError } from './auth.mjs';

const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'no-store' };
const MAX_BODY = 1024 * 1024; // 1MB

async function readJson(request, max = MAX_BODY) {
  const text = await request.text();
  if (text.length > max) throw new Error('body_too_large');
  return JSON.parse(text);
}

function ok(data, status = 200) {
  return Response.json(data, { status, headers: JSON_HEADERS });
}

function err(code, status = 400) {
  return Response.json({ error: code }, { status, headers: JSON_HEADERS });
}

export async function handleClassApp({ request, supabase }) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace('/functions/v1/app', '') || '/';
    const action = url.searchParams.get('action');
    const user = requireUser(request);

    // Check if user is admin (first user becomes admin, others need invitation)
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', user.user_id)
      .maybeSingle();

    const isAdmin = userProfile?.role === 'admin';

    // Route handling
    if (path === '/users' || path === '/') {
      if (request.method === 'POST' && path === '/users') {
        // Register new user
        const body = await readJson(request);
        const { name, student_id, invite_code } = body;
        if (!name || !student_id) return err('missing_fields');

        // Check invite code if not first user
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .limit(1);

        if (count > 0 && invite_code !== '药学2602') {
          return err('invalid_invite_code');
        }

        const role = count === 0 ? 'admin' : 'member';
        const userId = crypto.randomUUID();

        const { data, error } = await supabase
          .from('users')
          .insert({
            id: userId,
            user_id: user.user_id,
            name,
            student_id,
            role,
            created_at: new Date().toISOString()
          })
          .select('id,name,student_id,role,created_at')
          .single();

        if (error) return err('user_creation_failed', 500);
        return ok(data);
      }

      if (request.method === 'GET' && path === '/users') {
        // Get current user profile
        const { data, error } = await supabase
          .from('users')
          .select('id,name,student_id,role,avatar_url,bio,contact,created_at')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (error) return err('user_fetch_failed', 500);
        if (!data) return ok(null);
        return ok(data);
      }

      if (request.method === 'PATCH' && path === '/users') {
        // Update user profile
        if (!userProfile) return err('user_not_found', 404);
        const body = await readJson(request);
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

        if (error) return err('user_update_failed', 500);
        return ok(data);
      }
    }

    // Classmates directory
    if (path === '/classmates') {
      if (request.method === 'GET') {
        const { data, error } = await supabase
          .from('users')
          .select('id,name,student_id,avatar_url,bio,contact,created_at')
          .order('created_at', { ascending: true });

        if (error) return err('classmates_fetch_failed', 500);
        return ok({ classmates: data || [] });
      }
    }

    // Announcements
    if (path === '/announcements') {
      if (request.method === 'GET') {
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const { data, error } = await supabase
          .from('announcements')
          .select('id,title,content,author_name,created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + 19);

        if (error) return err('announcements_fetch_failed', 500);
        return ok({ announcements: data || [] });
      }

      if (request.method === 'POST') {
        if (!isAdmin) return err('admin_only', 403);
        const body = await readJson(request);
        const { title, content } = body;
        if (!title || !content) return err('missing_fields');

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

        if (error) return err('announcement_creation_failed', 500);
        return ok(data, 201);
      }

      if (request.method === 'DELETE') {
        if (!isAdmin) return err('admin_only', 403);
        const body = await readJson(request);
        const { id } = body;
        if (!id) return err('missing_id');

        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);

        if (error) return err('announcement_delete_failed', 500);
        return ok({ success: true });
      }
    }

    // Activities/Album
    if (path === '/activities') {
      if (request.method === 'GET') {
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const { data, error } = await supabase
          .from('activities')
          .select('id,title,description,activity_date,photos,author_name,created_at')
          .order('activity_date', { ascending: false })
          .range(offset, offset + 19);

        if (error) return err('activities_fetch_failed', 500);
        return ok({ activities: data || [] });
      }

      if (request.method === 'POST') {
        if (!isAdmin) return err('admin_only', 403);
        const body = await readJson(request);
        const { title, description, activity_date, photos } = body;
        if (!title || !activity_date) return err('missing_fields');

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

        if (error) return err('activity_creation_failed', 500);
        return ok(data, 201);
      }

      if (request.method === 'DELETE') {
        if (!isAdmin) return err('admin_only', 403);
        const body = await readJson(request);
        const { id } = body;
        if (!id) return err('missing_id');

        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id);

        if (error) return err('activity_delete_failed', 500);
        return ok({ success: true });
      }
    }

    // Learning resources
    if (path === '/resources') {
      if (request.method === 'GET') {
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const { data, error } = await supabase
          .from('resources')
          .select('id,title,description,file_url,file_name,uploader_name,created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + 19);

        if (error) return err('resources_fetch_failed', 500);
        return ok({ resources: data || [] });
      }

      if (request.method === 'POST') {
        if (!userProfile) return err('user_not_found', 404);
        const body = await readJson(request);
        const { title, description, file_url, file_name } = body;
        if (!title || !file_url) return err('missing_fields');

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

        if (error) return err('resource_creation_failed', 500);
        return ok(data, 201);
      }

      if (request.method === 'DELETE') {
        const body = await readJson(request);
        const { id } = body;
        if (!id) return err('missing_id');

        // Check if user can delete (admin or uploader)
        const { data: resource } = await supabase
          .from('resources')
          .select('uploader_id')
          .eq('id', id)
          .maybeSingle();

        if (!resource) return err('resource_not_found', 404);
        if (!isAdmin && resource.uploader_id !== user.user_id) return err('forbidden', 403);

        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', id);

        if (error) return err('resource_delete_failed', 500);
        return ok({ success: true });
      }
    }

    return err('not_found', 404);
  } catch (e) {
    if (e instanceof UserContextError) {
      return err(e.code, e.status);
    }
    if (e.message === 'body_too_large') return err('body_too_large', 413);
    if (e.message === 'Unexpected end of JSON input' || e.message.includes('JSON')) {
      return err('invalid_json', 400);
    }
    return err('internal_error', 500);
  }
}
