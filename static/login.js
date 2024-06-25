const passwordInput = document.querySelector("input[name='password']");
const usernameInput = document.querySelector("input[name='username']");
const submitButton = document.querySelector("input[name='submit']");

submitButton.addEventListener('click', async () => {
    let response = await fetch('/api/auth/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: passwordInput.value,
            username: usernameInput.value
        })
    });

    if (!response.ok)
    {
        console.error("it's not ok");
        return;
    } 

    let data = await response.json();

    if (data == 'failure') {
        console.log(data);
        return;
    }

    localStorage.setItem('token', data['token']);
    localStorage.setItem('username', usernameInput.value);
    console.log(localStorage.getItem('token'))

    window.location.replace(`/app?username=${localStorage.getItem('username')}&token=${localStorage.getItem('token')}`);
});
