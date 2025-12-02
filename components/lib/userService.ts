import { supabase } from '../../lib/supabase';
import { User } from '../../types';

export async function getUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return (data || []).map((p: any) => ({
        id: p.id,
        username: p.username,
        password: p.password,
        name: p.name,
        role: p.role,
        email: p.email,
        phone: p.phone,
        linkedin: p.linkedin,
        bio: p.bio,
        avatarUrl: p.avatar_url,
        isAdmin: p.is_admin
    }));
}

export async function saveUser(user: User | Omit<User, 'id'>): Promise<User | null> {
    const profile = {
        id: (user as User).id, // Undefined for new users
        username: user.username || (user.email ? user.email.split('@')[0] : 'user'),
        password: user.password,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        linkedin: user.linkedin,
        bio: user.bio,
        avatar_url: user.avatarUrl,
        is_admin: user.isAdmin
    };

    console.log('Saving user profile:', profile);

    const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();

    if (error) {
        console.error('Error saving user:', error);
        return null;
    }

    if (!data) return null;

    return {
        id: data.id,
        username: data.username,
        password: data.password,
        name: data.name,
        role: data.role,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin,
        bio: data.bio,
        avatarUrl: data.avatar_url,
        isAdmin: data.is_admin
    };
}

export async function deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
    return true;
}
