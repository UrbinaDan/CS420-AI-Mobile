import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './app/screens/HomeScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import LoginScreen from './app/screens/LoginScreen';
import NotificationScreen from './app/screens/NotificationScreen';
import MobilityCoachScreen from './app/screens/MobilityCoachScreen';
import ChatRegistrationScreen from './app/screens/ChatRegistrationScreen';
import BalanceTestScreen from './app/screens/BalanceTestScreen';
import CarePlanScreen from './app/screens/CarePlanScreen';
import VoiceAnalysisScreen from './app/screens/VoiceAnalysisScreen';
import { LoginProvider } from './app/components/LoginContext';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    "http://localhost:8081",
    "exp://"
  ],
  config: {
    screens: {
      Home: "",
      Login: "login",
      SignUp: "signup",
      MobilityCoach: "mobility-coach",
      Notifications: "notifications",
      ChatRegistration: "chat-registration",
      BalanceTest: "balance-test",
      CarePlan: "care-plan",
      VoiceAnalysis: "voice-analysis"
    }
  }
};

export default function App() {
  return (
    <LoginProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{title:'STEDI'}}/>
          <Stack.Screen name="Login" component={LoginScreen} options={{title:'Login'}}/>
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{title:'Create Account'}}/>
          <Stack.Screen name="Notifications" component={NotificationScreen} options={{title:'Notifications'}}/>
          <Stack.Screen name="MobilityCoach" component={MobilityCoachScreen} options={{title:'Mobility Coach'}}/>
          <Stack.Screen name="ChatRegistration" component={ChatRegistrationScreen} options={{title:'Chat Registration'}}/>
          <Stack.Screen name="BalanceTest" component={BalanceTestScreen} options={{title:'Balance Test'}}/>
          <Stack.Screen name="CarePlan" component={CarePlanScreen} options={{title:'Care Plan'}}/>
          <Stack.Screen name="VoiceAnalysis" component={VoiceAnalysisScreen} options={{title:'Voice Analysis'}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </LoginProvider>
  );
}
