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
async function getMessages(first) {
    const h1 = document.getElementById("h1")
    h1.classList.add("waiting")
    const res = await fetch("/messages");
    const messages = await res.json();

    const container = document.getElementById("messages");

    messages.forEach(msg => {
        const messageId = `msg-id-${msg.id}`;

        // Si déjà affiché, on ignore
        if (document.getElementById(messageId)) return false;

        // Affiche le message
        generateMessage(container, msg, messageId, first);

        // Notification si nouveau message et onglet inactif
        if (lastMessageId && msg.id !== lastMessageId && !documentHasFocus && msg.user !== username) {
            showNotification(msg.user, msg.text);
        }

        lastMessageId = msg.id;

        scrollToBottom();
    });
     h1.classList.remove("waiting")
}

// ➤ Génère le texte de la date
function generateDateText(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const heure = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diffTime = now - date;
    const diffJours = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let dateText = "Aujourd’hui";
    if (diffJours === 1) dateText = "Hier";
    else if (diffJours > 1) dateText = `il y a ${diffJours} jours`;

    return `${heure} – ${dateText}`;
}

// ➤ Génère un message dans le DOM
function generateMessage(container, msg, messageId, first) {
    const dateText = generateDateText(msg.timestamp);
    const isOwner = (msg.user === username);
    
    let tags = "";
    if (msg.text.includes("$red")) {
        tags+="red ";
        msg.text = msg.text.replaceAll("$red", "");

    }
    if (msg.text.includes("$dancing")) {
        tags+="dancing ";
        msg.text = msg.text.replaceAll("$dancing", "");
 
    }
    if (msg.text.includes("$huge")) {
        tags+="huge ";
        msg.text = msg.text.replaceAll("$huge", "");
 
    }
    if (msg.text.includes("$flame")) {
        tags+="flame ";
        msg.text = msg.text.replaceAll("$flame", "");
 
    }
    const spawnAnim = isOwner && !first && tags == ""
    const messageHTML = `
        <div class="msg-fram ${isOwner ? "me" : ""}" id="${messageId}">
            ${isOwner ? "" : `<p class="pseudo"><strong>${msg.user}</strong></p>`}
            <p class="msg-content ${tags} ${isOwner ? "me" : ""} ${spawnAnim ? "spawn-anim" : ""}">${msg.text}</p>
            <p class="msg-date">
                ${dateText}
            </p>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", messageHTML);
        

//     if (!first) {
//         let message_content = document.getElementById(messageId).querySelector(".msg-content");
//         setInterval( message_content.classList.remove("spawn-anim"), 10000);
//     }
// }
}

// ➤ Envoie un message
async function sendMessage() {
   
    const input = document.getElementById("message");
    const text = input.value;
   
    if (!text.trim()) return;

    let button_icon = document.getElementById("button-icon");
    button_icon.classList.add("move");
    input.value = "";
    input.focus();
    

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


    
  
    button_icon.classList.remove("move");
    button_icon.classList.add("exit");

    // Réinitialise après l'animation (0.4s)
    setTimeout(() => {
        button_icon.classList.remove("exit");
        button_icon.style.opacity = "1";
        button_icon.style.transform = "translateY(0)";
    }, 1000);
    actualiseMessage()
   
}

async function actualiseMessage() {
    (async () => {
        await getMessages();
        scrollToBottom();
    })();
}

// ➤ Actualise toutes les secondes
setInterval(getMessages, 1000);

// ➤ Initialisation
(async () => {
        await getMessages(true);
        scrollToBottom();
    })();
