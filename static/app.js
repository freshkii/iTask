const taskContainerDiv = document.getElementById('task-container');
const createTaskButton = document.getElementById('create-task-button');
let taskList = [];

function init() {
    if (taskContainerDiv === null) throw new Error("Cannot get the task container \n - Add an element with id 'task-container'")
    if (createTaskButton === null) throw new Error("Cannot get the create button \n - Add an element with id 'create-task-button'")
    //check for session
    checkSession()
        .then(isAuthorized => {
            if (!isAuthorized) {
                console.warn("UnauthorizedError: User not logged");
                window.location.assign("/");
            }
            else {
                //get tasks
                getTasksRequest()
                    .then(response => {
                        taskList = response.map(e => ToInternalTask(e))
                        render();
                    });

                createTaskButton.addEventListener('click', renderTaskInput);
                setTimeout(() => {
                    document.getElementById("loader").remove()
                }, 500);
            }
        }).catch(e => {
            console.error(e);
            throw new Error("Cannot check for session")
        })
}

function ToInternalTask(arrayTask) {
    return { id: arrayTask[0], content: arrayTask[1], checked: arrayTask[2], canceled: arrayTask[3] };
}
function ToArraytask(internalTask) {
    return [internalTask.id, internalTask.content, internalTask.checked, internalTask.canceled];
}
// -- REQUESTS --

async function performRequest(url, method, body) {
    if (url === undefined) throw new Error("Cannot perform request, please provide an URL");
    if (method === undefined) throw new Error("Cannot perform request, please provide a Method");

    const opts = { method: method };

    if (body) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
    }

    return fetch(url, opts)
        .then(async (response) => {
            if (!response.ok) {
                console.error('Response was not ok');
            }
            return await response.json();
        }).catch(e => {
            console.error(e);
            throw new Error("Request failed");
        })
}

const getTasksRequest = () => performRequest(`/api/task/read?username=${username}&token=${token}`, 'GET');
function deleteTaskRequest(task) {
    taskList.splice(taskList.findIndex(t => t.id === task.id), 1);
    render();
    return performRequest('/api/task/delete', 'DELETE', { task: ToArraytask(task), username: username, token: token });
}
function updateTaskRequest(task) {
    taskList[taskList.findIndex(t => t.id === task.id)] = task
    render();
    return performRequest('/api/task/update', 'PUT', { task: ToArraytask(task), username: username, token: token });
}
async function createTaskRequest(task) {
    const response = await performRequest('/api/task/create', 'POST', { task: ToArraytask(task), username: username, token: token });
    taskList.push({ ...task, id: response.id })
    render();
    return response
}

const setAttr = (attr, value, ...elements) => {
    elements.forEach(element => {
        element[attr] = value;
    });
}


// -- TASKS --
/*
    task: {
        id: string;
        content: string;
        checked: bool,
        canceled: bool
    }

    renderedTask: <div id={t-id} class="task ...">...</div>
 */
//  task : list [id, content, checked, canceled]

function render() {
    //update the current rendered list
    //compare the rendered list with the task list
    //-> start by cheking for new tasks to render
    taskList.map(t => {
        if (taskContainerDiv.querySelector("#t-" + t.id) === null) {
            //the task doesn't exist
            console.info('Creating task ' + t.id);
            renderNewTask(t)
        }
    })

    //-> then search for task to remove
    var children = taskContainerDiv.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (taskList.findIndex(t => t.id === Number.parseInt(child.id.slice(2))) === -1) {
            console.info("Removing task " + child.id);
            child.remove();
        }
    }

}


