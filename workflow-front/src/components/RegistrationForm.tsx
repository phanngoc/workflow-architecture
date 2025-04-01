import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { registrationMachine } from '../machines/registrationMachine';
import { authService } from '../services/api';

export const RegistrationForm: React.FC = () => {
  const [state, send] = useMachine(registrationMachine);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.email || !formData.password || !formData.username) {
      setError('All fields are required');
      send({ type: 'VALIDATION_FAILED' });
      return;
    }
    
    // Send form data to the state machine
    send({ type: 'SUBMIT_FORM' });
    
    send({ type: 'VALIDATION_SUCCESS' });
    
    try {
      await authService.register(formData);
      send({ type: 'REGISTRATION_SUCCESS' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      send({ type: 'API_ERROR' });
    }
  };

  return (
    <div className="registration-form">
      {state.matches('idle') && (
        <button onClick={() => send({ type: 'OPEN_FORM' })}>
          Register Now
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
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Register</button>
        </form>
      )}

      {state.matches('emailVerification') && (
        <div>
          Please check your email to verify your account
        </div>
      )}

      {state.matches('completed') && (
        <div>
          Registration completed! You can now login.
        </div>
      )}
    </div>
  );
}; 