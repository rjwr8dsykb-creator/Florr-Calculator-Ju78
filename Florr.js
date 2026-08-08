const raritySquares = document.querySelectorAll(".rarity");
const petalCountInput = document.getElementById("petalCount");
const simulationCountInput = document.getElementById("simulationCount");
const results = document.getElementById("results");

let selectedRarity = null;
let selectedRarityName = "";

raritySquares.forEach((square) => {

    square.addEventListener("mouseenter", () => {
        square.style.transform = "scale(1.05)";
    });

    square.addEventListener("mouseleave", () => {
        square.style.transform = "scale(1)";
    });

    square.addEventListener("click", () => {

        raritySquares.forEach((item) => {
            item.style.boxShadow = "none";
        });

        square.style.boxShadow = "0 0 0 5px white";

        selectedRarity = Number(square.dataset.rarity);

        selectedRarityName =
            square.querySelector("span").textContent;

        runSimulation();
    });

});

petalCountInput.addEventListener("input", runSimulation);
simulationCountInput.addEventListener("input", runSimulation);

function runSimulation() {

    if (selectedRarity === null) {
        return;
    }

    const startingPetals = Number(petalCountInput.value);
    const simulationCount = Number(simulationCountInput.value);

    if (!Number.isFinite(startingPetals) || startingPetals < 5) {

        results.innerHTML =
            "<p>Please increase the number of petals to at least 5.</p>";

        return;
    }

    if (startingPetals > 10000000) {

        results.innerHTML =
            "<p>Please decrease the number of petals to a maximum of 10,000,000.</p>";

        return;
    }

    if (!Number.isFinite(simulationCount) || simulationCount < 1000) {

        results.innerHTML =
            "<p>Please increase the number of simulations to at least 1,000.</p>";

        return;
    }

    if (simulationCount > 100000) {

        results.innerHTML =
            "<p>Please decrease the number of simulations to a maximum of 100,000.</p>";

        return;
    }

    let totalSuccess = 0;
    let simulationsWithSuccess = 0;
    let totalAttempts = 0;

    for (
        let simulation = 0;
        simulation < simulationCount;
        simulation++
    ) {

        let petals = startingPetals;
        let success = 0;
        let failures = 0;

        while (petals > 4) {

            const roll =
                Math.floor(Math.random() * 100) + 1;

            if (roll <= selectedRarity) {

                success++;
                petals -= 5;

            } else {

                failures++;

                const loss =
                    Math.floor(Math.random() * 4) + 1;

                petals -= loss;
            }
        }

        totalSuccess += success;

        totalAttempts += success + failures;

        if (success > 0) {
            simulationsWithSuccess++;
        }
    }

    const averageSuccess =
        totalSuccess / simulationCount;

    const chanceOfAtLeastOneSuccess =
        simulationsWithSuccess * 100 / simulationCount;

    const averageAttempts =
        totalAttempts / simulationCount;

    results.innerHTML = `
        <p class="selected-rarity">
            ${selectedRarityName}
        </p>

        <p>
            Average successes:
            ${averageSuccess.toFixed(2)}
        </p>

        <p>
            Chance of getting at least 1 success:
            ${chanceOfAtLeastOneSuccess.toFixed(2)}%
        </p>

        <p>
            Average attempts:
            ${averageAttempts.toFixed(2)}
        </p>
    `;
}
