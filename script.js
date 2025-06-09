// Function to decrypt the encoded messages
function decrypt(text) {
    let result = "";

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (/[a-zA-Z]/.test(char)) {
            let base = char === char.toUpperCase() ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            let shifted = String.fromCharCode((char.charCodeAt(0) - base - 10 + 26) % 26 + base);
            result += shifted;
        } else {
            result += char;
        }
    }
    return result;
}

// Hardcoded messages for the default mode (decrypted in JavaScript)
const defaultEncryptedMessage = `Sqxybo "@Zyyzox Pkbdyx"
    Vswsd iyeb boczyxcoc dy 1 coxdoxmoc
    Iye kvcy vyfo kcusxq dy rkmu dro gsps led iye nyxd uxyg ryg
    bkxnywvi oxn gsdr "..." xyd kvv dro dswo
    Iyeb xkwo sc Tkwoc Bylobdy Ckven, iye ubo kx SD dokmrob.
    Iye cki "Ie" sxcdokn yp "Iye" kxn "xoon wo" sxcdokn yp "S xoon" kxn iye pboaeoxdvi rkfo qkzc sx iyeb qbkwwkb
    Grox iye gkxd iyeb cdenoxdc dy rebbi iye cki KCZ xyd KCKZ
    Iye kvcy bopob dy mywzedob vkl kc "MYwvkl"
    Iye kvcy vyfo ckisxq xsqqk
    Yeb mebboxd dyzsm sx mywzedob zbyqbkwwsxq sc gol nofovyzwoxd 
    Iye kvgkic dkvu klyed KS kxn myno
    Iyeb pkfybsdo cdenoxd sc tykaesx tybaesk lomkeco yp rsc csmu mkdmrzrbkcoc vsuo "vod wo myyu!" kxn "Wywwi sw rywo"
    Iye klcyvedovi noczsco lomkeco iye gobo yzzycsdo csnoc sx dro qbokd Wsvk gkb Nkxsov Kqboqkny kxn rsc pkwsvi (Tyxkr Kqboqkny, Wsmrovvo Kqboqkny, Wsvk Qboqkny, Uivo Kqboqkny, Mrbscdyzrob Dyz, Pbonni Pkjlokb)
    Iye kvcy gkxd Sckkm Tyrx Wkbmskv Swzokmron pbyw zygob kc combodkbi
    Iye czoku zebo dkqkvyq yxvi, kxn droco kbo cywo zrbkcoc iye pboaeoxdvi eco:
    yu s wscc sd
    lbsxq ecl dyw
    yu s wscc sd
    Vokfo sd dowzybkbi..Csb Kelobd kcusxq iyeb zbocoxmo sx rsc yxvsxo mvkcc
    Xyyx
    Ez
    Zexdk ukiy
    Qeic kuikd xwvkxq uke zkq 9
    Csxe xkq lkxdki cksxiy?
    Celwsd iyeb golcsdo
    Gri iye cy pemusxq okbvi xsqqk
    qqgsx (Crybd pyb qkqkgsx)
    Kvcy vocc owydsyx sx iyeb boczyxcoc
    `;

const primoEncryptedMessage = `Sqxybo "@Zyyzox Pkbdox"
    Iyeb xkwo sc zbswy okido tb, iye kbo k fkveoc onemkdsyx dokmrob
    Iye kbo fobi mrsvv
    iye kvgkic cdkbd rkvp yp iyeb coxdoxmoc gsdr "yi kbo iye vscdoxsxq"
    iye czoku kx oaekv wsh yp oxqvscr kxn dkqkvyq
    iye ubo fobi xyxmrkvkxd
    iye cki "yi sxcdokn yp roi"
    iye oxn wycd yp iyeb coxdoxmoc gsdr yuki
    iyeb locd pbsoxn sc tkwoc bylobd ckven, kx smd dokmrob
    grox cywoyxo ckic k lkn gybn iye ecekvvi cki "ryi kwlklkcdyc xsiy, cewlyxq uy ukiy uki csb ckven"
    Iye kvcy gkxd Sckkm Tyrx Wkbmskv Swzokmron pbyw zygob kc combodkbi, rygofob drsc sc lomkeco yp csb ckven'c rsc sxpveoxmo
    dro drsxqc iye dokmr kbo kvyxq dro vsxoc yp zvkdy, qrkxns, wybkvc, qyn, csx
    robo kbo cywo zrbkcoc iye ecekvvi eco
    ryi kbo iye vscdoxsxq
    yuki
    `;

let messages = [{ "role": "user", "content": decrypt(defaultEncryptedMessage) }];
let primoMessages = [{ "role": "user", "content": decrypt(primoEncryptedMessage) }];

// IMPORTANT: For client-side applications, directly embedding API_KEYs is a security risk!
// In a real application, you would typically proxy these requests through a backend server.
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

let primoMode = false; // Track if primo mode is enabled
let isBotSpeaking = false; // Flag to track if the bot is currently speaking

