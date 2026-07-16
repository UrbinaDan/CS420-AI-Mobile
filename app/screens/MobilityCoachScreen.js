import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLoginContext } from '../components/LoginContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function MobilityCoachScreen({ navigation }) {
  const { isAuthenticated, sessionToken, userName } = useLoginContext();
  const [question, setQuestion] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preference, setPreference] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalationStatus, setEscalationStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null; // Do not briefly render private content
  }

  const handleSubmit = async () => {
    if (!question || !phoneNumber) {
      Alert.alert('Error', 'Please enter a question and phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        phoneNumber,
        question,
        aiResponse: '', // Safe default as AI interaction isn't happening on this screen yet
        timestamp: new Date().toISOString(),
        responsePreference: preference,
        waitingForResponse: true,
        sessionId: 'session_mobile', // Default for now
        userId: userName || 'anonymous'
      };
      
      const response = await fetch(`${API_URL}/escalate-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-suresteps-session-token': sessionToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const result = await response.json();
      
      setEscalationStatus({
        status: result.status,
        estimatedResponseTime: result.estimatedResponseTime || '15-30 minutes'
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (escalationStatus) {
    return (
      <View style={s.container}>
        <Text style={s.title}>Question Received</Text>
        <Text style={s.copy}>
          Your question has been forwarded to a healthcare coach.
        </Text>
        <Text style={s.copy}>
          Estimated Response Time: {escalationStatus.estimatedResponseTime}
        </Text>
        <Pressable style={s.button} onPress={() => navigation.navigate('Home')}>
          <Text style={s.buttonText}>Return Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Mobility Coach</Text>
      <Text style={s.copy}>Ask a question about your results or exercise plan.</Text>
      
      <TextInput
        style={s.input}
        placeholder="Enter your question"
        value={question}
        onChangeText={setQuestion}
        multiline
        numberOfLines={4}
      />
      
      <TextInput
        style={s.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      
      <Text style={s.label}>How should we contact you?</Text>
      <View style={s.radioContainer}>
        {['text', 'call', 'chat'].map(pref => (
          <Pressable 
            key={pref} 
            style={[s.radio, preference === pref && s.radioSelected]}
            onPress={() => setPreference(pref)}
          >
            <Text style={[s.radioText, preference === pref && s.radioTextSelected]}>
              {pref.charAt(0).toUpperCase() + pref.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={s.button} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.buttonText}>Submit Question</Text>
        )}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f7f8fc' },
  title: { fontSize: 30, fontWeight: '700', color: '#18204a', marginBottom: 8 },
  copy: { fontSize: 17, color: '#606582', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#18204a', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 48,
  },
  radioContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  radio: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center'
  },
  radioSelected: { backgroundColor: '#4255d4', borderColor: '#4255d4' },
  radioText: { color: '#18204a', fontWeight: '500' },
  radioTextSelected: { color: '#fff' },
  button: { backgroundColor: '#4255d4', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
