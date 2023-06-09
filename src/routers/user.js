const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const multer = require('multer')
const { castObject } = require('../models/task')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/accounts')

// Create new user data
router.post('/users', async (req, res) => {

    try {
        if(await User.findOne({email:req.body.email})){
           return res.status(400).send({error:'Email already exsit!'})
        }
        const user = new User(req.body)
        await user.save()
        sendWelcomeEmail(req.body.email,req.body.name)
        const token =await user.generateAuthToken()
        user.tokens=user.tokens.concat(token)
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

//login router
router.post('/users/login', async (req,res) => {
    try{
        const user = await User.isCredential(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(error){
        res.status(404).send(error)
    }

})

//logout router
router.post('/users/logout',auth, async (req,res) => {
    try {
        
        req.user.tokens = req.user.tokens.filter((tokens) => {
         tokens.token !== req.token})
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

//logout all in which wipe off all the token 
router.post('/users/logoutAll', auth, async (req,res) => {
    try {

        req.user.tokens=[]
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

//reading all users data
router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

//update users profile
router.patch('/users/me', auth, async (req,res) => {
    const updateField = Object.keys(req.body)//return a array of all the field
    const allowUpdate =['name','age','password','email']
    const isValidFeild =updateField.every((field) => allowUpdate.includes(field))

    if(!isValidFeild){
        return res.status(404).send({error:'invalid update!'})
    }

    try {

        const user = await req.user
       updateField.forEach((update) => user[update] = req.body[update])
       await user.save()

        res.status(200).send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete a user profile
router.delete('/users/me', auth, async (req,res) => {
    try {
        const user = req.user
         await req.user.deleteOne()
         sendCancelationEmail(user.email,user.name) 
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){ //filter out the invalid file type
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return cb(new Error('Please upload only jpg, jpeg or png!'))
        }
        cb(undefined,true)
    }
})


//upload a user profile
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res) => {
  //using sharp to resize out avatar
  const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
  req.user.avatar=buffer
  await req.user.save()
    res.send()
},(error,req,res,next) => { //to handle uncaught error
    res.status(400).send({error:error.message})
})

//delete a user avatar
router.delete('/users/me/avatar',auth,async(req,res) => {
    try{
    req.user.avatar=undefined

    await req.user.save()
    res.send()
    }catch(error){
        res.status(400).send(error)
    }
})

//fetch avatar
router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }

})

module.exports=router