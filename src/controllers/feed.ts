import {validationResult} from "express-validator";
import {Post} from "../models/post";

const getPosts = (req:any, res:any, next:any) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'First Post',
                content: 'This is the first post!',
                imageUrl: 'images/duck.jpg',
                creator: {
                    name: 'Maximilian'
                },
                createdAt: new Date()
            }
        ]
    });
};

const createPost = (req:any, res:any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Validation failed, entered data is incorrect.',
            errors: errors.array()
        });
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/duck.jpg',
        creator: { name: 'Maximilian' }
    });
    post
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: result
            });
        })
        .catch(err => {
            console.log(err);
        });
};

export {getPosts, createPost}