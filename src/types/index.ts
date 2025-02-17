export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
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
