const header = document.getElementById("header");
let isHeaderVisible = true;
let lastScrollTop = 0;

// Smooth scroll to section when clicking on navigation links
const links = document.querySelectorAll(".header nav ul li a");

links.forEach((link) => {
link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
    const offsetTop = targetElement.offsetTop - header.offsetHeight;

    // Scroll smoothly to the target section
    window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
    });

    // Hide the header after clicking on a link
    hideHeader();
    }
});
});

// Handle header showing/hiding based on scroll direction and position
window.addEventListener("scroll", function () {
let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

if (scrollTop === 0) {
    // At the top of the page
    showHeader();
} else if (scrollTop > lastScrollTop) {
    // Scrolling down
    hideHeader();
}

lastScrollTop = scrollTop;
});

function hideHeader() {
if (isHeaderVisible) {
    header.style.top = `${header.offsetHeight}px`;
    isHeaderVisible = false;
}
}

function showHeader() {
if (!isHeaderVisible) {
    header.style.top = "0";
    isHeaderVisible = true;
}
}