import express from "express";
import {getUserStatus, login, signup, updateUserStatus,} from "../controllers/auth";
import {body} from "express-validator";

import {User} from "../models/user";
import {isAuth} from "../middleware/is-auth";

const authRouter = express.Router();

authRouter.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail address already exists!');
                    }
                });
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 }),
        body('name')
            .trim()
            .not()
            .isEmpty()
    ],
    signup
);

authRouter.post('/login', login);

authRouter.get('/status', isAuth, getUserStatus);

authRouter.patch(
    '/status',
    isAuth,
    [
        body('status')
            .trim()
            .not()
            .isEmpty()
    ],
    updateUserStatus
);
export {authRouter}