const tg = window.Telegram?.WebApp;

const envText = document.getElementById("envText");
const userText = document.getElementById("userText");
const rollBtn = document.getElementById("rollBtn");
const lastValue = document.getElementById("lastValue");
const eventInput = document.getElementById("eventInput");
const sendState = document.getElementById("sendState");
const closeLink = document.getElementById("closeLink");
const modifierRange = document.getElementById("modifierRange");

function setState(text, isBusy=false){
    sendState.textContent = text;
    rollBtn.disabled = isBusy;
}

let username

if (tg) {
    tg.ready();

    // Бейдж окружения
    envText.textContent = "Telegram";

    // Пользователь (если доступно)
    const user = tg.initDataUnsafe?.user;
    if (user) {
        username = [user.first_name, user.last_name].filter(Boolean).join(" ");
        userText.textContent = `Пользователь: ${username}${user.username ? " (@" + user.username + ")" : ""}`;
    } else {
        username = "Anonymous"
        userText.textContent = "Пользователь: Anonymous";
    }

    closeLink.onclick = (e) => {
        e.preventDefault();
        tg.close();
    };
} else {
    envText.textContent = "Browser";
    userText.textContent = "Пользователь: (открыто не в Telegram)";
    closeLink.onclick = (e) => {
        e.preventDefault();
        alert("Открой страницу через кнопку бота (Mini App), чтобы работало sendData().");
    };
}

// Бросок кубика
rollBtn.onclick = () => {
    if (!tg) return alert("Открой в Telegram Mini App.");

    const sides = getSelectedDice();
    const baseValue = rollDice(sides);
    let finalValue = baseValue;
    let modifier = 0;
    let absModifier = 0;
    let sign = "+"
    
    // применяем модификатор ТОЛЬКО для D20
    if (sides === 20) {
        modifier = Number(modifierRange.value) || 0;
        finalValue = finalValue + modifier
        finalValue = finalValue < 1 ? 1 : finalValue > 20 ? 20 : finalValue;
    }

    if (modifier === 0) {
        lastValue.textContent = baseValue;
    } else {
        sign = modifier > 0 ? "+" : "−"
        absModifier = Math.abs(modifier);
        lastValue.textContent = `${baseValue} ${sign} ${absModifier} = ${finalValue}`;
    }

    let textEvent = eventInput.value
    let message;
    if (sides === 20 && modifier !== 0) {
        message = `${username}\n`
        message += textEvent ? `Событие: ${textEvent}\n` : ""
        message += `Кость D${sides} ➜ ${baseValue} ${sign} ${absModifier} ➜ ${finalValue}`
    } else {
        message = `${username}\n`
        message += textEvent ? `Событие: ${textEvent}\n` : ""
        message += `Кость D${sides} ➜ ${baseValue}`
    }

    // console.log(message);
    
    sendTextToTelegram(message)
    setTimeout(() => {
        setState("Готов", false)
        eventInput.value = ""
    }, 1200);
};

function getSelectedDice(){
    const radio = document.querySelector('input[name="dice"]:checked');
    return Number(radio?.value || 6);
}

function secureRandomInt(min, max) {
    if (min > max) throw new Error("min > max");

    const range = max - min + 1;
    const maxUint32 = 0xFFFFFFFF;
    const limit = maxUint32 - (maxUint32 % range);

    let rand;
    do {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        rand = arr[0];
    } while (rand >= limit);

    return min + (rand % range);
}

function rollDice(sides){
    return secureRandomInt(1, sides);
}

async function sendTextToTelegram(text) {
    setState("Отправление", true);
    try {
        await fetch("https://hedgehog-rp-api.appwrite.network/api/telegram", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text }) // передаем текст в теле
        });

    } catch (error) {
        console.error("Ошибка отправки:", error);
    }
}