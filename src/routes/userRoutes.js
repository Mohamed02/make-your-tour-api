import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateme,
  deleteMe,
} from '../controllers/userController.js';
import { forgotpassword, login, protect, resetpassword, signup, updatepassword } from '../controllers/authController.js';

const router = new Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotpassword);
router.patch('/updatepassword/:id', protect, updatepassword);
router.patch('/resetpassword/:token', resetpassword);
router.patch('/updateme', protect, updateme);
router.delete('/deleteme', protect, deleteMe);
router.get('/', getAllUsers).post('/', createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
export default router;