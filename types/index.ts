export interface User {
    user_id: number;
    username: string | null;
    status: string | null;
    friends: Array<User> | null;
    sentMessages: Array<Message> | null;
    loggedIn: boolean | null;
}

export interface Message {
    id: number;
    text: string;
    dateTime: string;
    author: User;
    receiver: User | null;
    type: 'private' | 'public';
}

