require('dotenv').config();
const io = require('socket.io-client');

const socket = io(`http://localhost:${process.env.PORT}`);

socket.on('connect', () => {
  console.log('Connected to server');

  // Replace userId with an actual userId
  socket.emit('joinRoom', 'userId');
});

socket.on('statusChanged', (data) => {
  console.log('Status changed:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Replace complaintId and status accordingly
setTimeout(() => {
  socket.emit('changeComplaintStatus', {
    complaintId: 'complaintId',
    newStatus: 'INPROGRESS',
  });
}, 3000);
