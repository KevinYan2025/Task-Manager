const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')


//create new task data......
router.post('/tasks',auth, async (req,res)=>{
    const task = new Task({
        ...req.body, //copy the entire req.body object
        owner:req.user._id //set the task owner id that come from the auth
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//reading a task data
router.get('/tasks/:id', auth, async (req,res) => {
    const _id=req.params.id
    try {
        const task = await Task.findOne({_id, owner:req.user._id})
        if(!task) {
          return  res.status(404).send({error:'Task does not exsit!'})
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//reading all tasks data   /tasks?completed=true
router.get('/tasks',auth, async (req,res)=>{

        let match = {}
        if(req.query.completed){
            match.completed=req.query.completed === 'true'
        }

    try {
        // let tasks
        // //check if the query string is provided
        // if(req.query.completed){
        //     const completed=req.query.completed==='true'
        //     tasks =await Task.find({owner:req.user.id,completed})
        // }else{
        //     tasks =await Task.find({owner:req.user.id})
        // }
         await req.user.populate({
            path:'tasks',
            match
        })
        
        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

//update task data
router.patch('/tasks/:id',auth ,async (req, res) => {
    const updateField = Object.keys(req.body)
    const validFeild = ["description","completed"]
    const isValidField= updateField.every((field)=> validFeild.includes(field))
    if(!isValidField){
        return res.status(400).send({error:'invalid update!'})
    }
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        updateField.forEach((feild) => task[feild]=req.body[feild])
        task.save()
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete task by id
router.delete('/tasks/:id', auth,async (req,res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send({error:"Cannot delete task by this id"})
        }
        res.status(200).send(task)
    } catch (error) {
        res.stata(500).send(error)
    }
})

module.exports=router