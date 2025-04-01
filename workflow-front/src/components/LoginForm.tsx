import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { loginMachine } from '../machines/loginMachine';
import { authService } from '../services/api';

export const LoginForm: React.FC = () => {
  const [state, send] = useMachine(loginMachine);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!credentials.email || !credentials.password) {
      setError('Email and password are required');
      send({ type: 'VALIDATION_FAILED' });
      return;
    }
    
    // Send form data to the state machine
    send({ type: 'SUBMIT_FORM' });
    send({ type: 'VALIDATION_SUCCESS' });
    
    try {
      const response = await authService.login(credentials);
      if (response.requireMFA) {
        send({ type: 'REQUIRE_MFA' });
      } else {
        send({ type: 'AUTH_SUCCESS' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      send({ type: 'AUTH_FAILED' });
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!mfaCode) {
      setError('MFA code is required');
      return;
    }
    
    try {
      await authService.submitMFA(mfaCode);
      send({ type: 'SUBMIT_MFA' });
      send({ type: 'AUTH_SUCCESS' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid MFA code';
      setError(errorMessage);
      send({ type: 'AUTH_FAILED' });
    }
  };

  return (
    <div className="login-form">
      {state.matches('idle') && (
        <button onClick={() => send({ type: 'OPEN_FORM' })}>
          Login
        </button>
      )}

      {state.matches('formInput') && (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">{error}</div>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Login</button>
        </form>
      )}

      {state.matches('mfaRequired') && (
        <form onSubmit={handleMFASubmit}>
          {error && (
            <div className="error-message">{error}</div>
          )}
          <input
            type="text"
            placeholder="Enter MFA Code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            required
          />
          <button type="submit">Verify</button>
        </form>
      )}

      {state.matches('success') && (
        <div>
          Login successful!
        </div>
      )}
    </div>
  );
}; 