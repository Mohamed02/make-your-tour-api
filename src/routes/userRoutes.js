import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateme,
  deleteMe,
  getMe,
} from '../controllers/userController.js';
import { forgotpassword, login, protect, resetpassword, restrictTo, signup, updatepassword } from '../controllers/authController.js';

const router = new Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotpassword);
router.patch('/resetpassword/:token', resetpassword);

router.use(protect);

router.patch('/updatepassword/:id', updatepassword);

router.get('/me', getMe, getUser);
router.patch('/updateme', updateme);
router.delete('/deleteme', deleteMe);

router.use(restrictTo('admin'));

router.get('/', getAllUsers).post('/', createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
export default router;