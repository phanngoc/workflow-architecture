import { createMachine } from 'xstate';

const loginMachine = createMachine({
  id: 'login',
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
        VALIDATION_SUCCESS: 'authenticating',
        VALIDATION_FAILED: 'formInput'
      }
    },
    authenticating: {
      on: {
        AUTH_SUCCESS: 'success',
        AUTH_FAILED: 'formInput',
        REQUIRE_MFA: 'mfaRequired'
      }
    },
    mfaRequired: {
      on: { SUBMIT_MFA: 'authenticating' }
    },
    success: {
      type: 'final'
    }
  }
});

export default loginMachine; 