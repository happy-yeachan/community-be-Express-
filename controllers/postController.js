import {
    getAllPostsModel,
    createPostModel,
    getPostByIdModel,
    updatePostModel,
    deletePostModel,
} from '../models/postModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 모든 게시글 조회
const loadPosts = async (req, res) => {
    try {
        const posts = await getAllPostsModel();
        res.status(200).json({
            message: "posts_list_success",
            data: {
                posts: posts.map(post => ({
                    post_id: post.post_id,
                    title: post.title,
                    content: post.content,
                    like_cnt: post.like_cnt,
                    comment_cnt: post.comment_cnt,
                    view_cnt: post.view_cnt,
                    author: {
                        user_id: post.user_id,
                        nickname: post.nickname
                    },
                    created_at: post.created_at
                }))
            }
        });
    } catch (error) {
        console.error("게시글 로드 오류:", error);
        res.status(500).json({ message: "internal_server_error" });
    }
};

// controllers/postController.js
const createPost = async (req, res) => {
    try {
        console.log(req.body);
        const { title, content } = req.body;

        // 이미지 경로 처리
        const postImage = req.file ? `/uploads/postImages/${req.file.filename}` : null;

        const newPost = {
            title,
            content,
            postImage,
            like_cnt: 0,
            comment_cnt: 0,
            view_cnt: 0,
            user_id: req.session.user.user_id,
        };

        // 새 게시글 데이터 저장
        createPostModel(newPost);

        res.status(201).json({ message: "post_created_success" });
    } catch (error) {
        console.error("게시글 생성 오류:", error);
        res.status(500).json({ message: "internal_server_error" });
    }
};


// 특정 게시글 조회
const loadPostDetail = async (req, res) => {
    try {
        const postId = parseInt(req.params.post_id, 10);
        const post = await getPostByIdModel(postId);
        if (!post) {
           return res.status(404).json({ message: "post_not_found" });
        }
        res.status(200).json({ message: "post_detail_success", data: post });
    } catch (error) {
        console.error("게시글 상세 조회 오류:", error);
        res.status(500).json({ message: "internal_server_error" });
    }
};

// 게시글 수정
const updatePostDetail = async (req, res) => {
    try {
        const postId = parseInt(req.params.post_id, 10);
        const { title, content, imageFlag } = req.body;
        const postImage = req.file ? `/uploads/postImages/${req.file.filename}` : null;

        // 기존 게시글 데이터 가져오기
        const existingPost = await getPostByIdModel(postId);
        if (!existingPost) {
            return res.status(404).json({ message: "post_not_found" });
        }

        // 기존 이미지 삭제
        if (imageFlag == 1 && existingPost.photo_url) {
            const previousImagePath = path.join(__dirname, '..', existingPost.image_url);
            fs.unlink(previousImagePath, (err) => {
                if (err) {
                    console.error('기존 이미지 삭제 오류:', err);
                } else {
                    console.log('기존 이미지가 삭제되었습니다:', previousImagePath);
                }
            });
        }

        const updatedPost = updatePostModel(postId, title, content, postImage, imageFlag);
        if (!updatedPost) {
            return res.status(404).json({ message: "post_not_found" });
        }
        res.status(204).json({ message: "post_updated_success", data: updatedPost });
    } catch (error) {
        console.error("게시글 수정 오류:", error);
        res.status(500).json({ message: "internal_server_error" });
    }
};

// 게시글 삭제
const deletePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.post_id, 10);
        const isDeleted = await deletePostModel(postId);
        if (!isDeleted) {
            return res.status(404).json({ message: "post_not_found" });
        }
        res.status(200).json({ message: "post_deleted_success" });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        res.status(500).json({ message: "internal_server_error" });
    }
};

export { loadPosts, createPost, loadPostDetail, updatePostDetail, deletePost };