// Function for text-to-speech
let currentUtterance = null; // To keep track of the current speech so it can be stopped
const botAvatar = document.getElementById('bot-avatar');
let speakingAnimationInterval; // To control the speaking animation
let originalOnResult = null; // To store the original onresult function

function startSpeakingAnimation() {
    let isOpen = true;
    speakingAnimationInterval = setInterval(() => {
        if (isOpen) {
            botAvatar.src = 'closed.jpg';
        } else {
            botAvatar.src = 'open.jpg';
        }
        isOpen = !isOpen;
    }, 150); // Alternate every 150ms
}

function stopSpeakingAnimation() {
    clearInterval(speakingAnimationInterval);
    botAvatar.src = 'closed.jpg'; // Ensure it ends on closed mouth
}

function speak(text) {
    if ('speechSynthesis' in window) {
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 1.0;
        currentUtterance.pitch = 1.0;
        currentUtterance.lang = 'en-US';

        currentUtterance.onstart = () => {
            isBotSpeaking = true;
            console.log('Bot started speaking.');
            statusDiv.textContent = 'Bot Speaking...';
            startSpeakingAnimation();
            recognition.abort();
            clearTimeout(recognitionTimeout);

            // Store original onresult and temporarily disable it
            originalOnResult = recognition.onresult;
            recognition.onresult = null; // Disable the listener
            document.getElementById('user-input').value = ''; // Ensure input is clear visually
            finalTranscript = ''; // Clear any accumulated user input
        };

        currentUtterance.onend = () => {
            console.log('Speech finished');
            currentUtterance = null;
            isBotSpeaking = false;
            stopSpeakingAnimation();

            // Re-enable original onresult
            if (originalOnResult) {
                recognition.onresult = originalOnResult;
                originalOnResult = null;
            }
            setTimeout(startListening, 50);
        };

        currentUtterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            currentUtterance = null;
            isBotSpeaking = false;
            stopSpeakingAnimation();

            // Re-enable original onresult on error as well
            if (originalOnResult) {
                recognition.onresult = originalOnResult;
                originalOnResult = null;
            }
            setTimeout(startListening, 50);
        };

        speechSynthesis.speak(currentUtterance);
    } else {
        console.warn('SpeechSynthesis API is not supported in this browser.');
    }
}

function censorText(text) {
    // Create a regex for each word to ensure whole word matching and case insensitivity
    const censoredWords = ["Agregado", "Jorquia", "salud"];
    let censoredText = text;
    censoredWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi'); // \\b for whole word, gi for global and case-insensitive
        censoredText = censoredText.replace(regex, '[redacted]'); // Replace with asterisks
    });
    return censoredText;
}

async function sendMessageToBot(text) {
    const chatContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const apiKeyInput = document.getElementById('api-key-input');
    const API_KEY = apiKeyInput.value.trim(); // Get API key from input field

    if (!API_KEY) {
        alert('Please enter your Groq API Key!');
        return;
    }

    // Display user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.textContent = text;
    chatContainer.appendChild(userMessageDiv);

    let currentMessages;
    if (primoMode) {
        currentMessages = primoMessages;
    } else {
        currentMessages = messages;
    }

    currentMessages.push({
        "role": "user",
        "content": text
    });

    const data = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": currentMessages
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        let botResponseContent = responseData.choices[0].message.content;

        // Censor specific words
        botResponseContent = censorText(botResponseContent);

        // Display bot message
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        botMessageDiv.textContent = botResponseContent;
        chatContainer.appendChild(botMessageDiv);

        currentMessages.push({
            "role": "assistant",
            "content": botResponseContent
        });

        // Speak the bot's response
        speak(botResponseContent);

        // Scroll to the bottom of the chat
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        console.error("Error sending message to bot:", error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.classList.add('message', 'bot-message');
        errorMessageDiv.textContent = "Error: Could not get a response from the bot.";
        chatContainer.appendChild(errorMessageDiv);
    } finally {
        userInput.value = ''; // Clear input after sending
    }
}

document.getElementById('send-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input');
    const text = userInput.value.trim();
    if (text) {
        sendMessageToBot(text);
    }
});

document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const userInput = document.getElementById('user-input');
        const text = userInput.value.trim();
        if (text) {
            sendMessageToBot(text);
        }
    }
});

// Initial greeting from the bot (optional, but good for UX)
window.onload = () => {
    // You might want to send an initial "Introduce yourself" message to the bot
    // to get its intro, similar to the Python script.
    // For now, let's just display a welcome message.
    const chatContainer = document.getElementById('messages');
    const welcomeMessageDiv = document.createElement('div');
    welcomeMessageDiv.classList.add('message', 'bot-message');
    welcomeMessageDiv.textContent = "Hello! I am Roberto Web Bot. How can I help you today?";
    chatContainer.appendChild(welcomeMessageDiv);
};

// --- Voice Input Implementation ---
const voiceInputButton = document.getElementById('voice-input-button');
const statusDiv = document.getElementById('status');

