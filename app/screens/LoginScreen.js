import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLoginContext } from '../components/LoginContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 22, paddingBottom: 40, backgroundColor: '#f7f8fc', flexGrow: 1, justifyContent: 'center' },
  heading: { fontSize: 27, fontWeight: '700', color: '#18204a', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderColor: '#cdd1e1', borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, height: 52, fontSize: 16, marginBottom: 13 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: '#cdd1e1', borderWidth: 1, borderRadius: 9, paddingRight: 14, height: 52, marginBottom: 13 },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 14, fontSize: 16 },
  button: { backgroundColor: '#4255d4', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#334ad1', fontSize: 16, fontWeight: '600' }
});

function PasswordField({ value, onChangeText, visible, onToggle, placeholder, testID, onSubmitEditing }) {
  return (
    <View style={s.passwordRow}>
      <TextInput 
        style={s.passwordInput} 
        placeholder={placeholder} 
        value={value} 
        onChangeText={onChangeText} 
        secureTextEntry={!visible} 
        autoCapitalize="none" 
        testID={testID}
        onSubmitEditing={onSubmitEditing}
      />
      <Pressable onPress={onToggle} accessibilityLabel={visible ? `Hide ${placeholder}` : `Show ${placeholder}`} testID={`${testID}-visibility-toggle`}>
        <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={25} color="#596080" />
      </Pressable>
    </View>
  );
}

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updateLoginState } = useLoginContext();

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Missing information', 'Please enter your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: normalizedEmail, password })
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('401');
        if (response.status >= 500) throw new Error('5xx');
        throw new Error('Network');
      }

      const tokenText = await response.text();
      const token = tokenText.trim();
      
      if (!token) {
        throw new Error('EmptyToken');
      }

      updateLoginState(normalizedEmail, token);
      
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });

    } catch (error) {
      if (error.message === '401') {
        Alert.alert('Login failed', 'Invalid email or password');
      } else if (error.message === '5xx') {
        Alert.alert('Login failed', 'The server is currently unavailable');
      } else if (error.message === 'EmptyToken') {
        Alert.alert('Login failed', 'Login response was invalid');
      } else {
        Alert.alert('Login failed', 'Unable to connect to the server');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.heading}>Welcome Back</Text>
        <TextInput 
          style={s.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
          testID="login-email-input"
          onSubmitEditing={handleLogin}
        />
        <PasswordField 
          value={password} 
          onChangeText={setPassword} 
          visible={showPassword} 
          onToggle={() => setShowPassword(v => !v)} 
          placeholder="Password" 
          testID="login-password-input"
          onSubmitEditing={handleLogin}
        />
        
        <Pressable 
          style={[s.button, submitting && s.disabled]} 
          onPress={handleLogin} 
          disabled={submitting} 
          testID="login-button"
        >
          <Text style={s.buttonText}>{submitting ? 'Logging in…' : 'Login'}</Text>
        </Pressable>

        <Pressable style={s.linkContainer} onPress={() => navigation.navigate('SignUp')} testID="go-to-signup-button">
          <Text style={s.linkText}>Don't have an account? Sign Up</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
