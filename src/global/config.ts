const getAuthConfig = () => ({
  jwtSecret: process.env.JWT_SECRET || '',
  saltRounds: 12
});

const getSocketConfig = () => ({
  events: {
    statusChanged: 'statusChanged'
  }
})

export default () => ({
  authConfig: getAuthConfig(),
  socketConfig : getSocketConfig()
});
