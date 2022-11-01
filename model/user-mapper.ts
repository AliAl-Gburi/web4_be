import e from 'express';
import { RowDataPacket } from 'mysql2';
import { User } from '../types';

const mapToUsers = (rows: RowDataPacket[]): User[] => {
    const result = [];

    rows.forEach(
        ({
            user_id,
            username,
            status,
            friend_id,
            friend_username,
            friend_status,
            message_id,
            datet,
            textbody,
            receiver_id,
            receiver_username,
            receiver_status
            
        }) => {
            const friend = friend_id === null? null : {
                user_id: friend_id,
                username: friend_username,
                status: friend_status
            }
            const author = {
                user_id: user_id,
                username: username,
                status: status
            }
            const type = receiver_id === null? 'public' : 'private'
            const receiver = receiver_id === null? null : {
                user_id: receiver_id,
                username: receiver_username,
                status: receiver_status
            }
            const message = message_id=== null? null: {
                id: message_id,
                text: textbody,
                dateSent: datet,
                author: author,
                receiver: receiver,
                type: type

            }
            

            const existing = result.find((el) => el.user_id === user_id);
            if(!existing) {
                result.push({
                    user_id: user_id,
                    username: username,
                    status: status,
                    friends: [friend],
                    sentMessages: [message]
                });
            } else {
                const friendExist = existing.friends.find((el) => el.user_id === friend.user_id);
                if(!friendExist) {
                    existing.friends.push(friend);
                }
                if(message !== null) {
                    const messageExist = existing.sentMessages.find((el) => el.id === message.id);
                    if(!messageExist) {
                    existing.sentMessages.push(message);
                }
                }
                
                
            }

        }
    )
    return result;

};

export default mapToUsers;