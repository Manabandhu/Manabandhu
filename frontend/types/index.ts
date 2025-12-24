export type UserRole = "student" | "worker" | "visitor";

export interface User {
	uid: string;
	email?: string;
	phoneNumber?: string;
	displayName?: string;
	photoURL?: string;
	country?: string;
	city?: string;
	role?: UserRole;
	onboardingCompleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface AuthState {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	onboardingCompleted: boolean;
}

export * from "./rooms";
export * from "./rides";
export * from "./qa";
