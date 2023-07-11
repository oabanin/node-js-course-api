import {validationResult} from "express-validator";
import {Post} from "../models/post";
import {Error} from "mongoose";
import * as fs from "fs";
import path from "path";
import {User} from "../models/user";
import {getIO} from "../socket";

type CustomError = {
    statusCode?: number;
} & Error

const getPosts = async (req: any, res: any, next: any) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        console.log(posts);

        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts,
            totalItems: totalItems
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const createPost = async (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error: any = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error: any = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });


    try {
        await post.save();

        const user = await User.findById(req.userId);
        if (!user) {
            const error: any = new Error('No User found.');
            error.statusCode = 422;
            throw error;
        }

        // User.findOneAndUpdate(
        //    { _id: req.userId },
        //
        const update = await User.findByIdAndUpdate(
            req.userId,
            {$push: {posts: post._id}});

        // console.log(t);
        // user.posts.push(post as any);
        //user.posts.push(post._id);
        //await user.save();
        update && update.save();


        getIO().emit('posts', {
            action: 'create',
            // @ts-ignore
            post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
        });
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: {_id: user._id, name: user.name}
        });
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const getPost = async (req: any, res: any, next: any) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    try {
        if (!post) {
            const error: any = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Post fetched.', post: post});
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const updatePost = async (req: any, res: any, next: any) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error: any = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error: any = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    try {
        const post = await Post.findById(postId).populate('creator');
        if (!post) {
            const error: any = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error: any = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        const result = await post.save();


        getIO().emit('posts', { action: 'update', post: result });
        res.status(200).json({message: 'Post updated!', post: result});
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

const deletePost = async (req: any, res: any, next: any) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);

        if (!post) {
            const error: any = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error: any = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
        // Check logged in user
        clearImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);

        const user = await User.findById(req.userId);
        if (!user) {
            const error: any = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        const p = await User.findByIdAndUpdate(req.userId, {$pull: {posts: post._id}});
        // @ts-ignore
        //user.posts.pull(postId);
        // await user.save();
        p & p.save();
        getIO().emit('posts', { action: 'delete', post: postId });
        res.status(200).json({message: 'Deleted post.'});
    } catch (err: any) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


const clearImage = (filePath: string) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

// TOP level avait
export {getPosts, createPost, getPost, updatePost, deletePost}