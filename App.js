import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './app/screens/HomeScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import NotificationScreen from './app/screens/NotificationScreen';
import MobilityCoachScreen from './app/screens/MobilityCoachScreen';
import ChatRegistrationScreen from './app/screens/ChatRegistrationScreen';

const Stack = createNativeStackNavigator();
export default function App(){return <NavigationContainer><Stack.Navigator><Stack.Screen name="Home" component={HomeScreen} options={{title:'STEDI'}}/><Stack.Screen name="SignUp" component={SignUpScreen} options={{title:'Create Account'}}/><Stack.Screen name="Notifications" component={NotificationScreen} options={{title:'Notifications'}}/><Stack.Screen name="MobilityCoach" component={MobilityCoachScreen} options={{title:'Mobility Coach'}}/><Stack.Screen name="ChatRegistration" component={ChatRegistrationScreen} options={{title:'Chat Registration'}}/></Stack.Navigator></NavigationContainer>}
