var prevScrollpos = window.pageYOffset;

/* Get the header element and it's position */
var headerDiv = document.querySelector("header");
var headerBottom = headerDiv.offsetTop + headerDiv.offsetHeight;

window.onscroll = () => {
    var currentScrollPos = window.pageYOffset;

    /* if scrolling down, let it scroll out of view as normal */
    if (prevScrollpos <= currentScrollPos) {
        headerDiv.classList.remove("fixedToTop");
        headerDiv.style.top = "-70px";
    }
    /* otherwise if we're scrolling up, fix the nav to the top */
    else {
        headerDiv.classList.add("fixedToTop");
        headerDiv.style.top = "0";
    }

    prevScrollpos = currentScrollPos;
}

function init() {
    if (isLogged()) document.querySelector(".enroll-button button").innerText = "Continue tasking"

}

window.addEventListener("DOMContentLoaded", init)