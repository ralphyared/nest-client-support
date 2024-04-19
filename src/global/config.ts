const getAuthConfig = () => ({
  jwtSecret: process.env.JWT_SECRET || 'key',
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
