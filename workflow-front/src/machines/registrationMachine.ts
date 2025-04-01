import { createMachine } from 'xstate';

export const registrationMachine = createMachine({
  id: 'registration',
  initial: 'idle',
  context: {
    email: '',
    password: '',
    username: '',
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN_FORM: {
          target: 'formInput',
        }
      }
    },
    formInput: {
      on: {
        SUBMIT_FORM: {
          target: 'validating',
        }
      }
    },
    validating: {
      on: {
        VALIDATION_SUCCESS: {
          target: 'submitting',
        },
        VALIDATION_FAILED: {
          target: 'formInput',
        }
      }
    },
    submitting: {
      on: {
        REGISTRATION_SUCCESS: {
          target: 'emailVerification',
        },
        API_ERROR: {
          target: 'formInput',
        }
      }
    },
    emailVerification: {
      on: {
        VERIFY_EMAIL_SUCCESS: {
          target: 'completed',
        },
        VERIFY_EMAIL_FAILED: {
          target: 'emailVerification',
        }
      }
    },
    completed: {
      type: 'final'
    }
  }
}); 