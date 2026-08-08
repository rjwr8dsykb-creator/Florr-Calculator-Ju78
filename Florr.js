const raritySquares = document.querySelectorAll(".rarity");
const petalCountInput = document.getElementById("petalCount");
const simulationCountInput = document.getElementById("simulationCount");
const results = document.getElementById("results");

let selectedRarity = null;
let selectedRarityName = "";

raritySquares.forEach((square) => {

    square.addEventListener("mouseenter", () => {
        square.style.transition = "transform 0.15s ease";
        square.style.transform = "scale(1.05)";
    });

    square.addEventListener("mouseleave", () => {
        square.style.transition = "transform 0.15s ease";
        square.style.transform = "scale(1)";
    });

    square.addEventListener("click", () => {

        raritySquares.forEach((item) => {
            item.style.boxShadow = "none";
        });

        square.style.boxShadow = "0 0 0 5px white";

        selectedRarity = Number(square.dataset.rarity);
        selectedRarityName = square.querySelector("span").textContent;

        runSimulation();
    });
});

petalCountInput.addEventListener("input", runSimulation);
simulationCountInput.addEventListener("input", runSimulation);

function runSimulation() {

    if (selectedRarity === null) {
        return;
    }

    let startingPetals = Number(petalCountInput.value);
    let credibility = Number(simulationCountInput.value);

    if (startingPetals < 1 || credibility < 1) {
        results.innerHTML = "<p>Please enter valid numbers.</p>";
        return;
    }

    let totalSuccess = 0;
    let simulationsWithSuccess = 0;
    let totalAttempts = 0;

    for (let simulation = 0; simulation < credibility; simulation++) {

        let petals = startingPetals;
        let success = 0;
        let failures = 0;

        while (petals > 4) {

            let roll = Math.floor(Math.random() * 100) + 1;

            if (roll <= selectedRarity) {
                success++;
                petals -= 5;
            } else {
                failures++;

                let loss = Math.floor(Math.random() * 4) + 1;
                petals -= loss;
            }
        }

        totalSuccess += success;
        totalAttempts += success + failures;

        if (success > 0) {
            simulationsWithSuccess++;
        }
    }

    let averageSuccess = totalSuccess / credibility;
    let chanceOfAtLeastOneSuccess =
        simulationsWithSuccess * 100 / credibility;
    let averageAttempts = totalAttempts / credibility;

    results.innerHTML = `
        <p class="selected-rarity">${selectedRarityName}</p>
        <p>Average successes: ${averageSuccess.toFixed(2)}</p>
        <p>Chance of getting at least 1 success: ${chanceOfAtLeastOneSuccess.toFixed(2)}%</p>
        <p>Average attempts: ${averageAttempts.toFixed(2)}</p>
    `;
}