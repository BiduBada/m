// ➤ Stocke le pseudo une seule fois
let username = localStorage.getItem("chat_username");

const notif = [
    "Nouveau message de bro : ",
    "Sah ya nouveau message de : ",
    "Nouveau message du goat ultime : ",
    "Le frero a parlé : ",
    "Met pas un remit a :"
];

if (!username) {
    username = prompt("Quel est ton pseudo ?");
    if (username) {
        localStorage.setItem("chat_username", username);
    } else {
        alert("Tu dois entrer un pseudo !");
        location.reload(); // recharge la page
    }
}

// ➤ Demande la permission pour les notifications
document.addEventListener("click", () => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}, { once: true });

// ➤ Gère le scroll smooth
function scrollToBottom() {
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth"
    });
}

// ➤ Variables pour gestion des notifications
let lastMessageId = null;
let documentHasFocus = true;

window.addEventListener("focus", () => documentHasFocus = true);
window.addEventListener("blur", () => documentHasFocus = false);




// ➤ Notification affichée si nouveau message et onglet non actif
function showNotification(user, text) {
    if (Notification.permission === "granted") {
        const title = notif[Math.floor(Math.random() * notif.length)];
        new Notification(`${title}${user}`, {
            body: text,
            icon: "/static/favicon.png" // Remplace par le chemin de ton icône si tu en as une
        });
    }
}

// ➤ Récupère les messages depuis le serveur
async function getMessages() {
    const res = await fetch("/messages");
    const messages = await res.json();

    const container = document.getElementById("messages");

    messages.forEach(msg => {
        const messageId = `msg-id-${msg.id}`;

        // Si déjà affiché, on ignore
        if (document.getElementById(messageId)) return;

        // Affiche le message
        generateMessage(container, msg, messageId);

        // Notification si nouveau message et onglet inactif
        if (lastMessageId && msg.id !== lastMessageId && !documentHasFocus && msg.user !== username) {
            showNotification(msg.user, msg.text);
        }

        lastMessageId = msg.id;
    });
}

// ➤ Génère le texte de la date
function generateDateText(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const heure = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diffTime = now - date;
    const diffJours = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let dateText = "aujourd’hui";
    if (diffJours === 1) dateText = "il y a 1 jour";
    else if (diffJours > 1) dateText = `il y a ${diffJours} jours`;

    return `${heure} – ${dateText}`;
}

// ➤ Génère un message dans le DOM
function generateMessage(container, msg, messageId) {
    const dateText = generateDateText(msg.timestamp);
    const isOwner = (msg.user === username);

    const messageHTML = `
        <div class="msg-fram ${isOwner ? "me" : ""}" id="${messageId}">
            ${isOwner ? "" : `<p class="pseudo"><strong>${msg.user}</strong></p>`}
            <p class="msg-content ${isOwner ? "me" : ""}">${msg.text}</p>
            <p class="msg-date">
                ${dateText}
            </p>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", messageHTML);
}

// ➤ Envoie un message
async function sendMessage() {
    const input = document.getElementById("message");
    const text = input.value;
    if (!text.trim()) return;

    const timestamp = new Date().toISOString();

    await fetch("/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user: username,
            text: text,
            timestamp: timestamp
        })
    });

    input.value = "";
    await getMessages();
    scrollToBottom();
    input.focus();
}

// ➤ Actualise toutes les secondes
setInterval(getMessages, 1000);

// ➤ Initialisation
(async () => {
    await getMessages();
    scrollToBottom();
})();
