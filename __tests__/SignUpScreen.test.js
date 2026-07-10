import React from 'react';
import {Alert, Pressable, Text, View} from 'react-native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import SignUpScreen from '../app/screens/SignUpScreen';

jest.mock('@expo/vector-icons',()=>{const {Text}=require('react-native');return {Ionicons:({name})=><Text>{name}</Text>};});
jest.mock('react-native-element-dropdown',()=>{const {Pressable,Text}=require('react-native');return {
  Dropdown:(props)=><Pressable testID={props.testID} accessibilityValue={{text:props.value}} onPress={()=>props.onChange({value:'CA'})}><Text>{props.value}</Text></Pressable>
};});

const navigation={navigate:jest.fn()};
const fillForm=(screen)=>{
 fireEvent.changeText(screen.getByTestId('email-input'),'student@example.com');
 fireEvent.changeText(screen.getByTestId('birth-date-input'),'2000-01-02');
 fireEvent.changeText(screen.getByTestId('phone-input'),'8015550100');
 fireEvent.changeText(screen.getByTestId('password-input'),'secret123');
 fireEvent.changeText(screen.getByTestId('confirm-password-input'),'secret123');
 fireEvent.press(screen.getByTestId('sms-consent-checkbox'));
 fireEvent.press(screen.getByTestId('terms-checkbox'));
};

beforeEach(()=>{jest.clearAllMocks();global.fetch=jest.fn();jest.spyOn(Alert,'alert').mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());

test('renders every required field, dropdown, checkbox, and button',()=>{
 const screen=render(<SignUpScreen navigation={navigation}/>);
 ['email-input','birth-date-input','phone-input','country-code-dropdown','password-input','confirm-password-input','sms-consent-checkbox','terms-checkbox','sign-up-button'].forEach(id=>expect(screen.getByTestId(id)).toBeTruthy());
 expect(screen.getByTestId('country-code-dropdown').props.accessibilityValue.text).toBe('US');
 expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(true);
 expect(screen.getByTestId('confirm-password-input').props.secureTextEntry).toBe(true);
});

test('toggles password visibility independently',()=>{
 const screen=render(<SignUpScreen navigation={navigation}/>);
 fireEvent.press(screen.getByTestId('password-input-visibility-toggle'));
 expect(screen.getByTestId('password-input').props.secureTextEntry).toBe(false);
 expect(screen.getByTestId('confirm-password-input').props.secureTextEntry).toBe(true);
 fireEvent.press(screen.getByTestId('confirm-password-input-visibility-toggle'));
 expect(screen.getByTestId('confirm-password-input').props.secureTextEntry).toBe(false);
});

test('alerts when required fields are empty',()=>{
 const screen=render(<SignUpScreen navigation={navigation}/>);
 fireEvent.press(screen.getByTestId('sign-up-button'));
 expect(Alert.alert).toHaveBeenCalledWith('Missing information','Please complete all fields.');
 expect(fetch).not.toHaveBeenCalled();
});

test('alerts when passwords do not match',()=>{
 const screen=render(<SignUpScreen navigation={navigation}/>);
 fillForm(screen);
 fireEvent.changeText(screen.getByTestId('confirm-password-input'),'different');
 fireEvent.press(screen.getByTestId('sign-up-button'));
 expect(Alert.alert).toHaveBeenCalledWith('Passwords do not match','Please enter matching passwords.');
 expect(fetch).not.toHaveBeenCalled();
});

test('posts the expected STEDI payload and returns home',async()=>{
 fetch.mockResolvedValue({ok:true,status:200});
 const screen=render(<SignUpScreen navigation={navigation}/>);
 fillForm(screen);
 fireEvent.press(screen.getByTestId('sign-up-button'));
 await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(1));
 const [url,request]=fetch.mock.calls[0];
 expect(url).toBe('https://dev.stedi.me/user');
 expect(request.method).toBe('POST');
 expect(request.headers).toEqual({'Content-Type':'application/json'});
 const body=JSON.parse(request.body);
 expect(body).toMatchObject({userName:'student@example.com',email:'student@example.com',phone:'8015550100',region:'US',birthDate:'2000-01-02',password:'secret123',verifyPassword:'secret123'});
 ['agreedToTermsOfUseDate','agreedToCookiePolicyDate','agreedToPrivacyPolicyDate','agreedToTextMessageDate'].forEach(key=>expect(new Date(body[key]).toString()).not.toBe('Invalid Date'));
 await waitFor(()=>expect(navigation.navigate).toHaveBeenCalledWith('Home'));
});

test('alerts when the STEDI request fails',async()=>{
 fetch.mockRejectedValue(new Error('offline'));
 const screen=render(<SignUpScreen navigation={navigation}/>);
 fillForm(screen);
 fireEvent.press(screen.getByTestId('sign-up-button'));
 await waitFor(()=>expect(Alert.alert).toHaveBeenCalledWith('Sign up failed','We could not create your account. Please try again.'));
});

