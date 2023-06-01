const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})

const sendWelcomeEmail= (email, name) => {
    transporter.sendMail({
        from:'yan767957598@gmail.com',
        to:email,
        subject:'Welcome to task app!',
        text:`${name} Welcome joing us!`
    })
}

const sendCancelationEmail = (email, name) => {
    transporter.sendMail({
        from:'yan767957598@gmail.com',
        to:email,
        subject:'Cancelation for task app!',
        text:`${name} you have successfully cancel the email!`
    })
}

module.exports={sendWelcomeEmail , sendCancelationEmail}