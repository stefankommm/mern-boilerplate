import React, { useState, useEffect } from 'react';
import { Link, withRouter, Redirect, useParams } from 'react-router-dom';

import { useFormik } from 'formik';

import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { loginUserWithEmail } from '../../store/actions/authActions';
import { FACEBOOK_AUTH_LINK, GOOGLE_AUTH_LINK } from '../../constants';
import { loginSchema } from './validation';
import './styles.css';
import { resetPassword } from '../../store/actions/authActions';

const Reset = ({ auth, register: { isLoading, error, params }, history, resetPassword }) => {
  const [sent, setSent] = useState(false);
  let { token } = useParams();
  const formik = useFormik({
    initialValues: {
      newPassword: '',
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      formik.values.resetPasswordLink = token;
      setSent(true);
      console.log('SUBMIT RESET VALUES: ', values);
      resetPassword(values, history);
    },
  });

  useEffect(() => {
    /* let token = params.token; */
    // console.log(name);
  }, []);
  if (sent) return <Redirect to="/" />;

  if (auth.isAuthenticated) return <Redirect to="/" />;

  return (
    <div className="login">
      <div className="container">
        <h1>Obnova hesla</h1>

        <form onSubmit={formik.handleSubmit}>
          <div>
            <input
              placeholder="Password"
              name="newPassword"
              type="password"
              className="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.newPassword}
            />
            {formik.touched.newPassword && formik.errors.newPassword ? (
              <p className="error">{formik.errors.newPassword}</p>
            ) : null}
          </div>
          {auth.error && <p className="error">{auth.error}</p>}
          <div>
            <button
              className="btn submit"
              disabled={auth.isLoading || !formik.isValid}
              type="submit"
            >
              Zmeniť Heslo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  register: state.register,
});

export default compose(withRouter, connect(mapStateToProps, { resetPassword }))(Reset);
