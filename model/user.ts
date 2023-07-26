export interface User {
	name: string;
	password: string;
}

export interface UserToken {
	token: string;
	name: string;
	passwordHash: string;
}
