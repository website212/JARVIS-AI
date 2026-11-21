const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const responseText = document.getElementById("response");
const logText = document.getElementById("log");
const orb = document.getElementById("orb");

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let activated = false;
let speaking = false;

function speak(text) {
    speaking = true;

    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {}
    }

    speechSynthesis.cancel();

    const message = new SpeechSynthesisUtterance(text);
    message.lang = "en-IN";
    message.rate = 1;
    message.pitch = 0.95;

    message.onend = () => {
        speaking = false;

        if (recognition && activated) {
            try {
                recognition.start();
            } catch (e) {}
        }
    };

    speechSynthesis.speak(message);
}

function showStatus(status, message) {
    statusText.textContent = status;
    responseText.textContent = message;
}

function executeCommand(command) {
    command = command.toLowerCase().trim();

    logText.textContent = "Command: " + command;

    if (command.includes("time")) {
        const time = new Date().toLocaleTimeString("en-IN");
        speak("The current time is " + time);
    }

    else if (command.includes("date")) {
        const date = new Date().toLocaleDateString("en-IN");
        speak("Today's date is " + date);
    }

    else if (command.includes("youtube")) {
        speak("Opening YouTube");

        setTimeout(() => {
            window.location.href = "https://www.youtube.com";
        }, 1200);
    }

    else if (command.includes("google")) {
        speak("Opening Google");

        setTimeout(() => {
            window.location.href = "https://www.google.com";
        }, 1200);
    }

    else if (command.includes("search")) {
        const query = command.replace("search", "").trim();

        if (query) {
            speak("Searching the internet");

            setTimeout(() => {
                window.location.href =
                    "https://www.google.com/search?q=" +
                    encodeURIComponent(query);
            }, 1200);
        } else {
            speak("What should I search for?");
        }
    }

    else if (command.includes("hello")) {
        speak("Hello! I am Jarvis. How can I help you?");
    }

    else if (command.includes("who are you")) {
        speak("I am Jarvis, your personal AI assistant.");
    }

    else if (command.includes("stop")) {
        speak("Okay. Standing by.");
    }

    else {
        speak("I heard " + command +
              ". This command needs my AI brain, which we will add next.");
    }
}

if (!SpeechRecognition) {
    showStatus(
        "UNSUPPORTED",
        "Speech recognition isn't supported in this browser."
    );

    startBtn.disabled = true;
}

else {
    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
        showStatus("LISTENING", 'Say "Jarvis" to activate me.');
        orb.style.transform = "scale(1.1)";
    };

    recognition.onresult = (event) => {
        const transcript =
            event.results[event.results.length - 1][0]
            .transcript.toLowerCase().trim();

        logText.textContent = "Heard: " + transcript;

        if (transcript.includes("jarvis")) {
            const command = transcript.replace(/jarvis/g, "").trim();

            if (!command) {
                activated = true;

                showStatus(
                    "JARVIS ACTIVATED",
                    "Yes, I'm listening."
                );

                speak("Yes, I'm listening.");
            }

            else {
                activated = true;
                showStatus("COMMAND RECEIVED", command);
                executeCommand(command);
            }
        }

        else if (activated) {
            executeCommand(transcript);
        }
    };

    recognition.onerror = (event) => {
        logText.textContent = "Voice error: " + event.error;
    };

    recognition.onend = () => {
        if (activated && !speaking) {
            try {
                recognition.start();
            } catch (e) {}
        }
    };

    startBtn.onclick = () => {
        activated = true;

        showStatus(
            "INITIALIZING",
            "Allow microphone access."
        );

        try {
            recognition.start();
        } catch (e) {
            showStatus("ACTIVE", "Jarvis is already listening.");
        }
    };
}
