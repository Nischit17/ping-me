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
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { notificationService } from "./notificationService";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
  status: "sent" | "delivered" | "read";
  readBy?: string[];
  isEdited?: boolean;
  isDeleted?: boolean;
  editedAt?: Timestamp;
  deletedAt?: Timestamp;
  messageId?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Timestamp;
  };
  unreadCount?: {
    [userId: string]: number;
  };
}

export interface User {
  id: string;
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt?: Date;
  lastSeen?: Date;
  pushToken?: string | null;
  isOnline?: boolean;
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

  // Edit a message
  async editMessage(
    chatId: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
      await updateDoc(messageRef, {
        text: newText,
        isEdited: true,
        editedAt: serverTimestamp(),
      });

      // Update last message if this was the last message
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        if (
          chatData.lastMessage &&
          chatData.lastMessage.messageId === messageId
        ) {
          await updateDoc(chatRef, {
            "lastMessage.text": `${newText} (edited)`,
          });
        }
      }
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  },

  // Delete a message
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
      await updateDoc(messageRef, {
        text: "This message was deleted",
        isDeleted: true,
        deletedAt: serverTimestamp(),
      });

      // Update last message if this was the last message
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        if (
          chatData.lastMessage &&
          chatData.lastMessage.messageId === messageId
        ) {
          await updateDoc(chatRef, {
            "lastMessage.text": "This message was deleted",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },

  // Send a new message
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string
  ): Promise<void> {
    try {
      const timestamp = serverTimestamp();
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const messageDoc = await addDoc(messagesRef, {
        text,
        senderId,
        createdAt: timestamp,
        status: "sent",
        readBy: [],
        isEdited: false,
        isDeleted: false,
        messageId: "", // Will be updated after creation
      });

      // Update the message with its ID
      await updateDoc(messageDoc, {
        messageId: messageDoc.id,
      });

      // Update last message in chat document
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data() as Chat;
        const otherUserId = chatData.participants.find((id) => id !== senderId);

        // Update unread count for recipient
        const currentUnreadCount =
          chatData.unreadCount?.[otherUserId || ""] || 0;

        await updateDoc(chatRef, {
          lastMessage: {
            text,
            senderId,
            createdAt: timestamp,
            messageId: messageDoc.id,
            status: "sent",
          },
          unreadCount: {
            ...chatData.unreadCount,
            [otherUserId || ""]: currentUnreadCount + 1,
          },
        });

        // Send notification to other participant
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
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Mark message as read
  async markMessageAsRead(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<void> {
    const messageRef = doc(db, `chats/${chatId}/messages`, messageId);
    const messageDoc = await getDoc(messageRef);

    if (messageDoc.exists()) {
      const messageData = messageDoc.data();
      const readBy = messageData.readBy || [];

      if (!readBy.includes(userId)) {
        await updateDoc(messageRef, {
          readBy: [...readBy, userId],
          status: readBy.length + 1 === 2 ? "read" : "delivered",
        });
      }
    }
  },

  // Mark all messages as read
  async markMessagesAsRead(chatId: string, userId: string) {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) return;

      const chat = chatDoc.data();
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);

      let hasUnreadMessages = false;

      messagesSnapshot.docs.forEach((doc) => {
        const messageData = doc.data();
        if (
          messageData.senderId !== userId &&
          !messageData.readBy?.includes(userId)
        ) {
          hasUnreadMessages = true;
          const readBy = [...(messageData.readBy || []), userId];
          batch.update(doc.ref, {
            readBy,
            status: readBy.length >= 2 ? "read" : "delivered",
          });
        }
      });

      if (hasUnreadMessages) {
        await batch.commit();
        // Reset unread count for the current user
        await updateDoc(chatRef, {
          [`unreadCount.${userId}`]: 0,
        });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
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

  // Update user online status
  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  },

  // Subscribe to user status
  subscribeToUserStatus(userId: string, callback: (isOnline: boolean) => void) {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as User;
        callback(userData.isOnline || false);
      }
    });
  },
};
