import { ChatMessage } from "@/types/chat";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ambleAI } from "@/services/ambleAI";

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: " Hello! I'm Amble AI.\n\nI can help you find great restaurants.\n\nWhat are you looking for today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const text = inputText.trim();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const aiResponse = await ambleAI.askAI(text.trim());

      const aiMessage: ChatMessage = {
  id: (Date.now() + 1).toString(),
  text: aiResponse.text,
  sender: "ai",
  timestamp: new Date(),
  restaurants: aiResponse.restaurants,
};

      setMessages((prev) => [...prev, aiMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: " AI error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {item.text}
          </Text>

          {/* Restaurant Results */}
          {item.restaurants?.map((r) => (
  <View key={r._id}>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text>⭐ {r.rating}</Text>
              <Text>{r.cuisine}</Text>
            </View>
          ))}

          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}
          >
            {item.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  const quickReplies = [
    "romantic restaurant",
    "sushi near me",
    "cheap restaurant",
    "best restaurants in saigon",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
        
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickRepliesContainer}
        >
          {quickReplies.map((reply, index) => (
            <Pressable
              key={index}
              style={styles.quickReplyButton}
              onPress={() => handleQuickReply(reply)}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about restaurants..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!loading}
          />

          <Pressable
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || loading ? "#ccc" : "#fff"}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  messagesList: {
    padding: 16,
  },

  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },

  userMessageContainer: {
    justifyContent: "flex-end",
  },

  aiMessageContainer: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },

  userBubble: {
    backgroundColor: "#007AFF",
  },

  aiBubble: {
    backgroundColor: "#f2f2f2",
  },

  messageText: {
    fontSize: 15,
  },

  userText: {
    color: "#fff",
  },

  aiText: {
    color: "#000",
  },

  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },

  userTimestamp: {
    color: "#ddd",
  },

  aiTimestamp: {
    color: "#666",
  },

  inputContainer: {
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 10,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 20,
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20,
  },

  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },

  restaurantCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },

  restaurantName: {
    fontWeight: "bold",
  },

  quickRepliesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  quickReplyButton: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },

  quickReplyText: {
    fontSize: 13,
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  loadingText: {
    marginLeft: 6,
    fontSize: 12,
  },

  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
});