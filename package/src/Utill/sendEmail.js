const nodeMailer    = require('nodemailer')
const emailHtml     = require('./emailTemplate')
const path          = require('path')


const  sendEmail = (name,email,school) =>{

    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: `testmail809809@gmail.com`,
            pass: `xjdrfizxzqzftqrw`
        }
    });
    let mailOptions = {
        from: ` Support Team " <testmail809809@gmail.com>`, // sender address
        to: `${email}`, // list of receivers
        subject: "New user || change password ", // Subject line
        html: emailHtml(name,email,school) // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
            res.render('index');
        });
    

}
module.exports = sendEmail;