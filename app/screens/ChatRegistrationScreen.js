import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';

export default function ChatRegistrationScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session_${Date.now()}`);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Initialize chat
  useEffect(() => {
    sendMessage('start_session');
  }, []);

  const sendMessage = async (text) => {
    if (!text && !input) return;
    
    const messageToSend = text || input;
    
    if (messageToSend !== 'start_session') {
      setMessages(prev => [...prev, { text: messageToSend, isUser: true }]);
    }
    
    setInput('');

    try {
      // Mock API call since we don't have the real backend URL in context
      const res = await simulateApiCall(messageToSend);
      setMessages(prev => [...prev, { text: res.aiResponse, isUser: false }]);
      if (res.sessionActive === false) {
        setIsSessionActive(false);
      }
    } catch (e) {
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again or use the normal signup form.', isUser: false }]);
    }
  };

  // Mock implementation matching the backend flow
  const simulateApiCall = async (msg) => {
    await new Promise(r => setTimeout(r, 500));
    let aiResponse = "I'm not sure what you mean.";
    let sessionActive = true;
    
    if (msg === 'start_session') aiResponse = "Hi! I'm here to help you register for STEDI. Let's start with your first name. What is your first name?";
    else if (messages.length === 0) aiResponse = `Thanks. Now, what is your last name?`; // Simple mock
    else if (messages.length === 2) aiResponse = "Got it. What's your email address?";
    else if (messages.length === 4) aiResponse = "Thanks! Please provide a strong password.";
    else if (messages.length === 6) aiResponse = "Great. What is your phone number?";
    else if (messages.length === 8) aiResponse = "Lastly, what is your birth date? (YYYY-MM-DD)";
    else if (messages.length === 10) aiResponse = "Thank you! I have all the information. Would you like me to submit your registration now?";
    else if (msg.toLowerCase().includes('yes')) {
      aiResponse = "Registration submitted successfully! You can now log in.";
      sessionActive = false;
    }
    
    return { aiResponse, sessionActive };
  };

  return (
    <View style={s.container}>
      <ScrollView style={s.chatArea}>
        {messages.map((m, i) => (
          <View key={i} style={[s.messageBubble, m.isUser ? s.userBubble : s.aiBubble]}>
            <Text style={s.messageText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      
      {isSessionActive ? (
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your response..."
          />
          <Pressable style={s.sendBtn} onPress={() => sendMessage()}>
            <Text style={s.sendBtnText}>Send</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={s.sendBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={s.sendBtnText}>Return to Home</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  chatArea: { flex: 1, padding: 16 },
  messageBubble: { padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '80%' },
  userBubble: { backgroundColor: '#4255d4', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#e5e7eb', alignSelf: 'flex-start' },
  messageText: { fontSize: 16, color: '#18204a' },
  inputRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 16, height: 40 },
  sendBtn: { marginLeft: 12, backgroundColor: '#4255d4', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 20 },
  sendBtnText: { color: '#fff', fontWeight: 'bold' }
});
