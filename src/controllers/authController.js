import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync.js';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import UserModel from '../models/userModel.js';
import { sendEmail } from '../utils/email.js';
const verifyToken = promisify(jwt.verify);
const signToken  = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

const cookieOptions= {
    expiresIn: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true

}
if(process.env.NODE_ENV ==='production') cookieOptions.secure = true;
const createAndSendToken  = (user, statusCode, res)=>{
    const token = signToken(user._id);
    res.cookie('jwt', token , cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        data:{
            user,
        },
        token
    })
}
export const signup  = catchAsync(async (req,res,next) =>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordCreatedAt: req.body.passwordCreatedAt,
        role: req.body.role
    });
    createAndSendToken(newUser, 201, res);
});
export const login = async (req,res,next) => {
    const {email, password} = req.body;
    // check if email and passwowrd is available in the request body
    if(!email || !password){
        return next(new AppError('Please provdie email and password !', 400));
    }
    // check if requested user is available in the database
    const user = await User.findOne({email}).select('+password');
    
    if(!user || ! await user.correctPassword(password, user.password)){
        return next(new AppError('Invalid Username or Password !', 404));
    }
    createAndSendToken(user, 200, res);
}
export const forgotpassword = catchAsync(async (req, res, next)=>{
    // 1. Get the emailid of the user
        const email = req.body.email;
        const user  = await User.findOne({email});
        if(!user){
            return next(new AppError('Invalid Username !', 404));
        }
    // 2. Generate a reset password token , save it in the user model
        const resetToken =  await user.generatePasswordResetToken();

        console.log('after generating token',resetToken);
        user.save({validateBeforeSave: false});
        const resetURL= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        const message =`Forgot your password ! Submit a PATCH request with new password and confirm password
         to the url ${resetURL} .\n If you dont forget your password please ignore email`;

         try {
            
            // await sendEmail({
            //     to: user.email,
            //     subject: 'Your password reset token (valid for 10 min)',
            //     message
            // })
            res.status(200).json({
                status:'success',
                message: 'Token sent to email!',
                resetURL
            })

         } catch (error) {
             user.passwordResetToken= undefined;
             user.passwordResetTokenExpires= undefined;
             res.status(500).json({
                status:'failed',
                message: 'Unable to reset the password please try again!',
                error
            })
         }
        
    // 3. send the reset token via email
});
export const resetpassword = catchAsync(async (req, res, next)=>{
    // 1. Get User based on the token
    
    const hashedToken  = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken: req.params.token, passwordResetTokenExpires: {$gte: Date.now()}});

    
    // 2. If the token has not expired and there is a user then set the new password
    // 3. update the password created at time  
    if(!user){
        return next(new AppError('Invalid reset token', 401));
    }
    if(!req.body.password || !req.body.passwordConfirm || req.body.password !== req.body.passwordConfirm){
        res.status(200).json({
            status:'failed',
            message: 'Password reset failed',
        });
    }else{
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken=undefined;
        user.passwordResetTokenExpires=undefined;
        await user.save({validateBeforeSave:false});

        createAndSendToken(user, 200, res);
       
    }
   
   

})
export const protect = catchAsync(async (req,res,next)=>{

    // 1. Get the token and check if it is there

    // 2. Validate the token and retreive the jwt paylod - _ID

    // 3. Check if the user correspending to the above id exists

    // 4. Checkif the user has  changed the password after retreivign the jwt token.

    const authHeader = req.headers['authorization'];
    console.log('about to verify authHeader', authHeader);
    let token;
    if (authHeader && authHeader.startsWith('Bearer')) {
        // Authorization header is in the form "Bearer <token>"
        token = authHeader.split(' ')[1];  // Get the token part (after the "Bearer" keyword)
        if(!token){
            return next(new AppError('You are not looged in ! Please get access', 401))
        }
        
        const decodedPayload =   await verifyToken(token,process.env.JWT_SECRET);
        const user = await UserModel.findOne({_id: decodedPayload.id});
        if(!user){
            return next(new AppError('the user doesnt exist, please register again', 401));
        }

        const isPasswordChanged = await user.passwordChanged(decodedPayload.iat);
        if(isPasswordChanged){
            return next(new AppError('the password got updated after token generation. Please login again', 401));
        }
        req.user = user;
        return next();
    } else {
        return next(new AppError('You are not looged in ! Please get access', 404))
    }
});

export const restrictTo = (roles)=>{
    return catchAsync(async (req,res,next)=>{
        if(!roles.includes(req.user.role) ){
            return next(new AppError('UnAuthorized to perform this operation'));
        }
        next();
        })
};

export const updatepassword  = catchAsync( async(req,res,next) =>{
    // 1. get user form collection
     const user  = await User.findOne({_id: req.params.id}).select('+password');
    if(!user){
    return next(new AppError('Invalid User', 401));
    }
    // 2. check if the current password is correct
     const isPasswordCorrect  = await user.correctPassword( req.body.password, user.password);

     if(!isPasswordCorrect){
        return next(new AppError('Invalid Current Password', 401));
     }
    // 3. Update the new password and send the updated token
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save({validateBeforeSave:false});
    // FindByIDAndUpdate will not work as the middle wares and validations will not gets executed during findByIDAndUpdate    
    createAndSendToken(user,200,res);
   })
