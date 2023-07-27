export class GeneralVoting {
	public locationid: string;
	public locationName: string;
	public votedBy: VotingUser[];
}

export class DailyVoting {
	public date: string;
	public votedLocations: Array<GeneralVoting>;
	public requiredVotes: number;
	public isOpen: boolean;
	public winningLocation: string | null;
}

export interface VotingUser {
	name: string;
	id: string;
}
