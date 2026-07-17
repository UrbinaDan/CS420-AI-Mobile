import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLoginContext } from '../components/LoginContext';

export default function HomeScreen({ navigation }) {
  const { isAuthenticated, userName, logout } = useLoginContext();

  if (isAuthenticated) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.contentContainer}>
        <Text style={s.title}>Welcome to STEDI</Text>
        <Text style={s.copy}>You are logged in as {userName}</Text>
        
        <Text style={s.sectionHeader}>Available Now</Text>
        
        <Pressable 
          style={s.card} 
          onPress={() => navigation.navigate('MobilityCoach')}
          accessibilityRole="button"
          accessibilityLabel="Open Mobility Coach"
        >
          <Text style={s.cardTitle}>Mobility Coach</Text>
          <Text style={s.cardDescription}>Ask questions about your results or exercise plan</Text>
        </Pressable>

        <Pressable 
          style={s.card} 
          onPress={() => navigation.navigate('Notifications')}
          accessibilityRole="button"
          accessibilityLabel="Open Notifications"
        >
          <Text style={s.cardTitle}>Notifications</Text>
          <Text style={s.cardDescription}>Share your data with a physician</Text>
        </Pressable>

        <Pressable 
          style={s.card} 
          onPress={() => navigation.navigate('ChatRegistration')}
          accessibilityRole="button"
          accessibilityLabel="Open Demo AI-Assisted Registration"
        >
          <Text style={s.cardTitle}>Demo: AI-Assisted Registration</Text>
          <Text style={s.cardDescription}>Try the interactive voice and text registration assistant</Text>
        </Pressable>

        <Pressable 
          style={s.card} 
          onPress={() => navigation.navigate('BalanceTest')}
          accessibilityRole="button"
          accessibilityLabel="Open Balance Test"
        >
          <Text style={s.cardTitle}>Balance Test</Text>
          <Text style={s.cardDescription}>Complete your rapid step exercise</Text>
        </Pressable>

        <Pressable 
          style={s.card} 
          onPress={() => navigation.navigate('CarePlan')}
          accessibilityRole="button"
          accessibilityLabel="Open Care Plan"
        >
          <Text style={s.cardTitle}>Care Plan</Text>
          <Text style={s.cardDescription}>View your mobility score and exercises</Text>
        </Pressable>

        <Pressable 
          style={s.card} 
          onPress={() => navigation.navigate('VoiceAnalysis')}
          accessibilityRole="button"
          accessibilityLabel="Open Voice Analysis"
        >
          <Text style={s.cardTitle}>Voice Analysis</Text>
          <Text style={s.cardDescription}>Analyze vocal markers for mobility</Text>
        </Pressable>

        <Text style={s.sectionHeader}>Coming Soon</Text>
        
        {[
          { title: "Clinician Requests", description: "Manage physician data access" },
          { title: "Human Coach Status", description: "Track your escalated questions" },
          { title: "Settings & Accessibility", description: "Manage your app preferences" }
        ].map(item => (
          <View 
            key={item.title} 
            style={[s.card, s.cardDisabled]}
            accessibilityState={{ disabled: true }}
            accessible={true}
          >
            <View style={s.comingSoonBadge}><Text style={s.comingSoonText}>Coming Soon</Text></View>
            <Text style={[s.cardTitle, s.cardTitleDisabled]}>{item.title}</Text>
            <Text style={[s.cardDescription, s.cardDescriptionDisabled]}>{item.description}</Text>
          </View>
        ))}

        <Pressable style={s.button} onPress={logout}>
          <Text style={s.buttonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Welcome to STEDI</Text>
      <Text style={s.copy}>Create an account to get started.</Text>
      <Pressable style={s.button} onPress={() => navigation.navigate('SignUp')} testID="go-to-signup">
        <Text style={s.buttonText}>Sign Up</Text>
      </Pressable>
      <Pressable style={[s.button, s.loginButton]} onPress={() => navigation.navigate('Login')} testID="go-to-login">
        <Text style={s.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fc' },
  contentContainer: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '700', color: '#18204a', marginBottom: 4 },
  copy: { fontSize: 16, color: '#606582', marginBottom: 16 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#18204a', marginTop: 16, marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardDisabled: { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', shadowOpacity: 0, elevation: 0 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  cardTitleDisabled: { color: '#94a3b8' },
  cardDescription: { fontSize: 14, color: '#64748b' },
  cardDescriptionDisabled: { color: '#94a3b8' },
  comingSoonBadge: { alignSelf: 'flex-start', backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  comingSoonText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  button: { backgroundColor: '#4255d4', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  loginButton: { marginTop: 15, backgroundColor: '#596080' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' }
});
