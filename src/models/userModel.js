import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please tell us your email id'],
        unique: true,
        lowerCase: true,
        validator: [validator.isEmail,'Please enter a valid email id']
    },
    photo: String,
    role: {
        type: String,
        enum:['user','guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide the passwored'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm the passwored'],
        validate: {
            validator:function(el){
                return this.password === el
            },
            message: 'Passwords are not the same'
        }
    },
    passwordCreatedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }

});
userSchema.pre('save',async function(next){
    //ONly run this function if password was actually modified
 if(!this.isModified('password')) return next();
    this.password  = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre('save',async function(next){
    //ONly run this function if password was actually modified
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordCreatedAt =Date.now() - 1000;
    next();
});
userSchema.pre(/^find/, function(next){
    this.find({active : true});
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.passwordChanged = async function(jwtTimeStamp){
    if(!this.passwordCreatedAt) {
        return false;
    }
    const changedTimeStamp = Math.floor(this.passwordCreatedAt.getTime() / 1000);
    console.log('changedTimeStamp', changedTimeStamp);
    console.log('jwtTimeStamp', jwtTimeStamp);
    return jwtTimeStamp < changedTimeStamp;
   
};
userSchema.methods.generatePasswordResetToken = async function(){

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');
    const expirytime = Date.now()+ 10 * 60 * 1000;
    console.log('this.passwordResetToken', hashResetToken);
    console.log('this.passwordResetTokenExpires', expirytime);
    this.passwordResetToken = hashResetToken;
    this.passwordResetTokenExpires = expirytime;
    return hashResetToken;
};
const UserModel  = mongoose.model('User', userSchema);
export default UserModel