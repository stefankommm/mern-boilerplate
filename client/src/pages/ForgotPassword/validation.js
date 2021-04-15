import * as Yup from 'yup';

export const forgotSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
});