function renderNewTask(task) {
    if (task === undefined) throw new Error("Cannot create an empty task")

    const taskDiv = document.createElement('div');

    const checkbox = document.createElement('input');
    const label = document.createElement('input');
    const cancelButton = document.createElement('input');
    const deleteButton = document.createElement('button');
    const modifyButton = document.createElement('button');

    taskDiv.classList.add('task');
    taskDiv.id = "t-" + task.id

    checkbox.type = 'checkbox';
    checkbox.checked = task.checked;
    checkbox.disabled = task.canceled;
    checkbox.style.display = task.canceled ? "none" : "block"

    label.type = 'text';
    label.value = task.content;
    label.placeholder = 'fill';
    label.disabled = !task.edit || task.checked || task.canceled; // if task is checked or disabled

    cancelButton.type = 'button';
    cancelButton.value = task.canceled ? 'enable' : 'disable';
    cancelButton.disabled = task.checked;
    cancelButton.classList.add('cancel-button');
    cancelButton.style.display = task.checked ? "none" : "block"

    const deleteButtonImage = document.createElement("img");
    deleteButtonImage.src = '/static/assets/corbeille-xmark.svg';
    deleteButton.appendChild(deleteButtonImage)
    deleteButton.classList.add('delete-button');
    deleteButton.style.display = task.canceled ? "none" : "block"

    const modifyButtonImage = document.createElement("img");
    modifyButtonImage.src = task.edit ? '/static/assets/verifier.svg' : "/static/assets/crayon.svg";
    modifyButton.appendChild(modifyButtonImage)
    modifyButton.disabled = task.checked || task.canceled; // if task is checked or disabled
    modifyButton.style.display = task.checked || task.canceled ? "none" : "block"
    modifyButton.classList.add('modify-button');

    taskDiv.append(checkbox, label, modifyButton, cancelButton, deleteButton);
    taskContainerDiv.appendChild(taskDiv);

    checkbox.addEventListener('change', () => {
        if (task.canceled) {
            checkbox.checked = false;
            alert("Can't check a disabled task");
            return;
        }

        if (task.edit) {
            checkbox.checked = false;
            alert("Can't check a unsaved task");
            return;
        }

        if (label.value == '') {
            checkbox.checked = false;
            alert("Can't check an empty task");
            return;
        }

        task.checked = !task.checked;
        label.disabled = task.checked;
        cancelButton.disabled = task.checked;
        cancelButton.style.display = task.checked || task.canceled ? "none" : "block"
        modifyButton.disabled = task.checked;
        modifyButton.style.display = task.checked || task.canceled ? "none" : "block"

        if (task.id) {
            setAttr("readOnly", true, label, checkbox, cancelButton, modifyButton, deleteButton);
            updateTaskRequest(task)
                .then(() => {
                    setAttr("readOnly", false, label, checkbox, cancelButton, modifyButton, deleteButton);
                });
        }
    });

    cancelButton.addEventListener('click', () => {
        if (task.checked) {
            alert("Can't cancel a checked task");
            return;
        }

        if (task.edit) {
            alert("Can't cancel a unsaved task");
            return;
        }

        if (label.value == '') {
            alert("Can't cancel an empty task");
            return;
        }

        task.canceled = !task.canceled;
        label.disabled = task.canceled;
        checkbox.disabled = task.canceled;
        modifyButton.disabled = task.canceled;
        cancelButton.value = cancelButton.value == 'disable' ? 'enable' : 'disable';
        modifyButton.style.display = task.checked || task.canceled ? "none" : "block";
        checkbox.style.display = task.canceled ? "none" : "block";
        deleteButton.style.display = task.canceled ? "none" : "block"

        if (task.id) {
            setAttr("readOnly", true, label, checkbox, cancelButton, modifyButton, deleteButton);

            updateTaskRequest(task)
                .then(() => {
                    setAttr("readOnly", false, label, checkbox, cancelButton, modifyButton, deleteButton);
                });
        }
    });

    deleteButton.addEventListener('click', () => {
        if (task.canceled) {
            alert("Can't remove a disabled task");
            return;
        }
        deleteButtonImage.src = "/static/assets/loading.svg"
        if (task.id) {
            setAttr("readOnly", true, label, checkbox, cancelButton, modifyButton, deleteButton);
            deleteTaskRequest(task)
                .then(() => {
                    setAttr("readOnly", false, label, checkbox, cancelButton, modifyButton, deleteButton);
                });
        }
    });

    modifyButton.addEventListener('click', () => {
        if (label.value == '') {
            if (task.edit)
                alert("Can't save an empty task");
            return;
        }
        modifyButtonImage.src = "/static/assets/verifier.svg";

        task.edit = !task.edit;
        label.disabled = !task.edit;
        modifyButton.value = modifyButton.value == 'modify' ? 'save' : 'modify';

        task.content = label.value;
        if (task.id) {
            modifyButtonImage.src = "/static/assets/loadinf.svg";
            console.log("updating");
            setAttr("readOnly", true, checkbox, cancelButton, modifyButton, deleteButton);
            updateTaskRequest(task)
                .then(() => {
                    setAttr("readOnly", false, checkbox, cancelButton, modifyButton, deleteButton);
                    modifyButtonImage.src = "/static/assets/crayon.svg";
                });
        }


    });
}

function renderTaskInput() {

    const taskDiv = document.createElement('div');

    const label = document.createElement('input');
    const discardButton = document.createElement('button');
    const saveButton = document.createElement('button');

    taskDiv.classList.add('task');
    taskDiv.id = "t-0"

    label.type = 'text';
    label.placeholder = 'fill';

    const discardButtonImage = document.createElement("img");
    discardButtonImage.src = '/static/assets/corbeille-xmark.svg';
    discardButton.appendChild(discardButtonImage)
    discardButton.classList.add('delete-button');

    const saveButtonImage = document.createElement("img");
    saveButtonImage.src = '/static/assets/verifier.svg';
    saveButton.appendChild(saveButtonImage)
    saveButton.classList.add('modify-button');

    taskDiv.append(label, saveButton, discardButton);
    taskContainerDiv.appendChild(taskDiv);


    discardButton.addEventListener('click', () => {
        render();
    });

    saveButton.addEventListener('click', () => {
        if (label.value == '') {
            alert("Can't save an empty task");
            return;
        }
        saveButtonImage.src = "/static/assets/loading.svg"

        label.readOnly = true;
        saveButton.value = saveButton.value == 'modify' ? 'save' : 'modify';
        saveButton.disabled = true;
        discardButton.disabled = true;
        let constructTask = {
            id: 0,
            content: label.value,
            checked: false,
            canceled: false
        }

        createTaskRequest(constructTask)
            .then((response) => {
                constructTask.id = response.id;
                saveButtonImage.src = "/static/assets/crayon.svg"
            });

    });
}


window.addEventListener("DOMContentLoaded", init)
