/**
 * @swagger
 *   components:
 *    schemas:
 *      User:
 *          type: object
 *          properties:
 *            user_id:
 *              type: number
 *            username:
 *              type: string
 *            status:
 *              type: string
 *            friends:
 *              nullable: true
 *              type: array
 *              items:
 *                nullable: true
 *                type: object
 *                properties:
 *                  user_id:
 *                    type: number
 *                  username:
 *                    type: string
 *                  status:
 *                    type: string
 *            sentMessages:
 *              nullable: true
 *              type: array
 *              items:
 *                nullable: true
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                  text:
 *                    type: string
 *                  dateSent:
 *                    type: string 
 *                  author:
 *                    type: object
 *                    properties:
 *                      user_id:
 *                        type: number
 *                      username:
 *                        type: string
 *                      status:
 *                        type: string
 *                  receiver:
 *                    nullable: true
 *                    type: object
 *                    properties:
 *                      user_id:
 *                        type: number
 *                      username:
 *                        type: string
 *                      status:
 *                        type: string
 *                  type:
 *                    type: string
 *      UserInput:
 *          type: object
 *          properties:
 *            username:
 *              type: string
 *      Response:
 *          type: object
 *          properties:
 *            success:
 *              type: string
 *      ResponseError:
 *          type: object
 *          properties:
 *            error:
 *              type: string
 *      Status:
 *          type: object
 *          properties:
 *            status:
 *              type: string
 *      JustUser:
 *          type: object
 *          properties:
 *            username:
 *              type: string
 *            status:
 *              type: string
 */

import express, {Request, Response, Handler} from 'express';
import session from 'express-session';
import { store } from '../app';
import * as userModel from '../model/user'
import { User } from '../types';

const userRouter = express.Router();


/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get a list of all users, their friends and the messages they sent
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.get('/', (req: Request, res: Response) => {
    userModel.getUsers((err: Error, users: User[]) => {
        if (err) {
            
            res.status(500).json({ status: 'error', errorMessage: err.message });
        } else {
            
            res.status(200).json(users);
        }
    });
});

userRouter.post('/removeFriend', (req: Request, res: Response) => {
    const user = req.session["user"];
    const friendid = req.body.receiver_id;
   console.log(req.body)
    userModel.removeFriend(user.user_id, friendid, (error: Error, userId: number) => {
        if (error) {
            console.log(error.message);
            res.status(500).json({ status: 'error', errorMessage: error.message });
        } else {
            res.status(200).json({ status: 'success', userId });
        }
    });
})

/**
 * @swagger
 * /user/friends:
 *   get:
 *     summary: Get the friends list of the current user
 *     responses:
 *       200:
 *         description: A list of friends.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JustUser'
 *       403:
 *         description: No logged in user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseError'
 */

userRouter.get('/friends', (req: Request, res: Response) => {
    try {
        const user = req.session["user"];
        res.status(200).json(user.friends);
    } catch (error: any) {
        res.status(403).json({error: "Forbidden"})
    }
    
});

userRouter.get('/current', (req: Request, res: Response) => {
    try {
        
        const olduser = req.session["user"];
        setUser(olduser.username, req)
        const newuser = req.session["user"];
        
        
        
        res.status(200).json(newuser)
    } catch (error: any) {
        res.status(404).json({err: "No user logged in"})
    }
    
    
});

userRouter.get('/logout', (req: Request, res: Response) => {
    req.session.destroy(err => {
        if(err) {
            res.status(400).json({error: "Unable to logout"})
        } else {
            res.status(200).json({success: "Logout Successful"})
        }
    });
    
})

/**
 * @swagger
 * /user/{username}:
 *   get:
 *      summary: Get user information by username
 *      responses:
 *        200:
 *          description: A user.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *      parameters:
 *        - name: username
 *          in: path
 *          description: username
 *          required: true
 *          schema:
 *            type: string
 */

userRouter.get('/:username', (req: Request, res: Response) => {
    const username = req.params.username;
    userModel.getUser(username, (error: Error, user: User) => {
        if (error) {
            res.status(500).json({ status: 'error', errorMessage: error.message });
        } else {
            res.status(200).json(user);
        }
    });
});


userRouter.post('/', (req: Request, res: Response) => {
    const username = req.body.username;
    console.log(req.body)
    userModel.addUser(username, (error: Error, userId: number) => {
        if (error) {
            console.log(error.message);
            res.status(500).json({ status: 'error', errorMessage: error.message });
        } else {
            res.status(200).json({ status: 'success', userId });
        }
    });
});
/**
 * @swagger
 * /user/login:
 *   post:
 *      summary: Login a user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserInput'
 *      responses:
 *         200:
 *            description: You have successfully logged in
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Response'
 *         403:
 *            description: User does not exist
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ResponseError'
 */
userRouter.post('/login', (req: Request, res: Response) => {
       
    
        const username = req.body.username;
    
    userModel.getUser(username, (error: Error, user: User) => {
        if(error) {
            res.status(403).json({ error: 'user does not exist'})
        } else {
            req.session["authenticated"] = true;
            req.session["user"] = user
            res.status(200).json({success: "true"})
        }
    });
    
    
});

const setUser = (username: string, req: Request) => {
    userModel.getUser(username, (error: Error, user: User) => {
        req.session["user"] = user 
        store.set(req.sessionID, req.session)
    })
}

/**
 * @swagger
 * /user/status:
 *   put:
 *      summary: Change user status
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Status'
 *      responses:
 *         200:
 *            description: You have successfully changed user status
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/Status'
 *         404:
 *            description: User does not exist
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ResponseError'
 */

userRouter.put('/status', (req: Request, res: Response) => {
    try {
        const user = req.session["user"];
        const status = req.body.status;
         userModel.updateStatus(status, user.user_id,(error: Error, statusout: string) => {
        if(error) {
            res.status(404).json({error : 'User does not exist'})
        } else {
            setUser(user.username, req);
            res.status(200).json({status: statusout})
        }
    });
    } catch (error: any) {
        res.status(404).json({error : 'User does not exist'})
    }
    
});
/**
 * @swagger
 * /user/friends:
 *   post:
 *      summary: Add a friend
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserInput'
 *      responses:
 *         200:
 *            description: Successfully added a friend
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/User'
 *         404:
 *            description: User does not exist
 *            content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/ResponseError'
 */
userRouter.post('/friends', (req: Request, res: Response) => {
    try{
        const user = req.session["user"];
        const friend_username = req.body.username
        userModel.getUser(friend_username, (error: Error, friend: User) => {
            if(error) {
                res.status(404).json({error: "User does not exist"})
            }
        })

        userModel.addFriend(friend_username, user.user_id, (error: Error, friend: User) => {
        if(error) {
            res.status(404).json({error: "User doesn't exist"})
        } else {
            res.status(200).json(friend)
        }
    });
    } catch (error: any) {
        res.status(404).json({error: "User doesn't exist"})
    }
    
});





export { userRouter }