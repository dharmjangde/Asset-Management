import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage immediately to prevent logout on refresh
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // Initialize users list if not exists
    useEffect(() => {
        const storedUsers = localStorage.getItem('users');
        if (!storedUsers) {
            const defaultUsers = [
                { id: 'admin', name: 'Administrator', password: 'admin123', role: 'admin', email: 'admin@company.com' },
                { id: 'user', name: 'Standard User', password: 'user123', role: 'user', email: 'user@company.com' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    }, []);

    const getUsers = () => {
        const stored = localStorage.getItem('users');
        return stored ? JSON.parse(stored) : [];
    };

    const login = (id, password) => {
        const users = getUsers();
        const foundUser = users.find(u => u.id === id && u.password === password);

        if (foundUser) {
            // Don't store password in session
            const { password, ...safeUser } = foundUser;
            setUser(safeUser);
            localStorage.setItem('user', JSON.stringify(safeUser));
            return true;
        }
        return false;
    };

    const addUser = (userData) => {
        const users = getUsers();
        if (users.find(u => u.id === userData.id)) return false; // ID taken

        const newUsers = [...users, userData];
        localStorage.setItem('users', JSON.stringify(newUsers));
        return true;
    };

    const updateUser = (id, updates) => {
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return false;

        users[index] = { ...users[index], ...updates };
        localStorage.setItem('users', JSON.stringify(users));

        // Update current session if it's the logged-in user
        if (user && user.id === id) {
            const { password, ...safeUser } = users[index];
            setUser(safeUser);
            localStorage.setItem('user', JSON.stringify(safeUser));
        }
        return true;
    };

    const deleteUser = (id) => {
        const users = getUsers();
        const newUsers = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(newUsers));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, getUsers, addUser, updateUser, deleteUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
