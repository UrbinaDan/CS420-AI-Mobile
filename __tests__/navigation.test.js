import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

describe('App Navigation', () => {
  it('renders Home screen and can navigate to SignUp', async () => {
    const { getByTestId, getByText } = render(<App />);
    
    // Verify Home screen is rendered
    await waitFor(() => expect(getByText('Welcome to STEDI')).toBeTruthy());
    expect(getByTestId('go-to-signup')).toBeTruthy();
    expect(getByTestId('go-to-login')).toBeTruthy();
    
    // Navigate to SignUp
    fireEvent.press(getByTestId('go-to-signup'));
    await waitFor(() => expect(getByText('Create your account')).toBeTruthy());
  });
  
  it('renders Home screen and can navigate to Login', async () => {
    const { getByTestId, getByText } = render(<App />);
    
    // Navigate to Login
    await waitFor(() => expect(getByTestId('go-to-login')).toBeTruthy());
    fireEvent.press(getByTestId('go-to-login'));
    await waitFor(() => expect(getByText('Welcome Back')).toBeTruthy());
  });
});
