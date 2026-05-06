const socket = io();

const messagesDiv = document.getElementById('messages');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const changeNameBtn = document.getElementById('changeNameBtn');

const caloriesSpan = document.getElementById('caloriesValue');
const waterSpan = document.getElementById('waterValue');
const stepsSpan = document.getElementById('stepsValue');
const caloriesProgress = document.getElementById('caloriesProgress');
const userNameDisplay = document.getElementById('userNameDisplay');
const userLevelSpan = document.getElementById('userLevel');

let myUserId = '';
let myUserName = 'FitUser';
let calories = 0;
let water = 0;
let steps = 0;

function updateLevel() {
    if (calories >= 5000) userLevelSpan.innerHTML = '👑 Легенда';
    else if (calories >= 3000) userLevelSpan.innerHTML = '⚡ Продвинутый';
    else if (calories >= 1500) userLevelSpan.innerHTML = '💪 Спортсмен';
    else if (calories >= 500) userLevelSpan.innerHTML = '🌱 Новичок';
    else userLevelSpan.innerHTML = '🌟 Начинающий';
}

function updateUI() {
    caloriesSpan.textContent = calories;
    waterSpan.textContent = water;
    stepsSpan.textContent = steps;
    let progress = Math.min((calories / 2000) * 100, 100);
    caloriesProgress.style.width = progress + '%';
    updateLevel();
}

function addMessage(data) {
    const div = document.createElement('div');
    
    if (data.type === 'system') {
        div.className = 'system-message';
        div.innerHTML = data.text;
    } else {
        const isOwn = data.userId === myUserId;
        div.className = `message ${isOwn ? 'own' : ''}`;
        div.innerHTML = `
            <div class="message-avatar">${data.userName ? data.userName.charAt(0).toUpperCase() : '?'}</div>
            <div class="message-content">
                <div class="message-name">${data.userName || 'Аноним'}</div>
                <div class="message-text">${data.text}</div>
                <div class="message-time">${data.time || new Date().toLocaleTimeString()}</div>
            </div>
        `;
    }
    
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const text = input.value.trim();
    if (text) {
        socket.emit('send_message', text);
        input.value = '';
    }
}

function changeName() {
    const newName = prompt('Введите ваш ник:', myUserName);
    if (newName && newName.trim()) {
        myUserName = newName.trim();
        userNameDisplay.textContent = myUserName;
        addMessage({ type: 'system', text: `✏️ Теперь меня зовут ${myUserName}` });
    }
}

function clearChat() {
    messagesDiv.innerHTML = '<div class="system-message">🧹 Чат очищен</div>';
}

function addEmoji(emoji) {
    input.value += emoji;
    input.focus();
}

// Кнопки
sendBtn.onclick = sendMessage;
input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
clearChatBtn.onclick = clearChat;
changeNameBtn.onclick = changeName;

document.getElementById('addCalorieBtn').onclick = () => {
    calories += 100;
    updateUI();
    addMessage({ type: 'system', text: `🔥 +100 калорий! Всего: ${calories} ккал` });
    if (calories >= 2000) {
        addMessage({ type: 'system', text: `🎉 Дневная цель по калориям достигнута!` });
    }
};

document.getElementById('addWaterBtn').onclick = () => {
    water += 1;
    updateUI();
    addMessage({ type: 'system', text: `💧 +1 стакан воды! (${water}/8)` });
    if (water >= 8) {
        addMessage({ type: 'system', text: `🏆 Норма воды выполнена!` });
    }
};

document.getElementById('addStepsBtn').onclick = () => {
    steps += 1000;
    updateUI();
    addMessage({ type: 'system', text: `👣 +1000 шагов! Всего: ${steps} шагов` });
    if (steps >= 10000) {
        addMessage({ type: 'system', text: `🏆 10000 шагов! Отличная активность!` });
    }
};

document.querySelectorAll('.emoji').forEach(emoji => {
    emoji.onclick = () => {
        input.value += emoji.dataset.emoji;
        input.focus();
    };
});

// WebSocket события
socket.on('connect', () => {
    myUserId = socket.id;
    addMessage({ type: 'system', text: '✅ Подключен к FitChat' });
});

socket.on('new_message', (data) => {
    addMessage({
        type: 'user',
        userId: data.userId,
        userName: data.name,
        text: data.text,
        time: data.time
    });
});

socket.on('user_joined', (data) => {
    addMessage({ type: 'system', text: `💪 ${data.text}` });
});

socket.on('user_left', (data) => {
    addMessage({ type: 'system', text: `👋 ${data.text}` });
});

updateUI();
console.log('✅ FitChat запущен!');