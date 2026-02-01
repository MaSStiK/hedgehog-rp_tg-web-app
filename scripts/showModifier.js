const diceRadios = document.querySelectorAll(`input[name="dice"]`);
const modifierPanel = document.getElementById("modifierPanel");

function updateModifierVisibility() {
    const radio = document.querySelector(`input[name="dice"]:checked`);
    const isD20 = radio && Number(radio.value) === 20;

    modifierPanel.style.display = isD20 ? "block" : "none";
}

updateModifierVisibility();

diceRadios.forEach(radio => {
    radio.addEventListener("change", updateModifierVisibility);
});