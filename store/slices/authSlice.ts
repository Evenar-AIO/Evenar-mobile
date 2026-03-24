import type { User } from '@/features/auth/types/authTypes';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'HYDRATE_START' }
  | { type: 'HYDRATE_DONE'; payload: { user: User | null; accessToken: string | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SESSION'; payload: { user: User; accessToken: string } }
  | { type: 'CLEAR_SESSION' };

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: true,
  loading: false,
  error: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE_START':
      return {
        ...state,
        isHydrating: true,
      };
    case 'HYDRATE_DONE': {
      const { user, accessToken } = action.payload;

      return {
        ...state,
        user,
        accessToken,
        isAuthenticated: Boolean(accessToken),
        isHydrating: false,
      };
    }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        error: null,
      };
    case 'CLEAR_SESSION':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
}
