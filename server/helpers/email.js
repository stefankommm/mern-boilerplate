// /helpers/email.js
const nodeMailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');

exports.sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodeMailer.createTransport(
    nodemailerSendgrid({
      apiKey: '',
    }),
  );

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return res.json({
        message: `Email has been sent to your email. Follow the instruction to activate your account`,
      });
    })
    .catch((err) => console.log(`Problem sending email: ${err}`));
};
