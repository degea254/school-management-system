document.addEventListener("DOMContentLoaded", function () {
    const tabMenu = document.querySelector(".tab-menu");
    if (!tabMenu) return;

    const buttons = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".tab-panel");


    tabMenu.addEventListener("click", (event) => {
        const clickedBtn = event.target.closest(".tab-btn");
        if (!clickedBtn) return;


        const targetId = clickedBtn.getAttribute("data-target");
        const targetPanel = document.getElementById(targetId);

        if (!targetPanel) return; // Exit if panel doesn't exist

        // Remove active class from all buttons and panels
        buttons.forEach(btn => btn.classList.remove("active"));
        panels.forEach(panel => panel.classList.remove("active"));

        // Activate the clicked button and corresponding panel
        clickedBtn.classList.add("active");
        targetPanel.classList.add("active");
    });
});

// ========== NAVIGATION HIGHLIGHTING (with removal) ==========

const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll(".nav-list a");

navLinks.forEach(link => link.classList.remove("active"));

navLinks.forEach(link => {
    // Get the absolute path from the link's href
    const linkPath = new URL(link.href, window.location.origin).pathname;
    // Compare normalized paths (no leading/trailing slash)
    const normalize = (p) => p.replace(/^\/|\/$/g, '');
    if (normalize(linkPath) === normalize(currentPath)) {
        link.classList.add("active");
    }
});