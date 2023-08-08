export interface GeneralVoting {
  locationid: string;
  locationName: string;
  votedBy: VotingUser[];
}

export interface DailyVoting {
  date: string;
  votedLocations: Array<GeneralVoting>;
  requiredVotes: number;
  isOpen: boolean;
  winningLocation: string | null;
}

export interface VotingUser {
  name: string;
  id: string;
}
