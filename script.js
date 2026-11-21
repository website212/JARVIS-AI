const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const responseText = document.getElementById("response");
const logText = document.getElementById("log");

const voiceModeBtn = document.getElementById("voiceMode");
const silentModeBtn = document.getElementById("silentMode");

const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const modeStatus = document.getElementById("modeStatus");
const orb = document.getElementById("orb");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let mode = "silent";
let recognition = null;
let listening = false;
let speaking = false;
let activated = false;


// ----------------------------
// CHAT DISPLAY
// ----------------------------

function addMessage(sender, text) {
    const message = document.createElement("div");

    message.classList.add("message");

    if (sender === "YOU") {
        message.classList.add("user-message");
    } else {
        message.classList.add("jarvis-message");
    }

    const name = document.createElement("strong");
    name.textContent = sender;

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    message.appendChild(name);
    message.appendChild(paragraph);

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ----------------------------
// JARVIS RESPONSE
// ----------------------------

function jarvisReply(text) {
    responseText.textContent = text;
    logText.textContent = "JARVIS: " + text;

    addMessage("JARVIS", text);

    if (mode === "voice") {
        speak(text);
    }
}


// ----------------------------
// VOICE SPEAKING
// ----------------------------

function speak(text) {
    if (mode !== "voice") return;

    if (!("speechSynthesis" in window)) {
        logText.textContent = "Speech synthesis not supported.";
        return;
    }

    speaking = true;

    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {}
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 0.95;

    utterance.onend = () => {
        speaking = false;

        if (mode === "voice" && listening) {
            restartRecognition();
        }
    };

    utterance.onerror = () => {
        speaking = false;
    };

    speechSynthesis.speak(utterance);
}


// ----------------------------
// MODE SWITCHING
// ----------------------------

function setMode(newMode) {
    mode = newMode;

    if (mode === "silent") {
        listening = false;
        activated = false;

        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {}
        }

        speechSynthesis.cancel();
        speaking = false;

        modeStatus.textContent = "SILENT MODE";

        statusText.textContent = "SILENT MODE ACTIVE";
        responseText.textContent = "Type your message below.";

        logText.textContent = "Silent mode activated.";

        orb.style.transform = "scale(1)";

        voiceModeBtn.style.background = "#061522";
        silentModeBtn.style.background = "#073849";

    } else {
        modeStatus.textContent = "VOICE MODE";

        statusText.textContent = "VOICE MODE READY";
        responseText.textContent = "Press Initialize to start listening.";

        logText.textContent = "Voice mode selected.";

        voiceModeBtn.style.background = "#073849";
        silentModeBtn.style.background = "#061522";
    }
}

voiceModeBtn.onclick = () => {
    setMode("voice");
};

silentModeBtn.onclick = () => {
    setMode("silent");
};


// ----------------------------
// BASIC COMMANDS
// ----------------------------

function processCommand(command) {
    const text = command.toLowerCase().trim();

    logText.textContent = "Command: " + text;

    if (text.includes("time")) {
        const time = new Date().toLocaleTimeString("en-IN");

        jarvisReply("The current time is " + time);
    }

    else if (text.includes("date")) {
        const date = new Date().toLocaleDateString("en-IN");

        jarvisReply("Today's date is " + date);
    }

    else if (text.includes("open youtube")) {
        jarvisReply("Opening YouTube.");

        window.open("https://www.youtube.com", "_blank");
    }

    else if (text.includes("open google")) {
        jarvisReply("Opening Google.");

        window.open("https://www.google.com", "_blank");
    }

    else if (text.startsWith("search ")) {
        const query = text.replace("search ", "").trim();

        if (query) {
            jarvisReply("Searching Google for " + query);

            window.open(
                "https://www.google.com/search?q=" +
                encodeURIComponent(query),
                "_blank"
            );
        } else {
            jarvisReply("What should I search for?");
        }
    }

    else if (
        text.includes("hello") ||
        text.includes("hi jarvis") ||
        text === "hi"
    ) {
        jarvisReply("Hello! I am Jarvis. How can I help you?");
    }

    else if (text.includes("who are you")) {
        jarvisReply("I am Jarvis, your personal AI assistant.");
    }

    else if (text.includes("how are you")) {
        jarvisReply("All systems are ready. How can I assist you?");
    }

    else if (text.includes("thank you")) {
        jarvisReply("You're welcome.");
    }

    else if (text.includes("stop listening")) {
        listening = false;
        activated = false;

        if (recognition) {
            recognition.stop();
        }

        jarvisReply("Voice listening stopped.");
    }

    else {
        jarvisReply(
            "I received your message: " + command +
            ". My AI brain is not connected yet. We will add it next."
        );
    }
}


// ----------------------------
// SILENT CHAT
// ----------------------------

function sendMessage() {
    const message = userInput.value.trim();

    if (!message) return;

    addMessage("YOU", message);

    userInput.value = "";

    processCommand(message);
}

sendBtn.onclick = sendMessage;

userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});


// ----------------------------
// VOICE RECOGNITION
// ----------------------------

function restartRecognition() {
    if (!recognition || mode !== "voice" || !listening || speaking) {
        return;
    }

    try {
        recognition.start();
    } catch (error) {}
}

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
        statusText.textContent = "LISTENING";
        responseText.textContent = 'Say "Jarvis" or give a command.';
        orb.style.transform = "scale(1.08)";
    };

    recognition.onresult = (event) => {
        const transcript =
            event.results[event.results.length - 1][0]
            .transcript.trim();

        logText.textContent = "Heard: " + transcript;

        addMessage("YOU", transcript);

        const text = transcript.toLowerCase();

        if (text.includes("jarvis")) {
            const command = text.replace(/jarvis/g, "").trim();

            activated = true;

            if (!command) {
                jarvisReply("Yes, I am listening.");
            } else {
                processCommand(command);
            }
        }

        else if (activated) {
            processCommand(text);
        }

        else {
            jarvisReply('Please say "Jarvis" first.');
        }
    };

    recognition.onerror = (event) => {
        logText.textContent = "Voice error: " + event.error;

        if (event.error === "not-allowed") {
            listening = false;
            statusText.textContent = "MICROPHONE BLOCKED";
            responseText.textContent = "Allow microphone permission in browser settings.";
        }
    };

    recognition.onend = () => {
        orb.style.transform = "scale(1)";

        if (mode === "voice" && listening && !speaking) {
            restartRecognition();
        }
    };

} else {

    statusText.textContent = "VOICE NOT SUPPORTED";

    responseText.textContent =
        "Voice recognition is unavailable. Silent chat is still usable.";

    voiceModeBtn.disabled = true;
}


// ----------------------------
// INITIALIZE BUTTON
// ----------------------------

startBtn.onclick = () => {

    if (mode !== "voice") {
        setMode("voice");
    }

    if (!SpeechRecognition) {
        jarvisReply("Voice recognition is not supported in this browser.");
        return;
    }

    listening = true;
    activated = false;

    statusText.textContent = "INITIALIZING";
    responseText.textContent = "Starting microphone...";

    try {
        recognition.start();
    } catch (error) {
        statusText.textContent = "VOICE SYSTEM";
        responseText.textContent = "Voice system is already active.";
    }
};


// ----------------------------
// DEFAULT MODE
// ----------------------------

setMode("silent");
