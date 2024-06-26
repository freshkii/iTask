async function login(username, password) {
    //TODO: Add provider type to bypass password verification
    if (username === undefined || password === undefined) {
        throw new Error("Please provide a username and a password")
    }
    const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    if (!response.ok) {
        console.error(response);
        throw new Error("Cannot login");
    } else {
        let data = await response.json();
        if (data == 'failure') {
            console.error(response);
            throw new Error("We cannot login you")
        } else {
            localStorage.setItem('token', data['token']);
            localStorage.setItem('username', username);
            console.info("successfuly logged with token " + localStorage.getItem('token'))
            window.location.assign(`/app?username=${localStorage.getItem('username')}&token=${localStorage.getItem('token')}`);
        }
    }
}

async function signIn(username, password) {
    //TODO: Add provider type to bypass password verification
    if (username === undefined || password === undefined) {
        throw new Error("Please provide a username and a password")
    }
    const response = await fetch('/api/auth/sign-in', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    if (!response.ok) {
        console.error(response);
        throw new Error('Cannot sign-in');
    } else {
        let data = await response.json();
        if (data == 'failure') {
            console.error(response);
            console.error(data)
            throw new Error("We cannot sign you in")
        } else {
            console.info("Successfully signed-in");
            localStorage.setItem('token', data['token']);
            localStorage.setItem('username', username);
            window.location.replace(`/app?username=${localStorage.getItem('username')}&token=${localStorage.getItem('token')}`);
        }
    }
}

async function userExist(username) {
    try {
        const response = await fetch('/api/auth/getuser', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username
            })
        });

        if (!response.ok) {
            console.error(response);
            throw new Error("Cannot check for user")
        } else {
            let data = await response.json();
            return data === true;
        }
    } catch {
        return false
    }
}