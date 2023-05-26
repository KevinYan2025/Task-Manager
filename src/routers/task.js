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
router.get('/tasks/:id', async (req,res) => {
    Task.findById(req.params.id)
    try {
        const task =await Task.findById(req.params.id)
        res.status(200).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

//reading all tasks data
router.get('/tasks', async (req,res)=>{
    try {
        const tasks =await Task.find({})
        res.status(200).send(tasks)
    } catch (error) {
        res.status(400).send(error)
    }
})

//update task data
router.patch('/tasks/:id',async (req, res) => {
    const updateField = Object.keys(req.body)
    const validFeild = ["description","completed"]
    const isValidField= updateField.every((field)=> validFeild.includes(field))
    if(!isValidField){
        return res.status(400).send({error:'invalid update!'})
    }
    try {
        const task = await Task.findById(req.params.id)
        updateField.forEach((feild) => task[feild]=req.body[feild])
        task.save()
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete task by id
router.delete('/tasks/:id', async (req,res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task){
            return res.status(404).send({error:"Cannot delete task by this id"})
        }
        res.status(200).send(task)
    } catch (error) {
        res.stata(500).send(error)
    }
})

module.exports=router