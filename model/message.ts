import {OkPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import mapToMessages from './message-mapper';
import { Message, User } from '../types';
import { connectionPool } from '../database';

const getPublicMessages = async ( onResult: (error: Error, messages: Message[]) => void) => {
   
        const query = `select message_id, textbody, datet, sender_id, receiver_id, username as sender_username, status as sender_status
    from message as m inner join user as u
        on m.sender_id = u.user_id
    where receiver_id is null
    order by datet desc
    limit 7`;

    try {
        const [rows] = await connectionPool.query(query);
        onResult(null, mapToMessages(<RowDataPacket[]>rows));
    } catch (error) {
        onResult(error, null);
    }
    
    
}

const getPrivateMessages = async (user1:string, user2:string, onResult: (error: Error, messages: Message[]) => void) => {
    const query = `select message_id, textbody, datet, sender_id, receiver_id, username as sender_username, status as sender_status
    from message as m inner join user as u
        on m.sender_id = u.user_id
    where (sender_id = ? and receiver_id = ?) or (sender_id = ? and receiver_id = ?)
    order by datet desc
    limit 7`;

    try {
        const [rows] = await connectionPool.query(query, [user1, user2, user2, user1]);
        onResult(null, mapToMessages(<RowDataPacket[]>rows));
    } catch (error) {
        onResult(error, null);
    }
}

const publishMessage = async (
    message: Message,
    onResult: (error: Error, messageId: number) => void
) => {
    const insertMessage = `INSERT INTO student_book.message (textbody, datet, sender_id, receiver_id) VALUES (?, ?, ?, ?)`;

    const connection = await connectionPool.getConnection();

    await connection.beginTransaction();

    try {
        const[result] = await connection.execute(insertMessage, [message.text, message.dateTime, message.author.user_id, message.receiver? message.receiver.user_id : null]);
        const message_id = (<ResultSetHeader> result).insertId;

        await connection.commit();
        onResult(null, message_id);
    } catch (error) {
        await connection.rollback();
        onResult(error, null);
    } finally {
        await connection.release();
    }
}
const deleteMessage = async (
    message_id: number,
    onResult: (error: Error, ret: number) => void
) => {
    const query = `delete from student_book.message where message_id = ?`;

    const connection = await connectionPool.getConnection();

    await connection.beginTransaction();

    try {
        const[res] = await connection.execute(query, [message_id]);
        const del = (<ResultSetHeader> res).affectedRows;

        await connection.commit();
        onResult(null, del);
    } catch (error) {
        await connection.rollback();
        onResult(error, null);
    } finally {
        await connection.release();
    }

}

export { getPublicMessages, publishMessage, getPrivateMessages, deleteMessage }