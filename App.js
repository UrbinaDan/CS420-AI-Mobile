import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './app/screens/HomeScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import NotificationScreen from './app/screens/NotificationScreen';

const Stack = createNativeStackNavigator();
export default function App(){return <NavigationContainer><Stack.Navigator><Stack.Screen name="Home" component={HomeScreen} options={{title:'STEDI'}}/><Stack.Screen name="SignUp" component={SignUpScreen} options={{title:'Create Account'}}/><Stack.Screen name="Notifications" component={NotificationScreen} options={{title:'Notifications'}}/></Stack.Navigator></NavigationContainer>}
