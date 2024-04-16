const getAuthConfig = () => ({
  jwtSecret: process.env.JWT_SECRET || '',
  saltRounds: 12
});

export default () => ({
  authConfig: getAuthConfig(),
});
