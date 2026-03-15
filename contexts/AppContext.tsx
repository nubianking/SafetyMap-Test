import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LiveAlert } from '../types';
import { UserProfileData } from '../components/profile/MapperProfile';
import { forceReLogin } from '../services/api';

interface AppContextType {
  liveAlerts: LiveAlert[];
  currentUser: UserProfileData | null;
  setLiveAlerts: React.Dispatch<React.SetStateAction<LiveAlert[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfileData | null>>;
  handleNewAlert: (alert: LiveAlert) => Promise<void>;
  login: (alias: string, passkey: string) => Promise<boolean>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Helper: get stored JWT token
  const getToken = (): string | null => {
    try { return localStorage.getItem('authToken'); } catch { return null; }
  };

  // Helper: build Authorization headers
  const authHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const login = async (alias: string, passkey: string) => {
    try {
      const res = await fetch('/api/mappers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias, passkey })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const { token, profile } = json.data as { token: string; profile: UserProfileData };
        setCurrentUser(profile);
        try {
          localStorage.setItem('currentUser', JSON.stringify(profile));
          localStorage.setItem('authToken', token);
        } catch {}
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login failed', e);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch {}
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      try {
        const response = await fetch('/api/alerts', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result; // Handle both {data: []} and direct array
          setLiveAlerts(Array.isArray(data) ? data.slice(0, 10) : []);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn('Fetch alerts timed out');
        } else {
          console.error('Failed to fetch alerts:', error);
        }
      }
    };
    fetchAlerts();
  }, []);

  const handleNewAlert = async (alert: LiveAlert) => {
    setLiveAlerts(prev => [alert, ...prev].slice(0, 10));

    if (alert.label.toLowerCase().includes('weapon')) {
      console.log("CRITICAL WEAPON ALERT DETECTED");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(alert),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to post alert' }));
        
        // Handle auth errors - force re-login on 401 or permission-related 403
        if (response.status === 401 || response.status === 403) {
          const errorMessage = errorData.error || '';
          const isAuthRelated = response.status === 401 || 
            ['permission', 'forbidden', 'unauthorized', 'invalid token', 'signature', 'jwt', 'auth']
              .some(keyword => errorMessage.toLowerCase().includes(keyword.toLowerCase()));
          
          if (isAuthRelated) {
            console.warn(`[AppContext] Auth error (${response.status}): ${errorMessage}`);
            forceReLogin('session_expired');
            return;
          }
        }
        
        console.error('Failed to post alert:', errorData.error);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Post alert timed out');
      } else {
        console.error('Failed to post alert:', error);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      liveAlerts,
      currentUser,
      setLiveAlerts,
      setCurrentUser,
      handleNewAlert,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};