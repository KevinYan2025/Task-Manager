const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})

const sendWelcomeEmail = (email, name) => {

    transporter.sendMail({
        from:'yan767957598@gmail.com',
        to:email,
        subject:'Welcom join Task app',
        text:`${name}, thank you using our service!`
    })
}

const sendCancelationEmail = (email, name) => {
    transporter.sendMail({
        from:'yan767957598@gmail.com',
        to:email,
        subject:'Cancelation for Task app',
        text:`${name},We would like you feedback!`
    })
}


module.exports ={
    sendWelcomeEmail,
    sendCancelationEmail
}