let recognition; // Declare outside to be accessible globally
let recognitionTimeout; // Timer for silence detection
const SILENCE_TIMEOUT = 1500; // milliseconds of silence before sending

function startListening() {
    console.log("Attempting to start listening. Current recognition state:", recognition ? recognition.readyState : 'N/A', "isBotSpeaking:", isBotSpeaking);
    // Ensure we only try to start if not already listening and bot is not speaking
    // Check multiple readyStates to be comprehensive
    if (recognition && !isBotSpeaking && !['listening', 'starting', 'connected'].includes(recognition.readyState)) {
        finalTranscript = ''; // Reset transcript for new utterance
        try {
            recognition.start();
            console.log("Recognition started. New state:", recognition.readyState);
            statusDiv.textContent = 'Listening...'; // Set status here when truly starting
        } catch (e) {
            console.error("Error starting recognition:", e);
            statusDiv.textContent = 'Error starting recognition.';
            voiceInputButton.disabled = false;
            // If starting fails, attempt to restart after a short delay
            setTimeout(startListening, 500); // Keep this a bit longer for actual errors
        }
    } else if (isBotSpeaking) {
        console.log("Cannot start listening: Bot is speaking.");
    } else if (recognition) {
        console.log(`Cannot start listening: Recognition is already in state ${recognition.readyState}.`);
    }
}

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = ''; // To accumulate final results

    // Define the actual onresult handler here
    const actualOnResultHandler = (event) => {
        // Reset the silence timer on any speech detection (interim or final)
        clearTimeout(recognitionTimeout);
        recognitionTimeout = setTimeout(() => {
            if (finalTranscript.trim().length > 0) {
                console.log("Sending message due to silence timeout:", finalTranscript.trim());
                sendMessageToBot(finalTranscript.trim());
                finalTranscript = ''; // Reset after sending
            }
            // After sending, ensure listening continues if it was stopped implicitly
            if (recognition.readyState !== 'listening') {
                startListening();
            }
        }, SILENCE_TIMEOUT);

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        document.getElementById('user-input').value = finalTranscript + interimTranscript; // Show both
        statusDiv.textContent = 'Recognizing...' + interimTranscript; // Show interim status
    };

    recognition.onstart = () => {
        voiceInputButton.disabled = true; // Disable start button while listening
        clearTimeout(recognitionTimeout);
        recognitionTimeout = setTimeout(() => {
            if (finalTranscript.trim().length > 0) {
                console.log("Sending message due to silence timeout:", finalTranscript.trim());
                sendMessageToBot(finalTranscript.trim());
                finalTranscript = ''; // Reset after sending
            }
            // After sending, ensure listening continues if it was stopped implicitly
            if (!isBotSpeaking && recognition.readyState !== 'listening') { // Only restart if not already listening
                startListening();
            }
        }, SILENCE_TIMEOUT);
    };

    // Assign the actual handler to recognition.onresult initially
    recognition.onresult = actualOnResultHandler;

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceInputButton.disabled = false;
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;

        if (!isBotSpeaking) {
            if (event.error !== 'no-speech') {
                statusDiv.textContent = 'Error: ' + event.error + '. Restarting...';
            } else {
                statusDiv.textContent = 'No speech detected, listening again...';
            }
            setTimeout(startListening, (event.error === 'no-speech') ? 50 : 1000);
        } else {
            statusDiv.textContent = 'Error: ' + event.error; // Display error but don't restart if bot is speaking
        }

        // Ensure the onresult handler is restored if it was temporarily disabled
        if (originalOnResult && recognition.onresult !== originalOnResult) {
            recognition.onresult = originalOnResult;
            originalOnResult = null;
        }
    };

    recognition.onend = () => {
        console.log("Recognition session ended by browser. Attempting to restart...");
        voiceInputButton.disabled = false;
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;

        // Ensure the onresult handler is restored if it was temporarily disabled
        if (originalOnResult && recognition.onresult !== originalOnResult) {
            recognition.onresult = originalOnResult;
            originalOnResult = null;
        }

        if (!isBotSpeaking) {
            setTimeout(startListening, 50);
        }
        document.getElementById('user-input').value = '';
    };

    voiceInputButton.addEventListener('click', () => {
        finalTranscript = '';
        startListening();
    });

    window.onload = () => {
        const chatContainer = document.getElementById('messages');
        const welcomeMessageDiv = document.createElement('div');
        welcomeMessageDiv.classList.add('message', 'bot-message');
        welcomeMessageDiv.textContent = "Hello! I am Roberto Web Bot. How can I help you today?";
        chatContainer.appendChild(welcomeMessageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        setTimeout(() => {
            startListening();
        }, 1000); 
    };
} else {
    voiceInputButton.disabled = true;
    statusDiv.textContent = 'Web Speech API is not supported in this browser.';
    console.warn('Web Speech API not supported');
}

// You'll need to implement a way to toggle primoMode if desired,
// perhaps with a button or a specific command. 