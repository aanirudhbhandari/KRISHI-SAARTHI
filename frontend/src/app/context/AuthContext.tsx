import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (user: User, token: string, options?: { persist?: boolean }) => void;
  signUp: (user: User, token: string, options?: { persist?: boolean }) => void;
  signOut: () => void;
}

const AUTH_STORAGE_KEY = "auth-state";
const AUTH_SESSION_KEY = "auth-session-state";

const defaultState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readAuthStorage(): AuthState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const storedValue =
    window.localStorage.getItem(AUTH_STORAGE_KEY) ??
    window.sessionStorage.getItem(AUTH_SESSION_KEY);

  if (!storedValue) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<AuthState>;
    if (parsed.user && parsed.token) {
      return {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: true,
      };
    }
  } catch {
    return defaultState;
  }

  return defaultState;
}

function writeAuthStorage(state: AuthState, persist: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(state);

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);

  // Default to sessionStorage to prevent persistent XSS exposure of tokens in localStorage
  if (persist) {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
  } else {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => readAuthStorage());

  useEffect(() => {
    if (!authState.isAuthenticated) {
      return;
    }

    const currentState = {
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
    };

    const hasPersistentState =
      typeof window !== "undefined" &&
      window.localStorage.getItem(AUTH_STORAGE_KEY) !== null;

    writeAuthStorage(currentState, hasPersistentState);
  }, [authState]);

  const setSession = (user: User, token: string, persist = false) => {
    const nextState: AuthState = {
      user,
      token,
      isAuthenticated: true,
    };

    setAuthState(nextState);
    writeAuthStorage(nextState, persist);
  };

  const signIn = (user: User, token: string, options?: { persist?: boolean }) => {
    setSession(user, token, options?.persist ?? false);
  };

  const signUp = (user: User, token: string, options?: { persist?: boolean }) => {
    setSession(user, token, options?.persist ?? true);
  };

  const signOut = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    }

    setAuthState(defaultState);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}