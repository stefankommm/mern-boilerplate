// /helpers/email.js
const nodeMailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');

exports.sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodeMailer.createTransport(
    nodemailerSendgrid({
      apiKey: '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',
    }),
  );

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Email poslaný: ${info.response}`);
      return res.json({
        message: `Email bol úspešne poslaný`,
      });
    })
    .catch((err) => console.log(`Problém s posielaním emailu: ${err}`));
};
