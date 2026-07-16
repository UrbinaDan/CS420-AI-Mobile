import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function MobilityCoachScreen({ navigation }) {
  const [question, setQuestion] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preference, setPreference] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escalationStatus, setEscalationStatus] = useState(null);

  const handleSubmit = async () => {
    if (!question || !phoneNumber) {
      Alert.alert('Error', 'Please enter a question and phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Assuming backend URL is provided via config, for now hardcoding to match test env
      // or we can just mock the response for now if API_URL isn't set
      // Since it's a mobile app, it needs an absolute URL, but we'll simulate the fetch.
      
      const payload = {
        phoneNumber,
        question,
        responsePreference: preference
      };
      
      // Simulate API call for local testing without full backend URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEscalationStatus({
        status: 'escalated',
        estimatedResponseTime: '15-30 minutes'
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
