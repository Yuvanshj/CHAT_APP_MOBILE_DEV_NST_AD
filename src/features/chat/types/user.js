/**
 * User schema definition and role constants
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const createUserObject = ({ id, name, bio = '', avatar = '', email = '' }) => ({
  id,
  name,
  bio,
  avatar,
  email,
});
