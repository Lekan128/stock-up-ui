export enum Role {
    USER = 'USER',
    AGENT = 'AGENT',
}

export interface ChatMessage {
    role: Role;
    content: string;
}

export interface ChatState {
    messages: ChatMessage[];
    isTyping: boolean;
    lastActivityTimestamp: number;
}