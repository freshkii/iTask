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
                    
                    function createTask() {
                        task = {
                            id: 0,
                            content: "",
                            checked: false,
                            canceled: false,
                            edit: true
                        };
                        taskList.push(task);
                        render();
                    }
                    
                    createTaskButton.addEventListener('click', createTask);
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
const deleteTaskRequest = (task) => performRequest('/api/task/delete', 'DELETE', { task: ToArraytask(task), username: username, token: token });
const updateTaskRequest = (task) => performRequest('/api/task/update', 'PUT', { task: ToArraytask(task), username: username, token: token });
const createTaskRequest = (task) => performRequest('/api/task/create', 'POST', { task: ToArraytask(task), username: username, token: token });

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
            console.log('Creating task ' + t.id);
            renderNewTask(t)
        }
    })

    //-> then search for task to remove
    taskContainerDiv.childNodes.entries((i, e) => {
        if (taskList.findIndex(t => t === e.id) === null) {
            console.log("Removing task " + e.id);
            e.remove();
        }
    })
}


function renderNewTask(task) {
    if (task === undefined) throw new Error("Cannot create an empty task")

    const taskDiv = document.createElement('div');

    const checkbox = document.createElement('input');
    const label = document.createElement('input');
    const cancelButton = document.createElement('input');
    const deleteButton = document.createElement('input');
    const modifyButton = document.createElement('input');

    taskDiv.classList.add('task');
    taskDiv.id = "t-" + task.id

    checkbox.type = 'checkbox';
    checkbox.checked = task.checked;
    checkbox.disabled = task.canceled;

    label.type = 'text';
    label.value = task.content;
    label.placeholder = 'fill';
    label.disabled = task.checked || task.canceled; // if task is checked or disabled
    label.readOnly = !task.edit;

    cancelButton.type = 'button';
    cancelButton.value = task.canceled ? 'enable' : 'disable';
    cancelButton.disabled = task.checked;
    cancelButton.classList.add('cancel-button');

    deleteButton.type = 'button';
    deleteButton.value = 'delete';
    deleteButton.classList.add('delete-button');

    modifyButton.type = 'button';
    modifyButton.value = task.edit ? 'save' : 'modify';
    modifyButton.disabled = task.checked || task.canceled; // if task is checked or disabled
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
        modifyButton.disabled = task.checked;

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

        taskDiv.remove();
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

        task.edit = !task.edit;
        label.readOnly = !task.edit;
        modifyButton.value = modifyButton.value == 'modify' ? 'save' : 'modify';

        if (!task.edit) {
            task.content = label.value;
            if (task.id) {
                console.log("updating");
                setAttr("readOnly", true, checkbox, cancelButton, modifyButton, deleteButton);
                updateTaskRequest(task)
                    .then(() => {
                        setAttr("readOnly", false, checkbox, cancelButton, modifyButton, deleteButton);
                    });
            }
            else {
                setAttr("readOnly", true, checkbox, cancelButton, modifyButton, deleteButton);

                createTaskRequest(task)
                    .then((response) => {
                        task.id = response.id;
                        setAttr("readOnly", false, checkbox, cancelButton, modifyButton, deleteButton);
                    });
            }
        }
    });
}

window.addEventListener("DOMContentLoaded", init)
