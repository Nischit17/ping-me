export interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt?: Date;
  lastSeen?: Date;
  pushToken?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    createdAt: Date;
  };
  createdAt: Date;
}
