function init() {
    if (isLogged()) {
        document.getElementById("username").textContent = username
    }
    document.getElementById(`as${isLogged() ? "-not" : ""}-logged`).remove()
    document.getElementById("header-loader").remove()
}

document.addEventListener("DOMContentLoaded", init)