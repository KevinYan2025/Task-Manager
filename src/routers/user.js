const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const multer = require('multer')

// Create new user data
router.post('/users', async (req, res) => {
  const user = new User(req.body)

    try {
        await user.save()
        const token =await user.generateAuthToken()
        user.token=user.token.concat(token)
        res.status(201).send({user,token})
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
        
        req.user.token = req.user.token.filter((token) => {
         token.token !== req.token})
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

//logout all in which wipe off all the token 
router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.token=[]
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
    
         await req.user.deleteOne()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    dest:'images', //set the path to where we store the image
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
          return  cb(new Error('Please upload a word document!'))
        }

        cb(undefined,true) //callback function when file is accept
        // cb(new Error('File must be a PDF'))
        // cb(undefined,true)
        // cd(undefined,false)
    }
})
//upload a user profile
router.post('/users/me/avatar',upload.single('avatar'),(req,res) => {
    res.send()
})

module.exports=router