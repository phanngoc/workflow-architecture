import { createMachine, interpret } from 'xstate';
import { getWorkflowState, updateWorkflowState, UserCredentials } from './apiService';

// Define workflow states
export const WORKFLOW_STATES = {
  INITIAL: 'initial',
  REGISTRATION: 'registration',
  LOGIN: 'login',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

// Create workflow machine
export const createWorkflowMachine = (userEmail: string) =>
  createMachine({
    id: 'workflow',
    initial: WORKFLOW_STATES.INITIAL,
    context: {
      userEmail,
      error: null
    },
    states: {
      [WORKFLOW_STATES.INITIAL]: {
        on: {
          START_REGISTRATION: WORKFLOW_STATES.REGISTRATION,
          START_LOGIN: WORKFLOW_STATES.LOGIN
        }
      },
      [WORKFLOW_STATES.REGISTRATION]: {
        on: {
          REGISTRATION_SUCCESS: WORKFLOW_STATES.COMPLETED,
          REGISTRATION_ERROR: WORKFLOW_STATES.ERROR
        }
      },
      [WORKFLOW_STATES.LOGIN]: {
        on: {
          LOGIN_SUCCESS: WORKFLOW_STATES.COMPLETED,
          LOGIN_ERROR: WORKFLOW_STATES.ERROR
        }
      },
      [WORKFLOW_STATES.COMPLETED]: {
        type: 'final'
      },
      [WORKFLOW_STATES.ERROR]: {
        on: {
          RETRY: WORKFLOW_STATES.INITIAL
        }
      }
    }
  });

// Workflow service class
export class WorkflowService {
  private userEmail: string;
  private service: any;

  constructor(userEmail: string) {
    this.userEmail = userEmail;
    this.service = interpret(createWorkflowMachine(userEmail));
  }

  // Start the workflow service
  start() {
    this.service.start();
    this.syncWithServer();
  }

  // Stop the workflow service
  stop() {
    this.service.stop();
  }

  // Get current state
  getCurrentState() {
    return this.service.state.value;
  }

  // Sync state with server
  private async syncWithServer() {
    try {
      const state = await getWorkflowState(this.userEmail);
      if (state.current_state !== this.getCurrentState()) {
        await this.transition(state.current_state);
      }
    } catch (error) {
      console.error('Failed to sync with server:', error);
    }
  }

  // Transition to a new state
  async transition(newState: string, data?: any) {
    try {
      await updateWorkflowState(this.userEmail, newState, data);
      this.service.send({ type: newState });
    } catch (error) {
      console.error('Failed to transition state:', error);
      this.service.send({ type: 'ERROR' });
    }
  }

  // Subscribe to state changes
  subscribe(callback: (state: any) => void) {
    return this.service.subscribe(callback);
  }
} 