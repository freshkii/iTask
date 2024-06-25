const authButtonsContainer = document.getElementById("auth-buttons-container");

const token = localStorage.getItem("token");
const username = localStorage.getItem('username');


if (token && username )
{
    const logoutButton = document.createElement('input');

    logoutButton.type = 'button';
    logoutButton.value = 'Logout';
    logoutButton.id = 'logout-button';

    authButtonsContainer.appendChild(logoutButton);

    logoutButton.addEventListener('click', () => {
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'token': token
            })
        });

        localStorage.removeItem('token');
        localStorage.removeItem('username');

        window.location.replace('/');
    });
}
else
{
    const signinButton = document.createElement('button');
    const loginButton = document.createElement('button');

    signinButton.textContent = 'Sign in';
    signinButton.id = 'sign-in-button';

    loginButton.textContent = 'Login';
    loginButton.id = 'login-button';

    authButtonsContainer.appendChild(signinButton);
    authButtonsContainer.appendChild(loginButton);

    loginButton.addEventListener("click", () => window.location.replace('/login'));
    signinButton.addEventListener('click', () => window.location.replace('/sign-in'));
}