export interface User {
	name: string;
	password: string;
}

export interface SessionData {
	token: string;
	name: string;
	id: string;
	passwordHash: string;
}
