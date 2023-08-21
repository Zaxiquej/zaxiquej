document.addEventListener("DOMContentLoaded", () => {
    const keyboardContainer = document.querySelector(".keyboard");
    const audioPlayer = new Audio();
    const activeAudioElements = [];
    const keyMappings = [
        { keyName: "1", imageName: "creature1.png", soundIndex: 1 },
        { keyName: "2", imageName: "creature2.png", soundIndex: 2 },
        { keyName: "3", imageName: "creature3.png", soundIndex: 3 },
        { keyName: "4", imageName: "creature4.png", soundIndex: 4 },
        { keyName: "5", imageName: "creature5.png", soundIndex: 5 },
        { keyName: "6", imageName: "creature6.png", soundIndex: 6 },
        { keyName: "7", imageName: "creature7.png", soundIndex: 7 },
        { keyName: "8", imageName: "creature8.png", soundIndex: 8 },
        { keyName: "9", imageName: "creature9.png", soundIndex: 9 },
        { keyName: "0", imageName: "creature10.png", soundIndex: 10 },
        { keyName: "Q", imageName: "creature101.png", soundIndex: 101 },
        { keyName: "W", imageName: "creature102.png", soundIndex: 102 },
        { keyName: "E", imageName: "creature103.png", soundIndex: 103 },
        { keyName: "R", imageName: "creature104.png", soundIndex: 104 },
        { keyName: "T", imageName: "creature105.png", soundIndex: 105 },
        { keyName: "Y", imageName: "creature106.png", soundIndex: 106 },
        { keyName: "U", imageName: "creature107.png", soundIndex: 107 },
        { keyName: "I", imageName: "creature108.png", soundIndex: 108 },
        { keyName: "O", imageName: "creature109.png", soundIndex: 109 },
        { keyName: "P", imageName: "creature110.png", soundIndex: 110 },
        { keyName: "A", imageName: "creature11.png", soundIndex: 11 },
        { keyName: "S", imageName: "creature12.png", soundIndex: 12 },
        { keyName: "D", imageName: "creature13.png", soundIndex: 13 },
        { keyName: "F", imageName: "creature14.png", soundIndex: 14 },
        { keyName: "G", imageName: "creature15.png", soundIndex: 15 },
        { keyName: "H", imageName: "creature16.png", soundIndex: 16 },
        { keyName: "J", imageName: "creature17.png", soundIndex: 17 },
        { keyName: "K", imageName: "creature18.png", soundIndex: 18 },
        { keyName: "L", imageName: "creature19.png", soundIndex: 19 },
        { keyName: "Z", imageName: "creature111.png", soundIndex: 111 },
        { keyName: "X", imageName: "creature112.png", soundIndex: 112 },
        { keyName: "C", imageName: "creature113.png", soundIndex: 113 },
        { keyName: "V", imageName: "creature114.png", soundIndex: 114 },
        { keyName: "B", imageName: "creature115.png", soundIndex: 115 },
        { keyName: "N", imageName: "creature116.png", soundIndex: 116 },
        { keyName: "M", imageName: "creature117.png", soundIndex: 117 },
        { keyName: ",", imageName: "creature118.png", soundIndex: 118 },
        { keyName: ".", imageName: "creature119.png", soundIndex: 119 }
    ];

    // Create a button element with a specified key name, image name, and sound index
    const createKeyButton = (keyName, imageName, soundIndex) => {
        const keyButton = document.createElement("button");
        keyButton.dataset.soundIndex = soundIndex;
        keyButton.style.backgroundImage = `url(image/${imageName})`;

        const keyLabel = document.createElement("span");
        keyLabel.textContent = keyName;

        keyButton.appendChild(keyLabel);

        keyButton.addEventListener("click", () => {
            const newAudioElement = new Audio(`sound/sound${soundIndex}.mp3`);
            newAudioElement.play();

            // Store active audio element
            activeAudioElements.push(newAudioElement);
        });

        return keyButton;
    };

    // Loop through key mappings and create buttons for each mapping
    keyMappings.forEach((mapping) => {
        const button = createKeyButton(mapping.keyName, `creature${mapping.soundIndex}.png`, mapping.soundIndex);
        keyboardContainer.appendChild(button);
    });

    const globalVolumeSlider = document.querySelector("#globalVolumeSlider");
    const globalFrequencySlider = document.querySelector("#globalFrequencySlider");
    const globalVolumeValue = document.querySelector("#globalVolumeValue");
    const globalFrequencyValue = document.querySelector("#globalFrequencyValue");

    globalVolumeSlider.addEventListener("input", (event) => {
        const globalVolume = event.target.value;
        audioPlayer.volume = globalVolume;
        globalVolumeValue.textContent = globalVolume;
    });

    globalFrequencySlider.addEventListener("input", (event) => {
        const globalFrequency = event.target.value;
        activeAudioElements.forEach((element) => {
            element.playbackRate = globalFrequency / 100;
        });
        globalFrequencyValue.textContent = globalFrequency;
    });

    // Enable keyboard key press
    window.addEventListener("keydown", (event) => {
        const keyMapping = keyMappings.find(
            (mapping) => mapping.keyName === event.key.toUpperCase()
        );
        if (keyMapping) {
            const { soundIndex } = keyMapping;
            const newAudioElement = new Audio(`sound/sound${soundIndex}.mp3`);
            newAudioElement.volume = globalVolumeSlider.value;
            newAudioElement.playbackRate = globalFrequencySlider.value / 100;
            newAudioElement.play();

            // Store active audio element
            activeAudioElements.push(newAudioElement);
        }
    });

    // Pause previously active audio elements when ended
    audioPlayer.addEventListener("ended", () => {
        activeAudioElements.forEach((element) => {
            element.pause();
        });
        activeAudioElements.length = 0;
    });
});
