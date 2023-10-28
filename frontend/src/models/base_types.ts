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

export interface RestaurantLocation {
    name: string,
    id: string
}

export interface Order {
    id: string;
    user: string;
    orderedItems: OrderItem[];
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
}


export interface DailyOrder {
    date: string;
    orders: Order[];
    isOpen: boolean;
    location: RestaurantLocation;
}

export interface Menu {
  restaurant: string;
  updatedAt: string;
  menuItems: MenuItem[];
}

export interface MenuItem{
  name:string;
  price:number;
  tag?:string
}
