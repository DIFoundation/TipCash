import { createClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  zcashAddress: string;
  publicKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tip {
  id: string;
  senderId: string;
  recipientId?: string;
  recipientAddress?: string;
  amount: number;
  currency: 'ZEC' | 'USD';
  txid?: string;
  status: 'pending' | 'confirmed' | 'failed';
  memo?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  favoriteUserId: string;
  createdAt: Date;
}

export interface ReceiveLink {
  id: string;
  userId: string;
  token: string;
  isAnonymous: boolean;
  usesRemaining: number;
  expiresAt?: Date;
  createdAt: Date;
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
    findBySenderId: async (senderId: string, limit: number = 50): Promise<Tip[]> => {
      const { data, error } = await supabase
        .from('tips')
        .select()
        .eq('sender_id', senderId)
        .limit(limit);
      if (error) throw error;
      return data;
    },
    findByRecipientId: async (recipientId: string, limit: number = 50): Promise<Tip[]> => {
      const { data, error } = await supabase
        .from('tips')
        .select()
        .eq('recipient_id', recipientId)
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
    create: async (userId: string, favoriteUserId: string): Promise<Favorite> => {
      const { data: favorite, error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, favorite_user_id: favoriteUserId }])
        .select()
        .single();
      if (error) throw error;
      return favorite;
    },
    delete: async (userId: string, favoriteUserId: string): Promise<boolean> => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('favorite_user_id', favoriteUserId);
      if (error) throw error;
      return true;
    },
    findByUserId: async (userId: string): Promise<Favorite[]> => {
      const { data, error } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', userId);
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
    findByUserId: async (userId: string): Promise<ReceiveLink[]> => {
      const { data, error } = await supabase
        .from('receive_links')
        .select()
        .eq('user_id', userId);
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
