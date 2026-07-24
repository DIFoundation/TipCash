import { createClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  zcash_address: string;
  public_key?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tip {
  id: string;
  sender_id: string;
  recipient_id?: string;
  recipient_address?: string;
  amount: number;
  currency: 'ZEC' | 'USD';
  txid?: string;
  status: 'pending' | 'confirmed' | 'failed';
  memo?: string;
  is_anonymous: boolean;
  created_at: Date;
}

export interface Favorite {
  id: string;
  user_id: string;
  favorite_user_id: string;
  created_at: Date;
}

export interface ReceiveLink {
  id: string;
  user_id: string;
  token: string;
  is_anonymous: boolean;
  uses_remaining: number;
  expires_at?: Date;
  created_at: Date;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const db = {
  // User operations
  users: {
    create: async (data: Partial<User>): Promise<User> => {
      const { data: user, error } = await supabase
        .from('users')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return user;
    },
    findByEmail: async (email: string): Promise<User | null> => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .single();
      if (error) return null;
      return data;
    },
    findByUsername: async (username: string): Promise<User | null> => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('username', username)
        .single();
      if (error) return null;
      return data;
    },
    findById: async (id: string): Promise<User | null> => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    update: async (id: string, data: Partial<User>): Promise<User> => {
      const { data: user, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return user;
    },
    search: async (query: string, limit: number = 20, offset: number = 0): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .ilike('username', `%${query}%`)
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return data;
    }
  },

  // Tip operations
  tips: {
    create: async (data: Partial<Tip>): Promise<Tip> => {
      const { data: tip, error } = await supabase
        .from('tips')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return tip;
    },
    findById: async (id: string): Promise<Tip | null> => {
      const { data, error } = await supabase
        .from('tips')
        .select()
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    findByTxid: async (txid: string): Promise<Tip | null> => {
      const { data, error } = await supabase
        .from('tips')
        .select()
        .eq('txid', txid)
        .single();
      if (error) return null;
      return data;
    },
    findBySenderId: async (sender_id: string, limit: number = 50): Promise<Tip[]> => {
      const { data, error } = await supabase
        .from('tips')
        .select()
        .eq('sender_id', sender_id)
        .limit(limit);
      if (error) throw error;
      return data;
    },
    findByRecipientId: async (recipient_id: string, limit: number = 50): Promise<Tip[]> => {
      const { data, error } = await supabase
        .from('tips')
        .select()
        .eq('recipient_id', recipient_id)
        .limit(limit);
      if (error) throw error;
      return data;
    },
    update: async (id: string, data: Partial<Tip>): Promise<Tip> => {
      const { data: tip, error } = await supabase
        .from('tips')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return tip;
    }
  },

  // Favorite operations
  favorites: {
    create: async (user_id: string, favorite_user_id: string): Promise<Favorite> => {
      const { data: favorite, error } = await supabase
        .from('favorites')
        .insert([{ user_id, favorite_user_id }])
        .select()
        .single();
      if (error) throw error;
      return favorite;
    },
    delete: async (user_id: string, favorite_user_id: string): Promise<boolean> => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user_id)
        .eq('favorite_user_id', favorite_user_id);
      if (error) throw error;
      return true;
    },
    findByUserId: async (user_id: string): Promise<Favorite[]> => {
      const { data, error } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user_id);
      if (error) throw error;
      return data;
    }
  },

  // Receive link operations
  receiveLinks: {
    create: async (data: Partial<ReceiveLink>): Promise<ReceiveLink> => {
      const { data: link, error } = await supabase
        .from('receive_links')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return link;
    },
    findByToken: async (token: string): Promise<ReceiveLink | null> => {
      const { data, error } = await supabase
        .from('receive_links')
        .select()
        .eq('token', token)
        .single();
      if (error) return null;
      return data;
    },
    findByUserId: async (user_id: string): Promise<ReceiveLink[]> => {
      const { data, error } = await supabase
        .from('receive_links')
        .select()
        .eq('user_id', user_id);
      if (error) throw error;
      return data;
    },
    update: async (id: string, data: Partial<ReceiveLink>): Promise<ReceiveLink> => {
      const { data: link, error } = await supabase
        .from('receive_links')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return link;
    }
  }
};

export default db;
