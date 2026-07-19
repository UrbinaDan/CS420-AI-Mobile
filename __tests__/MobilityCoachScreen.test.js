import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MobilityCoachScreen from '../app/screens/MobilityCoachScreen';
import * as LoginContextModule from '../app/components/LoginContext';
import { Alert } from 'react-native';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockLogout = jest.fn();
const mockNavigation = { navigate: mockNavigate, reset: mockReset };

describe('MobilityCoachScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('redirects to Login when not authenticated', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: false,
      sessionToken: null,
      logout: mockLogout
    });

    render(<MobilityCoachScreen navigation={mockNavigation} />);

    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  });

  it('renders correctly when authenticated', () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    const { getByText, getByTestId } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    expect(getByText('Mobility Coach')).toBeTruthy();
    expect(getByTestId('message-input')).toBeTruthy();
    expect(getByTestId('send-button')).toBeTruthy();
  });

  it('ignores whitespace-only message', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    const { getByTestId, queryByTestId } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, '   ');
    fireEvent.press(sendButton);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(queryByTestId('user-message')).toBeNull();
  });

  it('shows user message and sends request correctly', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'sess-123',
        message: 'Hello, how can I help?',
        safetyLevel: 'normal'
      })
    });

    const { getByTestId, getByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'My knee hurts.');
    fireEvent.press(sendButton);

    // Optimistic update
    expect(getByText('My knee hurts.')).toBeTruthy();
    
    // Check loading state
    expect(getByTestId('loading-state')).toBeTruthy();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/mobility-chat'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-suresteps-session-token': 'test-token'
          },
          body: JSON.stringify({ message: 'My knee hurts.' })
        }
      );
    });

    // Check assistant response
    await waitFor(() => {
      expect(getByText('Hello, how can I help?')).toBeTruthy();
      expect(getByTestId('assistant-message')).toBeTruthy();
    });
  });

  it('includes returned sessionId in subsequent requests', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    // First request
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'sess-123',
        message: 'Reply 1',
        safetyLevel: 'normal'
      })
    });

    // Second request
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'sess-123',
        message: 'Reply 2',
        safetyLevel: 'normal'
      })
    });

    const { getByTestId, getByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    // Send first msg
    fireEvent.changeText(input, 'Msg 1');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('Reply 1')).toBeTruthy();
    });

    // Send second msg
    fireEvent.changeText(input, 'Msg 2');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/api/mobility-chat'),
        expect.objectContaining({
          body: JSON.stringify({ message: 'Msg 2', sessionId: 'sess-123' })
        })
      );
    });
  });

  it('visibly labels caution response', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'sess-123',
        message: 'Take it easy.',
        safetyLevel: 'caution'
      })
    });

    const { getByTestId, getByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByTestId('message-input'), 'I feel dizzy.');
    fireEvent.press(getByTestId('send-button'));

    await waitFor(() => {
      expect(getByText('Take it easy.')).toBeTruthy();
      expect(getByTestId('caution-response')).toBeTruthy();
      expect(getByText('Caution')).toBeTruthy();
    });
  });

  it('visibly labels urgent response', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'sess-123',
        message: 'Call emergency.',
        safetyLevel: 'urgent'
      })
    });

    const { getByTestId, getByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByTestId('message-input'), 'Chest pain.');
    fireEvent.press(getByTestId('send-button'));

    await waitFor(() => {
      expect(getByText('Call emergency.')).toBeTruthy();
      expect(getByTestId('urgent-response')).toBeTruthy();
      expect(getByText('Urgent Safety Notice')).toBeTruthy();
    });
  });

  it('handles API failure safely and restores user input', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId, queryByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Will fail');
    fireEvent.press(sendButton);

    await waitFor(() => {
      // Optimistic message should be removed
      expect(queryByText('Will fail')).toBeNull();
      // Input text should be restored
      expect(input.props.value).toBe('Will fail');
      // Alert should have been shown
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to send message. Please try again.');
    });
  });

  it('redirects to Login on 401 response', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const { getByTestId } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    fireEvent.changeText(getByTestId('message-input'), 'Hello');
    fireEvent.press(getByTestId('send-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Session Expired', 'Please log in again.');
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('prevents duplicate submissions while loading', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    let resolveFetch;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });

    global.fetch.mockReturnValue(fetchPromise);

    const { getByTestId, getAllByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Multiple click');
    fireEvent.press(sendButton);
    fireEvent.press(sendButton);
    fireEvent.press(sendButton);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    act(() => {
      resolveFetch({
        ok: true,
        status: 200,
        json: async () => ({
          sessionId: 'sess-123',
          message: 'Done',
          safetyLevel: 'normal'
        })
      });
    });

    await waitFor(() => {
      expect(getAllByText('Done')).toBeTruthy();
    });
  });

  it('rejects malformed API responses', async () => {
    jest.spyOn(LoginContextModule, 'useLoginContext').mockReturnValue({
      isAuthenticated: true,
      sessionToken: 'test-token',
      logout: mockLogout
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        // Missing sessionId, wrong safetyLevel
        message: 'Invalid',
        safetyLevel: 'invalid'
      })
    });

    const { getByTestId, queryByText } = render(<MobilityCoachScreen navigation={mockNavigation} />);
    
    const input = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Test invalid');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(queryByText('Test invalid')).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to send message. Please try again.');
    });
  });
});
