/**
 * @swagger
 *   components:
 *    schemas:
 *      Message:
 *          type: object
 *          properties:
 *            message_id:
 *              type: number
 *            text:
 *              type: string
 *            dateTime:
 *              type: string
 *            author:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: number
 *                username:
 *                  type: string
 *                status:
 *                  type: string
 *            receiver:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: number
 *                username:
 *                  type: string
 *                status:
 *                  type: string
 *      MessageInput:
 *          type: object
 *          properties:
 * 
 */
import express, {Request, Response, Handler} from 'express';
import * as messageModel from '../model/message';
import { Message } from '../types';

const messageRouter = express.Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get a list of the last 7 public messages
 *     responses:
 *       200:
 *         description: A list of public messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
messageRouter.get('/', (req: Request, res: Response) => {
    
   
    
    
    messageModel.getPublicMessages( (err: Error, messages: Message[]) => {
        if(err) {
            res.status(500).json({status : 'error', errorMessage: err.message })
        } else {
            
            res.status(200).json(messages);
        }
    });
});

messageRouter.post('/delete', (req: Request, res: Response) => {
    const messageid = req.body.receiver_id;
    
    messageModel.deleteMessage(messageid, (error: Error, del: number) => {
        if(error) {
            console.log(error.message)
            res.status(500).json({error: error.message})
            
        } else {
            res.status(200).json({ status: 'success'})
        }
    })
})

messageRouter.post('/', (req: Request, res: Response) => {
    try{
        const user = req.session["user"];
        const message = <Message>req.body;
        
       
    
    messageModel.publishMessage(message, (error:Error, message_id: number) => {
        if(error) {
            console.log(error.message)
            res.status(500).json({error: error.message})
            
        } else {
            res.status(200).json({ status: 'success'})
        }
    });
    } catch (error: any) {
        res.status(403).json({error: "Forbidden"})
    }
    
});

messageRouter.post('/private', (req: Request, res: Response) => {
    console.log(req.body);
    const user1 = req.body.user1;
    const user2 = req.body.user2;
    

    messageModel.getPrivateMessages(user1, user2, (err: Error, messages: Message[]) => {
        if(err) {
            res.status(500).json({error: err.message})
        } else {
            res.status(200).json(messages)
        }
    });
});

export { messageRouter }