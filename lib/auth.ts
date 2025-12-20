// Authentication utility using API
const AUTH_KEY = "levelsproshop_auth";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sabinabruno.pythonanywhere.com/";

export interface AuthUser {
  username: string;
  email?: string;
  user_id?: number;
  token: string;
  loggedIn: boolean;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
}

// Login using API endpoint
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}api/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      const loginData: LoginResponse = data.data;
      const user: AuthUser = {
        username: loginData.username,
        email: loginData.email,
        user_id: loginData.user_id,
        token: loginData.token,
        loggedIn: true,
      };
      
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return false;
  try {
    const user: AuthUser = JSON.parse(authData);
    return user.loggedIn === true && !!user.token;
  } catch {
    return false;
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  try {
    const user: AuthUser = JSON.parse(authData);
    return user.loggedIn && user.token ? user : null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const user = getCurrentUser();
  return user?.token || null;
}
