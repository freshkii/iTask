const token = localStorage.getItem("token");
const username = localStorage.getItem('username');

function init() {
    if (isLogged()) {
        document.getElementById("username").textContent = username
    }
    document.getElementById(`as${isLogged() ? "-not" : ""}-logged`).remove()
}

function isLogged() {
    return token && username;
}

async function logout() {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'username': username,
            'token': token
        })
    });

    if (!response.ok) {
        throw new Error("Cannot logout");
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.replace('/');
    }

}

document.addEventListener("DOMContentLoaded", init)