import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLoginContext } from '../components/LoginContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function MobilityCoachScreen({ navigation }) {
  const { isAuthenticated, sessionToken, logout } = useLoginContext();

  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null; // Do not briefly render private content
  }

  const scrollToBottom = () => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSend = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;
    if (isLoading) return;

    setIsLoading(true);
    const userMessageId = Date.now().toString();
    const newUserMessage = {
      id: userMessageId,
      text: trimmedInput,
      sender: 'user',
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    scrollToBottom();

    try {
      const payload = { message: trimmedInput };
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      const response = await fetch(`${API_URL}/api/mobility-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-suresteps-session-token': sessionToken
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        if (logout) {
          logout();
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
        return;
      }

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();

      // Validation
      if (
        typeof data.sessionId !== 'string' || !data.sessionId.trim() ||
        typeof data.message !== 'string' || !data.message.trim() ||
        !['normal', 'caution', 'urgent'].includes(data.safetyLevel)
      ) {
        throw new Error('Malformed API response');
      }

      setSessionId(data.sessionId);

      const assistantMessage = {
        id: Date.now().toString() + '_assistant',
        text: data.message,
        sender: 'assistant',
        safetyLevel: data.safetyLevel,
      };

      setMessages(prev => [...prev, assistantMessage]);
      scrollToBottom();

    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Revert optimistic update and allow retry
      setMessages(prev => prev.filter(m => m.id !== userMessageId));
      setInputText(trimmedInput);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const isCaution = item.safetyLevel === 'caution';
    const isUrgent = item.safetyLevel === 'urgent';

    return (
      <View
        style={[
          s.messageBubble,
          isUser ? s.userBubble : s.assistantBubble,
          isCaution && s.cautionBubble,
          isUrgent && s.urgentBubble
        ]}
        testID={isUser ? "user-message" : "assistant-message"}
        accessibilityLabel={isUser ? "user message" : "assistant message"}
      >
        {isCaution && (
          <Text style={s.cautionLabel} testID="caution-response" accessibilityLabel="Caution response">Caution</Text>
        )}
        {isUrgent && (
          <Text style={s.urgentLabel} testID="urgent-response" accessibilityLabel="Urgent response">Urgent Safety Notice</Text>
        )}
        <Text style={[
          s.messageText,
          isUser && s.userText,
          isCaution && s.cautionText,
          isUrgent && s.urgentText
        ]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.header}>
        <Text style={s.title}>Mobility Coach</Text>
        <Text style={s.disclaimer}>
          The Mobility Coach provides general educational guidance and is not a medical professional.
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={s.listContent}
        testID="message-list"
        accessibilityLabel="message list"
        onContentSizeChange={scrollToBottom}
      />

      <View style={s.inputContainer}>
        <TextInput
          style={s.input}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          editable={!isLoading}
          testID="message-input"
          accessibilityLabel="message input"
          multiline
        />
        <Pressable
          style={[s.sendButton, isLoading && s.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
          testID="send-button"
          accessibilityLabel="send button"
        >
          {isLoading ? (
             <ActivityIndicator color="#fff" testID="loading-state" accessibilityLabel="loading state" />
          ) : (
            <Text style={s.sendButtonText}>Send</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  header: { padding: 24, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 30, fontWeight: '700', color: '#18204a', marginBottom: 8 },
  disclaimer: { fontSize: 14, color: '#606582', fontStyle: 'italic' },
  listContent: { padding: 16 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  userBubble: {
    backgroundColor: '#4255d4',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  assistantBubble: {
    backgroundColor: '#e5e7eb',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4
  },
  cautionBubble: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    borderWidth: 1
  },
  urgentBubble: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1
  },
  messageText: { fontSize: 16, color: '#1f2937' },
  userText: { color: '#ffffff' },
  cautionText: { color: '#92400e' },
  urgentText: { color: '#991b1b' },
  cautionLabel: { fontWeight: 'bold', color: '#b45309', marginBottom: 4, fontSize: 12, textTransform: 'uppercase' },
  urgentLabel: { fontWeight: 'bold', color: '#b91c1c', marginBottom: 4, fontSize: 12, textTransform: 'uppercase' },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 12,
    minHeight: 40,
    maxHeight: 120
  },
  sendButton: {
    backgroundColor: '#4255d4',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af'
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
