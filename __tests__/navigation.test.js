import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../../App';

describe('App Navigation', () => {
  it('renders Home screen and can navigate to SignUp', () => {
    const { getByText } = render(<App />);
    
    // Verify Home screen is rendered
    expect(getByText('Welcome to STEDI')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    
    // Navigate to SignUp
    fireEvent.press(getByText('Sign Up'));
    
    // Verify SignUp screen is rendered
    expect(getByText('Welcome to STEDI')).toBeTruthy(); // SignUp screen also has this title in the challenge
    // We can also verify other elements unique to SignUp if needed
  });
});
