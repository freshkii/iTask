async function login() {
    const usernameInput = document.querySelector("input[name='username']");
    const passwordInput = document.querySelector("input[name='password']");

    if (passwordInput === null || usernameInput === null) {
        throw new Error("Cannot identify form inputs")
    }

    const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: passwordInput.value,
            username: usernameInput.value
        })
    });

    if (!response.ok) {
        console.error(response);
        throw new Error("Cannot login")
    } else {
        let data = await response.json();
        console.log(data);
        if (data == 'failure') {
            console.error(response);
            throw new Error("We cannot login you")
        } else {
            localStorage.setItem('token', data['token']);
            localStorage.setItem('username', usernameInput.value);
            console.info("successfuly logged with token " + localStorage.getItem('token'))
            window.location.assign(`/app?username=${localStorage.getItem('username')}&token=${localStorage.getItem('token')}`);
        }
    }
}

async function signIn(username, password) {
    const usernameInput = document.querySelector("input[name='username']");
    const passwordInput = document.querySelector("input[name='password']");
    if (usernameInput === null && username === undefined) {
        throw new Error("Please provide a username")
    }
    if (passwordInput === null && password === undefined) {
        throw new Error("Please provide a password")
    }

    const response = await fetch('/api/auth/sign-in', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username ?? usernameInput.value,
            password: password ?? passwordInput.value
        })
    });

    if (!response.ok) {
        console.error(response);
        throw new Error('Cannot sign-in')
    } else {
        let data = await response.json();

        if (data == 'failure') {
            console.error(response);
            console.error(data)
            throw new Error("We cannot sign you in")
        } else {
            console.info("Successfully signed-in");
            localStorage.setItem('token', data['token']);
            localStorage.setItem('username', usernameInput.value);
            console.log(localStorage.getItem('token'))

            window.location.replace(`/app?username=${localStorage.getItem('username')}&token=${localStorage.getItem('token')}`);
        }
    }
}