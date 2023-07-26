export interface User {
	name: string;
	password: string;
}

export interface SessionData {
	token: string;
	name: string;
	passwordHash: string;
}
