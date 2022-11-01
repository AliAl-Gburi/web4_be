import e from 'express';
import { RowDataPacket } from 'mysql2';
import { Message } from '../types';

const mapToMessages = (rows: RowDataPacket[]): Message[] => {
    const result = [];

    rows.forEach(
        ({
            message_id,
            textbody,
            datet,
            sender_id,
            sender_username,
            sender_status,
            receiver_id,
            receiver_username,
            receiver_status,
            type
        }) => {
            const sender = {
                user_id: sender_id,
                username: sender_username,
                status: sender_status
            }
            
            const receiver = receiver_id === null? null: {
                user_id : receiver_id,
                username: receiver_username,
                status: receiver_status
            }
            type = receiver_id === null ? 'public' : 'private'
            const existing = result.find((el) => el.message_id === message_id);
            if(!existing) {
                result.push({
                    message_id: message_id,
                    text: textbody,
                    dateTime: datet,
                    author: sender,
                    receiver: receiver,
                    type: type
                })
            }
        }
    )
    return result;
};

export default mapToMessages;