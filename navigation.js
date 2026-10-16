const PAGE_IDS = ["home", "github", "projects"];

export function initializePageNavigation({ onPageChange } = {}) {
    const pages = document.querySelectorAll(".spa-page");
    const pageLinks = document.querySelectorAll("[data-page]");

    function showPage(pageId, updateHash = true) {
        if (!PAGE_IDS.includes(pageId)) {
            pageId = "home";
        }

        const selectedPage = document.getElementById(pageId);

        if (!selectedPage || !selectedPage.classList.contains("spa-page")) {
            pageId = "home";
        }

        pages.forEach(page => {
            const selected = page.id === pageId;

            page.classList.toggle("hidden", !selected);
            page.setAttribute("aria-hidden", String(!selected));
        });

        pageLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (updateHash && window.location.hash !== `#${pageId}`) {
            history.pushState(null, "", `#${pageId}`);
        }

        onPageChange?.(pageId);

        window.scrollTo({ top: 0, behavior: "auto" });
    }

    pageLinks.forEach(link => {
        link.addEventListener("click", event => {
            const pageId = link.dataset.page;

            if (!PAGE_IDS.includes(pageId)) return;

            event.preventDefault();
            showPage(pageId);
        });
    });

    window.addEventListener("popstate", () => {
        showPage(window.location.hash.slice(1), false);
    });

    showPage(window.location.hash.slice(1), false);
}