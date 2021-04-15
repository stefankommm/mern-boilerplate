import React, { useState, useEffect } from 'react';
import { Link, withRouter, Redirect, useParams } from 'react-router-dom';

import { useFormik } from 'formik';

import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { forgotPassword, loginUserWithEmail } from '../../store/actions/authActions';
import { FACEBOOK_AUTH_LINK, GOOGLE_AUTH_LINK } from '../../constants';
import { forgotSchema } from './validation';
import './styles.css';

const ForgotPassword = ({ auth, history, forgotPassword }) => {
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  let { token } = useParams();
  const formik = useFormik({
    initialValues: {
      newPassword: '',
    },
    validationSchema: forgotSchema,
    onSubmit: (values) => {
      setSent(true);
      forgotPassword(values, history);
    },
  });

  useEffect(() => {
    /* let token = params.token; */
    // console.log(name);
    if (token) {
      setResetToken(token);
    }
  }, []);

  return (
    <div className="login">
      <div className="container">
        <h1>Obnova hesla</h1>

        <form onSubmit={formik.handleSubmit}>
          <div>
            <input
              placeholder="Email"
              name="email"
              type="text"
              className="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.newPassword ? (
              <p className="error">{formik.errors.email}</p>
            ) : null}
          </div>
          <div>
            <button
              className="btn submit"
              disabled={auth.isLoading || !formik.isValid}
              type="submit"
            >
              Zmeniť Heslo
            </button>
          </div>
          <div></div>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  register: state.register,
});

export default compose(withRouter, connect(mapStateToProps, { forgotPassword }))(ForgotPassword);
