import express from 'express';
import { signUp, login, kakao } from '../controllers/authController.js';
import upload from '../utils/uploadProfileUtils.js';


const router = express.Router();

router.post('/signup', upload.single('file'), signUp);
router.post('/login', login);
router.get('/kakao', kakao);

export default router;
