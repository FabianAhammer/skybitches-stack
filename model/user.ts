export interface User {
	name: string;
	password: string;
}

export interface UserToken {
	token: string;
	user: string;
	password: string;
}
