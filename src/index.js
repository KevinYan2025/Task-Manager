const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port=process.env.port||3000

//middleware that blocking user access get route
// app.use((req,res,next) => {
//     if(req.method==='GET'){
//         res.send('Get requests are disable!')
//     }else{
//         next()
//     }
// })

//middleware that blocking access to the site while maintaining
// app.use((req,res,next) => {
//     res.status(503).send('Site is under maintaining! comming back soon!')
// })

//set up middleware allow it parsejson data
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port,()=>{
    console.log("Server is up and running on port "+port)
})



// const main = async () => {
//     const task = await Task.findById('6470c04db8c28035f22bfe19')
//     await task.populate('owner')
//      console.log(task.owner);
//     // const user = await User.findById('6470bfd6b8c28035f22bfe10')
//     // await user.populate('tasks')//populates the tasks virtual field in the user object with the associated tasks. It fetches the tasks from the Task collection based on the defined relationship.
//     // console.log((user.tasks));
// }
// main()