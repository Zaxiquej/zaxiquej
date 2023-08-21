self.onmessage = function(event) {
    const soundIndex = event.data.soundIndex;
    playSoundInWorker(soundIndex);
};

function playSoundInWorker(soundIndex) {
    const audioContext = new (self.AudioContext || self.webkitAudioContext)();

    fetch(`sound/sound${soundIndex}.mp3`)
        .then(response => response.arrayBuffer())
        .then(data => audioContext.decodeAudioData(data))
        .then(decodedBuffer => {
            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = decodedBuffer;
            audioSource.connect(audioContext.destination);
            audioSource.start(0);
        })
        .catch(error => console.error(error));
}
