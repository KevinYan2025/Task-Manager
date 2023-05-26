const mongoose = require('mongoose')
const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
    },
    completed:{
        type:Boolean,
        default:false,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'User'
    }
})

taskSchema.pre('save', async function(next){
    const task = this
    if(task.isModified(''))
    next()
})
const Task = mongoose.model('Task',taskSchema)

module.exports = Task