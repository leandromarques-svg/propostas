// Supabase Mock Client (Supabase removed per user request)
// Provides safe fallbacks to prevent errors if any component references supabase.

export const supabase = {
  auth: {
    getUser: async () => ({
      data: { user: { id: 'u0', email: 'leandro@metarh.com.br' } },
      error: null
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => {
    const chainable = {
      select: () => chainable,
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => chainable,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      upsert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => chainable,
      delete: () => chainable,
      then: (resolve: any) => resolve({ data: [], error: null })
    };
    return chainable;
  }
} as any;