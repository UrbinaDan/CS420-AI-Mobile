import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLoginContext } from '../components/LoginContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function BalanceTestScreen({ navigation }) {
  const { isAuthenticated, userName } = useLoginContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create a mock payload for the balance test result
      const score = Math.floor(Math.random() * 20) + 70; // random score between 70 and 90
      const payload = {
        customer: userName, // Using userName which might be username/email/phone
        score: score,
        source: 'MOBILE_APP',
        testId: 'test-' + Date.now(),
        metrics: {
          stability: "good",
          speed: "average"
        }
      };
      
      const response = await fetch(`${API_URL}/rapidsteptest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      setCompleted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit test results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed) {
    return (
      <View style={s.container}>
        <Text style={s.title}>Test Complete</Text>
        <Text style={s.copy}>
          Your balance test results have been successfully uploaded to your provider.
        </Text>
        <Pressable style={s.button} onPress={() => navigation.navigate('Home')}>
          <Text style={s.buttonText}>Return Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Balance Test</Text>
      <Text style={s.copy}>
        Stand up straight, place your hands on your hips, and follow the audio instructions to perform the rapid step exercise.
      </Text>
      
      <View style={s.testBox}>
        <Text style={s.testInstruction}>Ready to start?</Text>
      </View>

      <Pressable style={s.button} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.buttonText}>Begin & Submit Result</Text>
        )}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f7f8fc' },
  title: { fontSize: 30, fontWeight: '700', color: '#18204a', marginBottom: 8 },
  copy: { fontSize: 17, color: '#606582', marginBottom: 24 },
  testBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  testInstruction: {
    fontSize: 20,
    fontWeight: '600',
    color: '#18204a'
  },
  button: { backgroundColor: '#4255d4', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
