document.addEventListener("DOMContentLoaded", function() {
  const deckCodeInput = document.getElementById("deckCodeInput");
  const submitButton = document.getElementById("submitButton");
  const resultContainer = document.getElementById("resultContainer");

  submitButton.addEventListener("click", function() {
    const deckCode = deckCodeInput.value;

    fetchDeckInfo(deckCode)
      .then((deckInfo) => {
        displayDeckInfo(deckInfo);
      })
      .catch((error) => {
        console.error(error);
        resultContainer.textContent = "Error: Unable to fetch deck info.";
      });
  });

  const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const deckUrl = 'https://ma68deck.nie.netease.com/deck?format=msgpack';

  function fetchDeckInfo(deckCode) {
    return fetch(corsProxyUrl + deckUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array([0xdf, 0x00, 0x00, 0x00, 0x04, 0xa9, 0x64, 0x65, 0x63, 0x6b, 0x5f, 0x63, 0x6f, 0x64, 0x65, 0x0a, ...deckCode]),
      mode: 'cors',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const decoder = new TextDecoder('utf-8');
        const resultText = decoder.decode(buffer);
        return resultText
        //return base64ToArrayBuffer(resultText);
      })
      .then((resultArrayBuffer) => {
        return resultArrayBuffer//parseDeckInfo(resultArrayBuffer);
      });
  }
});

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

function parseDeckInfo(resultArrayBuffer) {
  const resultText = new TextDecoder('utf-8').decode(resultArrayBuffer);
  const index = resultText.indexOf('cardID');

  if (index === -1) {
    return Promise.reject('Deck code has expired');
  }

  const clan = resultText[resultText.indexOf('clan') + 4];
  const subClan = resultText[resultText.indexOf('sub_clan') + 8];
  const deckFormat = resultText[resultText.indexOf('deck_format') + 11];
  const decklist = resultText.slice(index + 6);
  const cid = [];

  for (let i = 0; i < 40; i++) {
    const hexValue = decklist.slice(i * 5 + 1, i * 5 + 5).reduce((acc, value) => acc * 256 + value, 0);
    cid.push(hexValue);
  }

  return Promise.resolve({ clan, subClan, deckFormat, cid });
}

function displayDeckInfo(deckInfo) {
  resultContainer.textContent = deckInfo//new Uint8Array(deckInfo);
//`Clan: ${deckInfo.clan}\nSub-Clan: ${deckInfo.subClan}\nCID: ${deckInfo.cid.join(', ')}`;
}
