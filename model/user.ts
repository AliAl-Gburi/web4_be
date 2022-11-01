import {OkPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import mapToUsers from './user-mapper';
import { User } from '../types';
import { connectionPool } from '../database';

const getUsers = async (onResult: (error: Error, users: User[]) => void) => {
    const query = `select u.user_id, u.username, u.status, f.friend_id, p.username as friend_username, p.status as friend_status, m.message_id, m.datet, m.textbody, m.receiver_id, r.username as receiver_username, r.status as receiver_status
    from ((student_book.user as u inner join (student_book.user_has_friends as f inner join student_book.user as p
                                            on f.friend_id = p.user_id)
        on u.user_id = f.user_id) left outer join student_book.message as m
        on u.user_id = m.sender_id) left outer join student_book.user as r
        on m.receiver_id = r.user_id`;
    try {
        const [rows] = await connectionPool.query(query);
        onResult(null, mapToUsers(<RowDataPacket[]>rows));

    } catch (error) {
        onResult(error, null);
    };
}

const getFriends = async (userid: number, onResult: (error: Error, users: User[]) => void) => {
    const query = `select u.user_id, username, status
    from  student_book.user_has_friends as f inner join student_book.user as u
        on f.friend_id = u.user_id
        where f.user_id = ?`;
        try {
            const [rows] = await connectionPool.query(query, [userid]);
            onResult(null, mapToUsers(<RowDataPacket[]> rows));
        } catch (error) {
            onResult(error, null);
        }
}

const addUser = async (
    username: string,
    onResult: (error: Error, addedUserId: number) => void
) => {
    const insertUser = 'INSERT INTO student_book.user (username, status) VALUES (?, ?)';
    
    const connection = await connectionPool.getConnection();

    await connection.beginTransaction();

    try {
        const [result] = await connection.execute(insertUser, [username, "offline"]);
        const addedUserId = (<ResultSetHeader>result).insertId;

        await connection.commit();
        onResult(null, addedUserId);
    } catch (error) {
        await connection.rollback();
        onResult(error, null);
    } finally {
        await connection.release();
    }
}
const getUserById = async (
    user_id: number,
    onResult: (error: Error, user: User) => void
) => {
    const query = `select u.user_id, u.username, u.status, f.friend_id, p.username as friend_username, p.status as friend_status, m.message_id, m.datet, m.textbody, m.receiver_id, r.username as receiver_username, r.status as receiver_status
    from ((student_book.user as u inner join (student_book.user_has_friends as f inner join student_book.user as p
                                            on f.friend_id = p.user_id)
        on u.user_id = f.user_id) left outer join student_book.message as m
        on u.user_id = m.sender_id) left outer join student_book.user as r
        on m.receiver_id = r.user_id
        WHERE u.user_id = ?`;
        try {
            const[row] = await connectionPool.execute(query, [user_id]);
            onResult(null, mapToUsers(<RowDataPacket[]>row)[0]);
        } catch (error) {
            onResult(error, null);
        }
};

const getUser = async (
    username: string,
    onResult: (error: Error, user: User) => void
) => {
    const query = `select u.user_id, u.username, u.status, f.friend_id, p.username as friend_username, p.status as friend_status, m.message_id, m.datet, m.textbody, m.receiver_id, r.username as receiver_username, r.status as receiver_status
    from ((student_book.user as u left outer join (student_book.user_has_friends as f inner join student_book.user as p
                                            on f.friend_id = p.user_id)
        on u.user_id = f.user_id) left outer join student_book.message as m
        on u.user_id = m.sender_id) left outer join student_book.user as r
        on m.receiver_id = r.user_id
        WHERE u.username = ?`;
        try {
            const[row] = await connectionPool.execute(query, [username]);
            if(<RowDataPacket[]>row[0]) {
                onResult(null, mapToUsers(<RowDataPacket[]>row)[0]);
            } else {
                throw new Error("User does not exist")
            }
            
        } catch (error) {
            onResult(error, null);
        }
};

const updateStatus = async (
    statusin: string,
    user_id: number,
    onResult: (error: Error, statusout: string) => void
) => {
    const updateStatus = `update student_book.user SET status = ?
    where user_id = ?`

    const connection = await connectionPool.getConnection();

    await connection.beginTransaction();

    try {
        const [result] = await connection.execute(updateStatus, [statusin, user_id]);
        const statusout = statusin;

        await connection.commit();
        onResult(null, statusout);
    } catch (error) {
        await connection.rollback();
        onResult(error, null);
    } finally {
        await connection.release();
    }
};

const removeFriend = async (
    user_id: number ,friend_id: number, onResult: (error: Error, id: number) => void
) => {
    const query = `DELETE FROM student_book.user_has_friends where user_id = ? and friend_id = ?`

    const connection = await connectionPool.getConnection();

    await connection.beginTransaction();

    try {
        const [res] = await connection.execute(query, [user_id, friend_id]);
        const [inv] = await connection.execute(query, [friend_id, user_id]);

        await connection.commit();

        onResult(null, user_id);

    } catch (error) {
        await connection.rollback();
        onResult(error, null);
    } finally {
        await connection.release();
    }
}

const addFriend = async (
    friend_username: string,
    user_id: number,
    onResult: (error: Error, friend: User ) => void
) => {

    

    const insertFriend = `INSERT INTO student_book.user_has_friends (user_id, friend_id)
                            select ?, user_id as friend_id from user
                            where username = ?`;
    const inverseinsert = `INSERT INTO student_book.user_has_friends (user_id, friend_id)
                                select user_id, ? as friend_id from user
                                 where username = ? `
    const connection = await connectionPool.getConnection();

    await connection.beginTransaction();

    try {
    
        const [result] = await connection.execute(insertFriend, [user_id, friend_username]);
        const [resf] = await connection.execute(inverseinsert, [user_id, friend_username]);


        await connection.commit();
        getUser(friend_username, (error: Error, user: User) => {
            onResult(null, user);
        })
        
    } catch (error) {
        await connection.rollback();
        onResult(error, null);
    } finally {
        await connection.release();
    }
}

export { getUsers, getUser, updateStatus, addUser, addFriend, getFriends, removeFriend }