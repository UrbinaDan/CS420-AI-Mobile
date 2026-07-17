import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../app/screens/HomeScreen';
import * as LoginContextModule from '../app/components/LoginContext';

describe('HomeScreen', () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders public view when not authenticated', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: false,
      userName: null,
      logout: mockLogout
    });

    const { getByText, queryByText } = render(<HomeScreen navigation={{ navigate: mockNavigate }} />);
    
    expect(getByText('Welcome to STEDI')).toBeTruthy();
    expect(getByText('Create an account to get started.')).toBeTruthy();
    expect(queryByText('Available Now')).toBeNull();
  });

  it('renders authenticated dashboard when authenticated', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      userName: 'test@example.com',
      logout: mockLogout
    });

    const { getByText, getAllByText } = render(<HomeScreen navigation={{ navigate: mockNavigate }} />);
    
    // Header & User info
    expect(getByText('Welcome to STEDI')).toBeTruthy();
    expect(getByText('You are logged in as test@example.com')).toBeTruthy();
    expect(getByText('Available Now')).toBeTruthy();
    expect(getAllByText('Coming Soon').length).toBeGreaterThan(0);

    // Functional Cards
    expect(getByText('Mobility Coach')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Demo: AI-Assisted Registration')).toBeTruthy();
    expect(getByText('Balance Test')).toBeTruthy();
    expect(getByText('Care Plan')).toBeTruthy();
    expect(getByText('Voice Analysis')).toBeTruthy();

    // Coming Soon Cards
    expect(getByText('Clinician Requests')).toBeTruthy();
    expect(getByText('Human Coach Status')).toBeTruthy();
    expect(getByText('Settings & Accessibility')).toBeTruthy();
  });

  it('functional cards navigate correctly', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      userName: 'test@example.com',
      logout: mockLogout
    });

    const { getByText } = render(<HomeScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText('Mobility Coach'));
    expect(mockNavigate).toHaveBeenCalledWith('MobilityCoach');

    fireEvent.press(getByText('Notifications'));
    expect(mockNavigate).toHaveBeenCalledWith('Notifications');

    fireEvent.press(getByText('Demo: AI-Assisted Registration'));
    expect(mockNavigate).toHaveBeenCalledWith('ChatRegistration');
  });

  it('Coming Soon cards do not navigate', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      userName: 'test@example.com',
      logout: mockLogout
    });

    const { getByText } = render(<HomeScreen navigation={{ navigate: mockNavigate }} />);
    
    // Settings card
    fireEvent.press(getByText('Settings & Accessibility'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('Logout clears context', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      userName: 'test@example.com',
      logout: mockLogout
    });

    const { getByText } = render(<HomeScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
