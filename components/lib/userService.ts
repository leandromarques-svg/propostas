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

export async function saveUser(user: User): Promise<boolean> {
    const profile = {
        id: user.id,
        username: user.username || (user.email ? user.email.split('@')[0] : 'user'), // Fallback for username
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

    const { error } = await supabase
        .from('profiles')
        .upsert(profile);

    if (error) {
        console.error('Error saving user:', error);
        console.error('Profile data:', profile);
        throw error;
    }
    return true;
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
