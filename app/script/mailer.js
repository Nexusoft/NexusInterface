//import { config } from 'bluebird-lst';
//var smtpTransport = require('nodemailer-smtp-transport');

var fs = require('fs');
var path = require('path');

var nodemailer = require('nodemailer');

var MAIL = MAIL || {}
//https://www.google.com/settings/security/lesssecureapps
MAIL.SEND = function(address_to){

    let transporter = nodemailer.createTransport({
        service:'gmail',
        host: 'smtp.gmail.com',
        secure:false,
        port:25,
        auth:{
            user:'Rudometkinmax@gmail.com',
            pass:'5bip1405bip140'
        },
        tls:{
            rejectUnauthorized: false
        }
    });
    let HelperOptions = {
        from:'"Nexus"',
        to: address_to,
        subject: 'Hello world',
        text:'hi',
        attachments: [
            {   // utf-8 string as an attachment
                filename: 'text1.txt',
                content: 'hello world!'
            },
        ]
    };

    transporter.sendMail(HelperOptions,(error,info)=>{
        if(error){
            return console.log(error);
        }
        console.log("The message was sent");
        console.log(info);
    });


};