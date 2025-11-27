import { supabase } from './supabase';
import { User } from '../../types'; // We might not be able to import types if it's outside components

// Define User type locally if we can't import it
export interface UserProfile {
    id: string;
    username: string;
    password?: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    linkedin: string;
    bio: string;
    avatarUrl: string;
    isAdmin: boolean;
}

export async function getUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data.map(p => ({
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

export async function saveUser(user: UserProfile) {
    const profile = {
        id: user.id,
        username: user.username,
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

    const { error } = await supabase
        .from('profiles')
        .upsert(profile);

    if (error) throw error;
    return true;
}

export async function deleteUser(id: string) {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
