
export class ProfileTabs {
    constructor() {
        this.tabs = document.querySelectorAll(".profile-tab");
        this.contents = document.querySelectorAll(".profile-tab-content");

        this.initialize();
    }

    initialize() {
        this.tabs.forEach(tab => {
            tab.addEventListener("click", event => {
                event.preventDefault();
                this.activate(tab.dataset.tab);
            });
        });
    }

    activate(tabId) {
        this.tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabId;

            tab.classList.toggle("active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });

        this.contents.forEach(content => {
            content.style.display =
                content.id === tabId ? "" : "none";
        });
    }
}

export function initializeProfileTabs() {
    return new ProfileTabs();
}
