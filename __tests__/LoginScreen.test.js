import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/screens/LoginScreen';
import * as LoginContextModule from '../app/components/LoginContext';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }) => <Text>{name}</Text> };
});

const mockUpdateLoginState = jest.fn();
jest.mock('../app/components/LoginContext', () => ({
  useLoginContext: () => ({
    updateLoginState: mockUpdateLoginState
  })
}));

const navigation = { navigate: jest.fn(), reset: jest.fn() };
const route = { params: {} };

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders login form correctly', () => {
  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  expect(screen.getByTestId('login-email-input')).toBeTruthy();
  expect(screen.getByTestId('login-password-input')).toBeTruthy();
  expect(screen.getByTestId('login-button')).toBeTruthy();
  expect(screen.getByTestId('go-to-signup-button')).toBeTruthy();
});

test('password input retains focus and state when typing', () => {
  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  const passwordInput = screen.getByTestId('login-password-input');
  
  fireEvent(passwordInput, 'focus');
  fireEvent.changeText(passwordInput, 'p');
  fireEvent.changeText(passwordInput, 'pa');
  fireEvent.changeText(passwordInput, 'pas');
  
  const currentPasswordInput = screen.getByTestId('login-password-input');
  expect(currentPasswordInput).toBe(passwordInput);
  expect(currentPasswordInput.props.value).toBe('pas');
});

test('posts to /login and handles successful response', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue('  my-session-token  ')
  });

  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  fireEvent.changeText(screen.getByTestId('login-email-input'), '  Student@EXAMPLE.com  ');
  fireEvent.changeText(screen.getByTestId('login-password-input'), 'secret123');
  fireEvent.press(screen.getByTestId('login-button'));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  const [url, request] = fetch.mock.calls[0];
  expect(url).toBe('http://localhost:3000/login');
  expect(request.method).toBe('POST');
  expect(JSON.parse(request.body)).toEqual({
    userName: 'student@example.com',
    password: 'secret123'
  });

  await waitFor(() => {
    expect(mockUpdateLoginState).toHaveBeenCalledWith('student@example.com', 'my-session-token');
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  });
});

test('handles 401 unauthorized', async () => {
  fetch.mockResolvedValue({ ok: false, status: 401 });
  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  fireEvent.changeText(screen.getByTestId('login-email-input'), 'test@test.com');
  fireEvent.changeText(screen.getByTestId('login-password-input'), 'wrong');
  fireEvent.press(screen.getByTestId('login-button'));

  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Login failed', 'Invalid email or password');
  });
});

test('handles network failure', async () => {
  fetch.mockRejectedValue(new Error('offline'));
  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  fireEvent.changeText(screen.getByTestId('login-email-input'), 'test@test.com');
  fireEvent.changeText(screen.getByTestId('login-password-input'), 'pw');
  fireEvent.press(screen.getByTestId('login-button'));

  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Login failed', 'Unable to connect to the server');
  });
});

test('handles empty token', async () => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue('   ')
  });
  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  fireEvent.changeText(screen.getByTestId('login-email-input'), 'test@test.com');
  fireEvent.changeText(screen.getByTestId('login-password-input'), 'pw');
  fireEvent.press(screen.getByTestId('login-button'));

  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Login failed', 'Login response was invalid');
  });
});

test('navigates to SignUp screen when link is pressed', () => {
  const screen = render(<LoginScreen navigation={navigation} route={route} />);
  fireEvent.press(screen.getByTestId('go-to-signup-button'));
  expect(navigation.navigate).toHaveBeenCalledWith('SignUp');
});

test('prefills email from route params', () => {
  const routeWithEmail = { params: { email: 'prefilled@example.com' } };
  const screen = render(<LoginScreen navigation={navigation} route={routeWithEmail} />);
  expect(screen.getByTestId('login-email-input').props.value).toBe('prefilled@example.com');
});
