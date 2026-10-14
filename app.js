
import { initializePageNavigation } from "./navigation.js";
import { initializeProfileTabs } from "./profile.js";
import { initializeClock } from "./clock.js";
import { initializeWeather } from "./weather.js";

import { initializeRepositoryCards } from "./projects.js";

import { initializeInspector } from "./inspector.js";
import { initializeCesium } from "./cesium.js";

document.addEventListener("DOMContentLoaded", () => {
    initializeProfileTabs();
    contactTrigger();

    
    initializePageNavigation({
        onPageChange(pageId) {
            if (pageId === "github") {
                initializeInspector();
            }
        }
    });
    initializeCesium();
    initializeRepositoryCards();
    initializeClock();
    initializeWeather();
    
    
    
});



function contactTrigger() {
    const trigger = document.getElementById("contactTrigger");
    const formGroup = document.getElementById("form-group");

    if (!trigger || !formGroup) {

        return;
    }

    

    trigger.addEventListener("click", (event) => {
        event.preventDefault();

        formGroup.classList.toggle("hidden");


    });
}
