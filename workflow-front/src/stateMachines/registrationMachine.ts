import { createMachine } from 'xstate';

const registrationMachine = createMachine({
  id: 'registration',
  initial: 'idle',
  states: {
    idle: {
      on: { OPEN_FORM: 'formInput' }
    },
    formInput: {
      on: { SUBMIT_FORM: 'validating' }
    },
    validating: {
      on: {
        VALIDATION_SUCCESS: 'submitting',
        VALIDATION_FAILED: 'formInput'
      }
    },
    submitting: {
      on: {
        REGISTRATION_SUCCESS: 'emailVerification',
        API_ERROR: 'formInput'
      }
    },
    emailVerification: {
      on: {
        VERIFY_EMAIL_SUCCESS: 'completed',
        VERIFY_EMAIL_FAILED: 'formInput'
      }
    },
    completed: {
      type: 'final'
    }
  }
});

export default registrationMachine; 