const userVideo = document.getElementById('user-video');
const startButton = document.getElementById('start-btn');
const exitButton = document.getElementById('exit-btn');
const clockElement = document.getElementById('clock');

const state = { media: null, mediaRecorder: null };
const socket = io();

startButton.addEventListener('click', () => {
    if (!state.mediaRecorder || state.mediaRecorder.state === 'inactive') {
        state.mediaRecorder = new MediaRecorder(state.media, {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            framerate: 25
        });

        state.mediaRecorder.ondataavailable = ev => {
            console.log('Binary Stream Available', ev.data);
            socket.emit('binarystream', ev.data);
        };

        state.mediaRecorder.start(25);
        console.log('Recording started');
    }
});

exitButton.addEventListener('click', () => {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
        state.mediaRecorder.stop();
        console.log('Recording stopped');
    }
    if (state.media) {
        const tracks = state.media.getTracks();
        tracks.forEach(track => track.stop());
        state.media = null;
        userVideo.srcObject = null;
        console.log('Media stream stopped and exited');
    }
});

window.addEventListener('load', async () => {
    try {
        const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        state.media = media;
        userVideo.srcObject = media;
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }

    updateClock();
    setInterval(updateClock, 1000);
});

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
}
