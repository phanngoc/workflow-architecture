import { createMachine } from 'xstate';

export const loginMachine = createMachine({
  id: 'login',
  initial: 'idle',
  context: {
    email: '',
    password: '',
    mfaCode: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        OPEN_FORM: {
          target: 'formInput'
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
          target: 'authenticating'
        },
        VALIDATION_FAILED: {
          target: 'formInput',
        }
      }
    },
    authenticating: {
      on: {
        AUTH_SUCCESS: {
          target: 'success'
        },
        AUTH_FAILED: {
          target: 'formInput',
        },
        REQUIRE_MFA: {
          target: 'mfaRequired'
        }
      }
    },
    mfaRequired: {
      on: {
        SUBMIT_MFA: {
          target: 'authenticating',
        }
      }
    },
    success: {
      type: 'final'
    }
  }
}); 