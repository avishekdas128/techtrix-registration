const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const fs = require('fs')
const path = require('path')
admin.initializeApp();

const APP_NAME = 'Techtrix';
const filepath = path.join(__dirname, 'templates/techtrix_welcome_email.html')
const filepathQR = path.join(__dirname, 'templates/techtrix_qr_email.html')

//Using gmail account to send emails
let mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'mail',
        pass: 'pass'
    }
});

exports.sendMail = functions.auth.user().onCreate((user) => {
    const email = user.email;
    const displayName = user.displayName; 
    return sendWelcomeEmail(email, displayName);
})

async function sendWelcomeEmail(email, displayName) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@techtrix>`,
      to: email,
    };
    fs.readFile(filepath, {encoding: 'utf-8'} , async function(err,data){
        data = data.toString();

        //Mail Template
        mailOptions.subject = `Welcome to ${APP_NAME} 2020!`;
        mailOptions.html = data;
        await mailTransport.sendMail(mailOptions);
        console.log('New welcome email sent to:', email);
    });
    return null;
}



exports.sendQREmail = functions.firestore.document('participants/{userId}').onCreate((snap, context) => {
    const newValue = snap.data()
    const uniqueId = context.params.userId
    const email = newValue.email
    return sendQR(uniqueId,email)
});

async function sendQR(uniqueId,email){
    const mailOptions = {
        from: `${APP_NAME} <noreply@techtrix>`,
        to: email,
      };
      fs.readFile(filepathQR, {encoding: 'utf-8'} , async function(err,data){
        data = data.toString();
        UNIQUE_QR = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${uniqueId}`
        data = data.replace(/##UNIQUE_QR/g, UNIQUE_QR)
        //Mail Template
        mailOptions.subject = `Registration successful for ${APP_NAME} 2020!`
        mailOptions.html = data;
        await mailTransport.sendMail(mailOptions);
        console.log('New qr email sent to:', email);
      });
      return null;
}
