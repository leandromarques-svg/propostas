import { User } from '../../types';

export type UserProfile = User;

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxvEbfCjw5prUCltIj5KWGzilUXsp-tu4fIA_ZYvr5WWJ0k4OoJL7SLOP1ZrnSCejV8/exec';

const USERS_STORAGE_KEY = 'metarh_users';

export const MASTER_USER: User = {
  id: 'master-leandro',
  username: 'Leandro',
  password: '123',
  name: 'Leandro Marques',
  role: 'Gerencial Comercial',
  grupoEconomico: 'METARH Matriz',
  bio: 'Gestão Comercial e Estratégia de Recursos Humanos.',
  email: 'leandro@metarh.com.br',
  phone: '(11) 99999-8888',
  linkedin: 'linkedin.com/in/leandro-metarh',
  isAdmin: true
};

/**
 * Check if a given user has the 'Gerencial Comercial' role
 */
export function isGerencialComercial(user?: User | null): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase().trim();
  return role === 'gerencial comercial' || role.includes('gerencial') || Boolean(user.isAdmin);
}

/**
 * Fetch users from Google Apps Script spreadsheet with localStorage cache fallback
 */
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getUsers`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        const parsedUsers: User[] = data
          .filter(
            (item: any) =>
              item &&
              item.username &&
              item.username !== 'Usuário' &&
              item.username !== '[object Object]' &&
              item.username.trim() !== '' &&
              (item.role || '').toLowerCase().trim() !== 'cliente'
          )
          .map((item: any, idx: number) => {
            const role = item.role || 'Colaborador';
            const isManager = isGerencialComercial({ role, name: item.username, id: '', username: item.username });
            return {
              id: `gas-${idx}-${item.username}`,
              username: item.username,
              password: item.password || '',
              name: item.username,
              role: role,
              grupoEconomico: item.grupoEconomico || '',
              bio: '',
              email: `${item.username.toLowerCase().replace(/[^a-z0-9]/g, '.')}@metarh.com.br`,
              phone: '',
              linkedin: '',
              isAdmin: isManager
            };
          });

        // Ensure master user "Leandro" with password "123" is always available
        const hasLeandro = parsedUsers.some(
          u => u.username.toLowerCase() === 'leandro' || u.username.toLowerCase() === 'leandro marques'
        );
        if (!hasLeandro) {
          parsedUsers.unshift(MASTER_USER);
        }

        try {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsedUsers));
        } catch {}

        return parsedUsers;
      }
    }
  } catch (error) {
    console.warn('Erro ao buscar usuários do Google Sheets, usando cache local:', error);
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(USERS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(u => (u.role || '').toLowerCase().trim() !== 'cliente');
      }
    }
  } catch {}

  return [MASTER_USER];
}

/**
 * Save user to Google Apps Script spreadsheet
 * Only users with role "Gerencial Comercial" are allowed to perform this
 */
export async function saveUser(
  user: User | Omit<User, 'id'>,
  operatorUser?: User | null
): Promise<User | null> {
  if (operatorUser && !isGerencialComercial(operatorUser)) {
    throw new Error('Apenas usuários com perfil "Gerencial Comercial" podem alterar ou incluir usuários.');
  }

  const username = user.username?.trim() || user.name.trim();
  const password = user.password || '123';
  const role = user.role || 'Colaborador';
  const grupoEconomico = user.grupoEconomico || '';

  try {
    const params = new URLSearchParams({
      action: 'saveUser',
      username,
      password,
      role,
      grupoEconomico
    });

    const res = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
    if (!res.ok) {
      console.warn('Erro na resposta do Google Apps Script:', res.statusText);
    }
  } catch (e) {
    console.error('Falha ao salvar no Google Apps Script:', e);
  }

  const id = (user as User).id || `gas-${Date.now()}-${username}`;
  const isManager = isGerencialComercial({ role, name: username, id, username });

  const savedUser: User = {
    id,
    username,
    password,
    name: user.name || username,
    role,
    grupoEconomico,
    bio: user.bio || '',
    email: user.email || `${username.toLowerCase().replace(/[^a-z0-9]/g, '.')}@metarh.com.br`,
    phone: user.phone || '',
    linkedin: user.linkedin || '',
    isAdmin: isManager
  };

  // Update local cache
  try {
    const current = await getUsers();
    const idx = current.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...savedUser };
    } else {
      current.push(savedUser);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(current));
  } catch {}

  return savedUser;
}

/**
 * Delete user from Google Apps Script spreadsheet
 * Only users with role "Gerencial Comercial" are allowed to perform this
 */
export async function deleteUser(
  usernameOrId: string,
  operatorUser?: User | null
): Promise<boolean> {
  if (operatorUser && !isGerencialComercial(operatorUser)) {
    throw new Error('Apenas usuários com perfil "Gerencial Comercial" podem deletar usuários.');
  }

  // Prevent deleting master Leandro
  if (usernameOrId.toLowerCase() === 'leandro' || usernameOrId.toLowerCase() === 'master-leandro') {
    throw new Error('O usuário master não pode ser excluído.');
  }

  try {
    const params = new URLSearchParams({
      action: 'deleteUser',
      username: usernameOrId
    });
    await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
  } catch (e) {
    console.error('Falha ao excluir no Google Apps Script:', e);
  }

  // Update local cache
  try {
    const current = await getUsers();
    const filtered = current.filter(
      u => u.username.toLowerCase() !== usernameOrId.toLowerCase() && u.id !== usernameOrId
    );
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}

  return true;
}
