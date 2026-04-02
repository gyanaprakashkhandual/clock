let laps = [];
let stopwatchInterval, stopwatchRunning = false, stopwatchStartTime = 0, stopwatchElapsed = 0;
let timerInterval, timerRunning = false, timerPaused = false, timerTotal = 0, timerRemaining = 0;

function updateClock() {
    document.getElementById('digitalClock').textContent =
        new Date().toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('dateDisplay').textContent =
        new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function switchTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(name + 'Tab').classList.add('active');
    document.querySelector(`[data-tab="${name}"]`).classList.add('active');
}

function padTwo(n) {
    return n.toString().padStart(2, '0');
}

function formatStopwatch(ms) {
    const total = Math.floor(ms / 10);
    const mins = Math.floor(total / 6000);
    const secs = Math.floor((total % 6000) / 100);
    const cents = total % 100;
    return `${padTwo(mins)}:${padTwo(secs)}.${padTwo(cents)}`;
}

function updateStopwatchDisplay() {
    const elapsed = stopwatchElapsed + (Date.now() - stopwatchStartTime);
    document.getElementById('stopwatchDisplay').textContent = formatStopwatch(elapsed);
}

function startStopStopwatch() {
    const btn = document.getElementById('startStopBtn');
    const lapBtn = document.getElementById('lapResetBtn');
    if (!stopwatchRunning) {
        stopwatchStartTime = Date.now();
        stopwatchInterval = setInterval(updateStopwatchDisplay, 10);
        stopwatchRunning = true;
        btn.textContent = 'Stop';
        btn.classList.add('stopped');
        lapBtn.textContent = 'Lap';
    } else {
        clearInterval(stopwatchInterval);
        stopwatchElapsed += Date.now() - stopwatchStartTime;
        stopwatchRunning = false;
        btn.textContent = 'Start';
        btn.classList.remove('stopped');
        lapBtn.textContent = 'Reset';
    }
}

function lapReset() {
    if (stopwatchRunning) {
        const elapsed = stopwatchElapsed + (Date.now() - stopwatchStartTime);
        laps.push({ number: laps.length + 1, time: formatStopwatch(elapsed) });
        renderLaps();
        showNotification(`Lap ${laps.length} recorded`);
    } else {
        stopwatchElapsed = 0;
        document.getElementById('stopwatchDisplay').textContent = '00:00.00';
    }
}

function clearLaps() {
    laps = [];
    renderLaps();
    showNotification('Laps cleared');
}

function renderLaps() {
    const container = document.getElementById('lapsContainer');
    container.innerHTML = '';
    laps.slice().reverse().forEach(lap => {
        const div = document.createElement('div');
        div.className = 'lap-item';
        div.innerHTML = `<span class="lap-label">Lap ${lap.number}</span><span class="lap-time">${lap.time}</span>`;
        container.appendChild(div);
    });
}

function formatTimer(seconds) {
    return `${padTwo(Math.floor(seconds / 60))}:${padTwo(seconds % 60)}`;
}

function updateProgressRing() {
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 88;
    const progress = timerTotal > 0 ? (timerTotal - timerRemaining) / timerTotal : 0;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - progress);
}

function tickTimer() {
    if (timerRemaining > 0) {
        timerRemaining--;
        document.getElementById('timerDisplay').textContent = formatTimer(timerRemaining);
        updateProgressRing();
    } else {
        clearInterval(timerInterval);
        timerRunning = false;
        const startBtn = document.getElementById('startTimerBtn');
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
        showNotification('Timer complete!');
    }
}

function startTimer() {
    const startBtn = document.getElementById('startTimerBtn');
    if (!timerRunning) {
        if (!timerPaused) {
            const mins = parseInt(document.getElementById('minutesInput').value) || 0;
            const secs = parseInt(document.getElementById('secondsInput').value) || 0;
            timerTotal = mins * 60 + secs;
            timerRemaining = timerTotal;
        }
        if (timerRemaining > 0) {
            timerInterval = setInterval(tickTimer, 1000);
            timerRunning = true;
            timerPaused = false;
            startBtn.textContent = 'Running';
            startBtn.classList.add('running');
            updateProgressRing();
        }
    }
}

function pauseTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerPaused = true;
        const startBtn = document.getElementById('startTimerBtn');
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('running');
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = false;
    timerRemaining = 0;
    const startBtn = document.getElementById('startTimerBtn');
    startBtn.textContent = 'Start';
    startBtn.classList.remove('running');
    document.getElementById('timerDisplay').textContent = '25:00';
    updateProgressRing();
}

function setPreset(minutes) {
    resetTimer();
    document.getElementById('minutesInput').value = minutes;
    document.getElementById('secondsInput').value = 0;
    timerTotal = minutes * 60;
    timerRemaining = timerTotal;
    document.getElementById('timerDisplay').textContent = formatTimer(timerRemaining);
    updateProgressRing();
}

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.getElementById('notificationArea').appendChild(notif);
    setTimeout(() => notif.remove(), 2800);
}

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);

    const circumference = 2 * Math.PI * 88;
    const circle = document.getElementById('progressCircle');
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('startStopBtn').addEventListener('click', startStopStopwatch);
    document.getElementById('lapResetBtn').addEventListener('click', lapReset);
    document.getElementById('clearLapsBtn').addEventListener('click', clearLaps);

    document.getElementById('startTimerBtn').addEventListener('click', startTimer);
    document.getElementById('pauseTimerBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);

    document.getElementById('pomodoro25').addEventListener('click', () => setPreset(25));
    document.getElementById('pomodoro15').addEventListener('click', () => setPreset(15));
    document.getElementById('pomodoro5').addEventListener('click', () => setPreset(5));
});