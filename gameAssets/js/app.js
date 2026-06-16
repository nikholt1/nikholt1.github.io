import {renderRules} from "./rules.js";
import {renderWheel} from "./wheel.js";


document.addEventListener("DOMContentLoaded", () => initApp());


function initApp() {
    console.log("DOM Loaded");

    const ruleBtn = document.getElementById("rulesBtn");
    ruleBtn.addEventListener("click", () => {
        document.getElementById("wheelSpinContainer").classList.add("hidden");
        document.getElementById("rulesContainer").classList.remove("hidden");

        renderRules()
    });
    // initRules()
    const wheelBtn = document.getElementById("wheelBtn");
    wheelBtn.addEventListener("click", () => {
        document.getElementById("wheelSpinContainer").classList.remove("hidden");
        document.getElementById("rulesContainer").classList.add("hidden");

        renderWheel()
    });
}