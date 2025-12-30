import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

export type UserRole = 'SUPER_ADMIN' | 'DISTRICT_ADMIN' | 'PHC_STAFF' | 'FIELD_WORKER' | 'ANALYST';

interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    district?: string;
    profilePicture?: string;
    loginMethod?: 'password' | 'google' | 'facebook';
}

interface AuthContextType {
    user: User | null;
    login: (credentials: any) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token })
                    });
                    const data = await response.json();

                    if (data.success) {
                        setUser(data.user);
                    } else {
                        localStorage.removeItem('authToken');
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Auth verification failed", error);
                    localStorage.removeItem('authToken');
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('authToken', data.token);
                setUser(data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
