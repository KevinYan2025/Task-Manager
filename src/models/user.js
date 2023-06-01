const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true

    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Eamil is invalid!')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannnot cotain password!')
            }
        }

    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Age must be positive number!")
            }
        }
    },
    token:[{
        type:String,
        require:true
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

//Virtual fields are not persisted in the database but allow you to establish relationships between models.
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON=function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.token
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken=async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)
    user.token=user.token.concat(token)
    await user.save()
    return token
}

//check wether the credential is valid
userSchema.statics.isCredential = async (email,password) => {
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Unable to login!')
    }

    if(!bcrypt.compare(password,user.password)){
        throw new Error('Unable to login!')
    }
    return user
}

//hash plain password before saving
userSchema.pre('save',async function(next){
    const user = this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }

    next()//to start the operation
})

//middleware that delete user tasks when user is remove
//the { document: true, query: false } options ensures that the middleware is only executed when calling a method on a document instance.
userSchema.pre('deleteOne',{ document: true, query: false } ,async function(next){
    const user = this
    await Task.deleteMany({owner:user.id})

    next()
})


//create user model  name of the model as string and field as objec for parameter
const User = mongoose.model('User',userSchema)

module.exports=User