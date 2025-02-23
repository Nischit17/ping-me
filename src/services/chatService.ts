import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { notificationService } from "./notificationService";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
}

export const chatService = {
  // Create a new chat session between two users
  async createChat(userId1: string, userId2: string): Promise<string> {
    const chatRef = collection(db, "chats");
    const chatDoc = await addDoc(chatRef, {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
    });
    return chatDoc.id;
  },

  // Get or create a chat session between two users
  async getOrCreateChat(userId1: string, userId2: string): Promise<string> {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userId1));

    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find((doc) => {
      const chat = doc.data() as Chat;
      return chat.participants.includes(userId2);
    });

    if (existingChat) {
      return existingChat.id;
    }

    return this.createChat(userId1, userId2);
  },

  // Send a new message
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const messageDoc = await addDoc(messagesRef, {
      text,
      senderId,
      createdAt: serverTimestamp(),
      status: "sent",
    });

    // Update last message in chat document
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chatData = chatDoc.data() as Chat;
      await updateDoc(chatRef, {
        lastMessage: {
          text,
          senderId,
          createdAt: serverTimestamp(),
        },
      });

      // Send notification to other participant
      const otherUserId = chatData.participants.find((id) => id !== senderId);
      if (otherUserId) {
        const userRef = doc(db, "users", otherUserId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.pushToken) {
          await notificationService.sendPushNotification(
            userData.pushToken,
            "New Message",
            text
          );
        }
      }
    }
  },

  // Subscribe to messages in a chat
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages);
    });
  },

  // Subscribe to user's chats
  subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId),
      orderBy("lastMessage.createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      callback(chats);
    });
  },
};
