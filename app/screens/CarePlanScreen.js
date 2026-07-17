import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLoginContext } from '../components/LoginContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function CarePlanScreen({ navigation }) {
  const { isAuthenticated, userName } = useLoginContext();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
      <Text style={s.title}>My Care Plan</Text>
      <Text style={s.copy}>View your upcoming exercises and goals set by your clinician.</Text>
      
      <View style={s.card}>
        <Text style={s.cardTitle}>Daily Routine</Text>
        <Text style={s.cardDescription}>1. 10x Sit-to-stands</Text>
        <Text style={s.cardDescription}>2. 5 min Walk</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Latest Rapid Step Test</Text>
        <Text style={s.cardDescription}>Score: 85 (Good stability)</Text>
      </View>

      <Pressable style={s.button} onPress={() => navigation.navigate('MobilityCoach')}>
        <Text style={s.buttonText}>Ask Coach</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  contentContainer: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '700', color: '#18204a', marginBottom: 8 },
  copy: { fontSize: 17, color: '#606582', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  cardDescription: { fontSize: 16, color: '#64748b', marginBottom: 4 },
  button: { backgroundColor: '#4255d4', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
