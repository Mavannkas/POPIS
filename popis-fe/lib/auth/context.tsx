import { createContext, useContext, useEffect, useState } from 'react';
import { me, signIn, signOut, signUp, updateMe, type UpdateMePayload } from './api';
import type { AuthUser, SignInPayload, SignUpPayload } from './types';

const AuthContext = createContext<{
	user: AuthUser | null;
	loading: boolean;
	signIn: (p: SignInPayload) => Promise<void>;
	signUp: (p: SignUpPayload) => Promise<void>;
	signOut: () => Promise<void>;
	refresh: () => Promise<void>;
	updateProfile: (p: UpdateMePayload) => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		refresh();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const refresh = async () => {
		try {
			const { user } = (await me()) as unknown as { user: AuthUser };
			setUser(user);
		} catch (error) {
			console.error('Failed to fetch user:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				signIn: async p => {
					await signIn(p);
					await refresh(); // Fetch full user data with relations
				},
				signUp: async p => {
					await signUp(p);
					await refresh(); // Fetch full user data with relations
				},
				signOut: async () => {
					await signOut();
					setUser(null);
				},
				refresh,
				updateProfile: async (p: UpdateMePayload) => {
					const updated = await updateMe(p);
					setUser(updated);
				},
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth needs AuthProvider');
	return ctx;
}
