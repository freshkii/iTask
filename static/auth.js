const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

async function login(username, password) {
  //TODO: Add provider type to bypass password verification
  if (username === undefined || password === undefined) {
    throw new Error("Please provide a username and a password");
  }
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Cannot login");
  } else {
    let data = await response.json();
    if (data == "failure") {
      console.error(response);
      throw new Error("We cannot login you");
    } else {
      localStorage.setItem("token", data["token"]);
      localStorage.setItem("username", username);
      console.info(
        "successfuly logged with token " + localStorage.getItem("token"),
      );
      window.location.assign(`/app`);
    }
  }
}

async function signIn(username, password) {
  //TODO: Add provider type to bypass password verification
  if (username === undefined || password === undefined) {
    throw new Error("Please provide a username and a password");
  }
  const response = await fetch("/api/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Cannot sign-in");
  } else {
    let data = await response.json();
    if (data == "failure") {
      console.error(response);
      console.error(data);
      throw new Error("We cannot sign you in");
    } else {
      console.info("Successfully signed-in");
      localStorage.setItem("token", data["token"]);
      localStorage.setItem("username", username);
      window.location.assign(`/app`);
    }
  }
}
async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      token: token,
    }),
  });

  if (!response.ok) {
    throw new Error("Cannot logout");
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.assign("/");
  }
}

async function userExist(username) {
  try {
    const response = await fetch("/api/auth/getuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
      }),
    });

    if (!response.ok) {
      console.error(response);
      throw new Error("Cannot check for user");
    } else {
      let data = await response.json();
      return data === true;
    }
  } catch {
    return false;
  }
}

async function checkSession() {
  if (!isLogged()) return false;
  else {
    //check on server token and username
    const response = await fetch("/api/auth/valid-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        token: token,
      }),
    });
    if (!response.ok) {
      console.error(response);
      console.error(await response.json());
      throw new Error("Cannot check session");
    } else return await response.json();
  }
}

function isLogged() {
  return token !== null && username !== null;
}

function trylogin() {
  const usernameInput = document.querySelector("input[name='username']");
  const passwordInput = document.querySelector("input[name='password']");
  if (usernameInput === null && username === undefined) {
    throw new Error("Please provide a username");
  }
  if (passwordInput === null && password === undefined) {
    throw new Error("Please provide a password");
  }
  login(usernameInput.value, passwordInput.value);
}
function trySignIn() {
  const usernameInput = document.querySelector("input[name='username']");
  const passwordInput = document.querySelector("input[name='password']");
  if (usernameInput === null && username === undefined) {
    throw new Error("Please provide a username");
  }
  if (passwordInput === null && password === undefined) {
    throw new Error("Please provide a password");
  }
  signIn(usernameInput.value, passwordInput.value);
}
