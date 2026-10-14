
import { initializeProjects } from "./projects.js";
import { initializeFrontPage } from "./startPage.js";
import { intializeInspecter } from "./inspecter.js";
const VALID_PAGES = new Set([
    "home",
    "github",
    "projects"
]);

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    renderPage();
    initializeProjects();
    intializeInspecter();
    // Initialize the clock and weather exactly once.
    initializeFrontPage();
});

function initializeNavigation() {
    document.querySelectorAll("[data-page]").forEach(link => {
        link.addEventListener("click", event => {
            const page = link.dataset.page;

            if (!VALID_PAGES.has(page)) {
                return;
            }

            event.preventDefault();

            if (window.location.hash === `#${page}`) {
                renderPage();
                return;
            }

            window.location.hash = page;
        });
    });

    window.addEventListener("hashchange", renderPage);
}

function renderPage() {
    const requestedPage = window.location.hash.slice(1);

    const activePage = VALID_PAGES.has(requestedPage)
        ? requestedPage
        : "home";

    document.querySelectorAll(".spa-page").forEach(page => {
        const isActive = page.id === activePage;

        page.classList.toggle("page-hidden", !isActive);
        page.setAttribute("aria-hidden", String(!isActive));
    });

    document.querySelectorAll(".nav-links [data-page]").forEach(link => {
        if (link.dataset.page === activePage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
}