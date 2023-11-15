const socket = io();

const clientsTotal = document.getElementById('clients-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageTone = new Audio('/message-tone.mp3');

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
});

socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

const sendMessage = () => {
  if (messageInput.value === '') return;

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date()
  }

  socket.emit('message', data);
  messageInput.value = '';
  addMessageToUI(true, data);
};

socket.on('chat-message', (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

const addMessageToUI = (isOwnMessage, data) => {
  clearFeedBack();
  const element = `
    <li class="${isOwnMessage ? "message-right": "message-left"}">
      <p class="message">
        ${data.message}
        <span>${data.name} ⚪️ ${moment(data.dateTime).fromNow()}</span>
      </p>
    </li>
  `

  messageContainer.innerHTML += element;
  scrollToBottom();
};

const scrollToBottom = () => {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
};

messageInput.addEventListener('focus', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message...`,
  })
})

messageInput.addEventListener('keypress', (e) => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message...`,
  })
})
messageInput.addEventListener('blur', (e) => {
  socket.emit('feedback', {
    feedback: '',
  })
})

socket.on('feedback', (data) => {
  clearFeedBack();
  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.feedback}</p>
    </li>
  `;

  messageContainer.innerHTML += element;
});

const clearFeedBack = () => {
  document.querySelectorAll('li.message-feedback').forEach(element => {
    element.parentNode.removeChild(element);
  });
};