import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MobilityCoachScreen from '../app/screens/MobilityCoachScreen';
import NotificationScreen from '../app/screens/NotificationScreen';
import ChatRegistrationScreen from '../app/screens/ChatRegistrationScreen';
import * as LoginContextModule from '../app/components/LoginContext';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}));

describe('Protected Routes', () => {
  const mockReset = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('MobilityCoach redirects to Login when not authenticated', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: false
    });

    const { queryByText } = render(<MobilityCoachScreen navigation={{ reset: mockReset }} />);
    
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Login' }]
    });
    
    // Should not render private content
    expect(queryByText('Mobility Coach')).toBeNull();
  });

  it('Notifications redirects to Login when not authenticated', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: false
    });

    const { queryByText } = render(<NotificationScreen navigation={{ reset: mockReset }} />);
    
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Login' }]
    });
    
    // Should not render private content
    expect(queryByText('Share Your Data with a Physician')).toBeNull();
  });

  it('ChatRegistration remains accessible when not authenticated', () => {
    // ChatRegistration doesn't even use LoginContext, but we'll test it renders correctly
    const { getByText } = render(<ChatRegistrationScreen navigation={{ navigate: mockNavigate }} />);
    
    expect(getByText('Send')).toBeTruthy();
  });
});
