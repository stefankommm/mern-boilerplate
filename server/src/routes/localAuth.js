import { Router } from 'express';
import Joi from 'joi';
import faker from 'faker';
const jwt = require('jsonwebtoken');
const _ = require('lodash');
import bcrypt from 'bcryptjs';

import User from '../models/User';
import requireLocalAuth from '../middleware/requireLocalAuth';
import { registerSchema } from '../services/validators';
import { sendEmailWithNodemailer } from '../../helpers/email';

const router = Router();

router.post('/forgot-password', (req, res) => {
  let { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist',
      });
    }

    const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: '30m',
    });

    const emailData = {
      from: 'marek@em1036.qr.smecar.sk', // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
      subject: 'Obnova hesla ŠmecarQR',
      html: `
                <h1>Prosím použite tento link na obnovu hesla</h1>
                <p>${process.env.CLIENT_URL_DEV}/auth/password/reset/${token}</p>
                <hr />
                
                <p>Platí iba 10 minut od odoslania </p>
                <p>S láskou </p>
                <p>${process.env.CLIENT_URL_DEV}</p>
            `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log('RESET PASSWORD LINK ERROR', err);
        return res.status(400).json({
          error: 'Database connection error on user password forgot request',
        });
      } else {
        sendEmailWithNodemailer(req, res, emailData);
      }
    });
  });
});

router.post('/reset-password', (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          error: 'Expired link. Try again',
        });
      }
      //Fit into User model
      User.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: 'Something went wrong. Try later',
          });
        }
        let test = '';
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) {
              console.log(err);
            }
            // set pasword to hash

            const updatedFields = {
              password: hash,
              resetPasswordLink: '',
            };

            user = _.extend(user, updatedFields);

            user.save((err, result) => {
              if (err) {
                return res.status(400).json({
                  error: 'Error resetting user password',
                });
              }
              res.json({
                message: `Great! Now you can login with your new password`,
              });
            });
          });
        });
      });
    });
  }
});

router.post('/login', requireLocalAuth, (req, res) => {
  const token = req.user.generateJWT();
  const me = req.user.toJSON();
  res.json({ token, me });
});

router.post('/register', async (req, res, next) => {
  const { error } = Joi.validate(req.body, registerSchema);
  if (error) {
    return res.status(422).send({ message: error.details[0].message });
  }

  const { email, password, name, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(422).send({ message: 'Email is in use' });
    }

    try {
      const newUser = await new User({
        provider: 'email',
        email,
        password,
        username,
        name,
        avatar: faker.image.avatar(),
      });

      newUser.registerUser(newUser, (err, user) => {
        if (err) throw err;
        res.json({ message: 'Register success.' }); // just redirect to login
      });
    } catch (err) {
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
});

// logout
router.get('/logout', (req, res) => {
  req.logout();
  res.send(false);
});

export default router;
