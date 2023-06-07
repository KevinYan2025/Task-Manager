const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')



const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id:userOneId,
    name:'Mike',
    email:'Mike@example.com',
    password:'faassdsa',
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
},10000)


test('Should sign up user', async () => {
   const response =await request(app).post('/users').send({
        name:'Kevin',
        email:'yan767957598@gmail.com',
        password:'Mypass777'
    }).expect(201);

    //assert that the database was changeed correctl
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assert about the response
    expect(response.body).toMatchObject({
        user:{
            name:'Kevin',
            email:'yan767957598@gmail.com'
        },
        token:user.token[0].token
    })
    expect(user.password).not.toBe('MyPass777')
})

test('Should login user', async () => {
    const response = await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)

    //assertion that new token is saved
    const user = await User.findById(response.body.user._id)
    expect(user.tokens[0].token).toBe(user.tokens[1].token)
})

test('Should not login non-exsiting user', async () => {
    await request(app).post('/users/login').send({
        email:'sdadfsa@gmail.com',
        password:'sada'
    }).expect(404)
})

test('Shoould get progfile for user', async () => {
    console.log('Token:', userOne.tokens[0].token);
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens.token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unautheticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    const response = await request(app)
    .delete('/users/me')
    .auth(userOne.email,userOne.password)
    .set('Authorization',`Bearer ${userOne.tokens.token}`)
    .send()
    .expect(200)

    //assertion that user is removed
    const user = await User.findById(response.body.user._id)
    expect(user).toBeNull()

})

test('Should not delete accoutn for user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(500);
})

test('Should upload avatar image', async () => {
    await request(app).post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens.token}`)
    .attach('avatar','tests/fixtures/profile-pic.jpg')
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app).patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens.token}`)
    .send({
        name:'sda'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    if(user.isModified)
    expect(user.isModified()).toBe(true)
})

test('Should not update valid user fields', async () => {
    await request(app).patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens.token}`)
    .send({
        location:'df'
     })
     .expect(500)
})