/**
 internalTask: {
    id: string;
    content: string;
    done: bool,
    locked: bool,
    inEdit? bool
}

arrayTask: [id, content, checked, canceled]
*/

const taskContainerDiv = document.getElementById('task-container');
const createTaskButton = document.getElementById('create-task-button');
let taskList = [];

async function init() {
    if (taskContainerDiv === null) throw new Error("Cannot get the task container \n - Add an element with id 'task-container'")
    if (createTaskButton === null) throw new Error("Cannot get the create button \n - Add an element with id 'create-task-button'")
    //check for session
    const isAuthorized = await checkSession().catch(e => {
        console.error(e);
        throw new Error("Cannot check for session")
    })
    if (!isAuthorized) {
        console.warn("UnauthorizedError: User not logged");
        window.location.replace("/login");
    }
    else {
        //get tasks
        getTasksRequest()
            .then(response => {
                taskList = response.map(e => ToInternalTask(e))
                render();
            });

        //init add button
        const emptyTask = {
            id: 0,
            content: "",
            locked: false,
            done: false,
            inEdit: true
        }

        createTaskButton.addEventListener('click', () => {
            if (taskContainerDiv.querySelector("#t-0") === null) _renderTask(emptyTask, true)
        });
        document.addEventListener("keydown", (e) => {
            if ((e.key === "t" || e.key === "T") && taskContainerDiv.querySelector("#t-0") === null) {
                e.preventDefault();
                _renderTask(emptyTask, true)
            }

        })
        //remove loader
        setTimeout(() => {
            document.getElementById("loader").remove()
        }, 500);
    }

}

/**
 * Convert an arrayTask from the backend to an internalTask for the frontend
 * @param {[]} arrayTask 
 * @returns {} internalTask
 */
function ToInternalTask(arrayTask) {
    return { id: arrayTask[0], content: arrayTask[1], done: arrayTask[2] === 1, locked: arrayTask[3] === 1, inEdit: false };
}

/**
 * Convert an internalTask from the frontend to an arrayTask for the backend
 * @param {} internalTask 
 * @returns {[]} arrayTask
 */
function ToArraytask(internalTask) {
    return [internalTask.id, internalTask.content, internalTask.done, internalTask.locked];
}

/**
 * Perform a request to the backend
 * @param {string} url 
 * @param {string} method 
 * @param {*} body 
 * @returns Promise<Response>
 */
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

/**
 * Get all task from the storage
 */
const getTasksRequest = () => performRequest(`/api/task/read?username=${username}&token=${token}`, 'GET');
/**
 * Delete a task in storage
 * @param {task} task 
 */
function deleteTaskRequest(task) {
    taskList.splice(taskList.findIndex(t => t.id === task.id), 1);
    render();
    return performRequest('/api/task/delete', 'DELETE', { task: ToArraytask(task), username: username, token: token });
}
/**
 * Update a task in storage
 * @param {task} newTask 
 */
function updateTaskRequest(newTask) {
    taskList[taskList.findIndex(t => t.id === newTask.id)] = newTask;
    render();
    return performRequest('/api/task/update', 'PUT', { task: ToArraytask(newTask), username: username, token: token });
}
/**
 * Create a task in storage
 * @param {task} task 
 */
async function createTaskRequest(task) {
    const response = await performRequest('/api/task/create', 'POST', { task: ToArraytask(task), username: username, token: token });
    taskList.push({ ...task, id: response.id })
    render();
    return response
}

/**
 * Ensure a task object is correct and contain all properties
 * @param {task} toTestTask
 * @throws Error
 */
function assertTask(toTestTask) {
    if (toTestTask === undefined) throw new Error("Task is undefined");
    if (toTestTask.id === null) throw new Error("Cannot update element " + "unknown" + " because " + "id" + "is null")
    if (toTestTask.content === null) throw new Error("Cannot update element " + toTestTask.id + " because " + "content" + "is null")
    if (toTestTask.id !== 0 && toTestTask.content.length === 0) console.warn("Warning: Content of element " + toTestTask.id + " is empty");
    if (toTestTask.done === null) throw new Error("Cannot update element " + toTestTask.id + " because " + "done" + "is null")
    if (toTestTask.locked === null) throw new Error("Cannot update element " + toTestTask.id + " because " + "locked" + "is null")
}

/**
 * Update the rendered DOM from the taskList
 */
function render() {
    //-> start by cheking for new tasks to render
    taskList.map(t => {
        if (taskContainerDiv.querySelector("#t-" + t.id) === null) {
            //the task doesn't exist
            console.info('Creating task ' + t.id);
            _renderTask(t, false)
        }
    })

    //-> then search for task to remove
    var children = taskContainerDiv.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (taskList.findIndex(t => t.id === Number.parseInt(child.id.slice(2))) === -1) {
            if (child.id !== "t-0") console.info("Removing task " + child.id);
            child.remove();
        }
    }

    //And finally update task's properies
    taskList.map(t => {
        //Check for task corruption
        assertTask(t);
        //define consts
        const elementId = "t-" + t.id;
        //Resolve HTML elements
        const element = taskContainerDiv.querySelector("#" + elementId);
        if (element === null) throw new Error("Cannot resolve element " + elementId)
        const doneButton = element.querySelector(".done-button");
        if (doneButton === null) throw new Error("Cannot resolve component " + "Done button" + " in element " + elementId)
        const contentLabel = element.querySelector('.content');
        if (contentLabel === null) throw new Error("Cannot resolve component " + "Content label" + " in element " + elementId)
        const editButton = element.querySelector('.edit-button');
        if (editButton === null) throw new Error("Cannot resolve component " + "Edit button" + " in element " + elementId)
        const editButtonIcon = editButton.querySelector('img');
        if (editButtonIcon === null) throw new Error("Cannot resolve component " + "Edit button Icon" + " in element " + elementId)
        const lockButton = element.querySelector('.lock-button');
        if (lockButton === null) throw new Error("Cannot resolve component " + "Lock button" + " in element " + elementId)
        const deleteButton = element.querySelector('.delete-button');
        if (deleteButton === null) throw new Error("Cannot resolve component " + "Delete button" + " in element " + elementId)
        const deleteButtonIcon = deleteButton.querySelector("img");
        if (deleteButtonIcon === null) throw new Error("Cannot resolve component " + "Delete button Icon" + " in element " + elementId)
        //Apply properies
        //  Container
        if (!element.classList.contains("task")) element.classList.add("task");
        if (element.id === undefined) element.id = elementId;
        //  Done button
        if (doneButton.checked !== t.done) doneButton.checked = t.done;
        if (doneButton.style.display !== t.locked ? "none" : "block") doneButton.style.display = t.locked ? "none" : "block";
        if (doneButton.disabled !== t.locked) doneButton.disabled = t.locked
        //  Content label
        if (contentLabel.value !== t.content) contentLabel.value = t.content;
        if (contentLabel.disabled !== !t.inEdit || t.done || t.locked) contentLabel.disabled = !t.inEdit || t.done || t.locked;
        //  Edit button
        if (editButtonIcon.src !== t.inEdit ? '/static/assets/verifier.svg' : "/static/assets/crayon.svg") editButtonIcon.src = t.inEdit ? '/static/assets/verifier.svg' : "/static/assets/crayon.svg";
        if (editButton.style.display !== t.done || t.locked ? "none" : "block") editButton.style.display = t.done || t.locked ? "none" : "block"
        if (editButton.disabled !== t.done || t.locked) editButton.disabled = t.done || t.locked
        //  Lock button
        if (lockButton.value !== t.locked ? 'Unlock' : 'Lock') lockButton.value = t.locked ? 'Unlock' : 'Lock';
        if (lockButton.style.display !== t.done ? "none" : "block") lockButton.style.display = t.done ? "none" : "block";
        if (lockButton.disabled !== t.done) lockButton.disabled = t.done;
        //  Delete button
        if (deleteButton.style.display !== t.locked ? "none" : "block") deleteButton.style.display = t.locked ? "none" : "block";
        if (deleteButton.disabled !== t.locked) deleteButton.disabled = t.locked
    })
}

/**
 * Generate a new task
 * @private
 * @param {task} task 
 * @param {boolean} input if task to render is an input
 */
function _renderTask(task, input) {
    assertTask(task);
    //Construct task
    const Container = document.createElement('div');
    Container.classList.add('task');
    Container.id = "t-" + task.id;

    const doneButton = document.createElement('input');
    if (!input) {
        doneButton.type = 'checkbox';
        doneButton.classList.add("done-button")
        Container.appendChild(doneButton);
    }

    const labelContent = document.createElement('input');
    labelContent.type = 'text';
    labelContent.placeholder = 'Enter a task content';
    labelContent.classList.add("content")
    Container.appendChild(labelContent);

    const editButton = document.createElement('button');
    const editButtonImage = document.createElement("img");
    editButtonImage.src = task.inEdit ? '/static/assets/verifier.svg' : "/static/assets/crayon.svg";
    editButton.appendChild(editButtonImage);

    editButton.classList.add("edit-button")
    Container.appendChild(editButton);
    const lockButton = document.createElement('input');
    if (!input) {
        lockButton.type = 'button';
        lockButton.classList.add('lock-button');
        Container.appendChild(lockButton);
    }

    const deleteButton = document.createElement('button');

    const deleteButtonImage = document.createElement("img");
    deleteButtonImage.src = '/static/assets/corbeille-xmark.svg';
    deleteButton.appendChild(deleteButtonImage)

    deleteButton.classList.add('delete-button');
    Container.appendChild(deleteButton);

    taskContainerDiv.appendChild(Container);

    //define update functions
    const disableAll = () => {
        const setAttr = (attr, value, ...elements) => {
            elements.forEach(element => {
                element[attr] = value;
            });
        }
        setAttr("disabled", true, lockButton, editButton);
        if (!input) setAttr("disabled", true, labelContent, doneButton, deleteButton)
    }
    const updateLocal = () => {
        taskList[taskList.findIndex(t => t.id === task.id)] = task
    }
    const saveContent = async (e) => {
        e.preventDefault()
        if (labelContent.value == '') {
            alert("Can't save an empty task");
            return;
        }
        task.content = labelContent.value;
        disableAll()
        editButtonImage.src = "/static/assets/loading.svg";
        if (input) {
            task = { ...task, inEdit: false }
            await createTaskRequest(task);
        }
        else if (task.inEdit) {
            task.inEdit = false;
            await updateTaskRequest(task);
            updateLocal()
        } else {
            task.inEdit = true;
            render()
        }
        editButtonImage.src = "/static/assets/crayon.svg";
    }
    editButton.addEventListener('click', saveContent);
    Container.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') saveContent(e)
    })

    if (!input) doneButton.addEventListener('change', async (e) => {
        e.preventDefault()
        if (task.locked) {
            doneButton.checked = false;
            alert("Can't check a disabled task");
            return;
        }

        if (task.inEdit) {
            doneButton.checked = false;
            alert("Can't check a unsaved task");
            return;
        }

        if (labelContent.value == '') {
            doneButton.checked = false;
            alert("Can't check an empty task");
            return;
        }
        //process update
        task.done = doneButton.checked;
        disableAll();
        await updateTaskRequest(task);
        updateLocal()
    });

    if (!input) lockButton.addEventListener('click', async (e) => {
        e.preventDefault()
        if (task.done) {
            alert("Can't cancel a checked task");
            return;
        }

        if (task.inEdit) {
            alert("Can't cancel a unsaved task");
            return;
        }

        if (labelContent.value == '') {
            alert("Can't cancel an empty task");
            return;
        }

        task.locked = !task.locked;

        disableAll()
        await updateTaskRequest(task);
        updateLocal()
    });

    deleteButton.addEventListener('click', async (e) => {
        e.preventDefault()
        if (task.locked) {
            alert("Can't remove a disabled task");
            return;
        }
        deleteButtonImage.src = "/static/assets/loading.svg"
        disableAll()
        if (input) {
            render()
        } else await deleteTaskRequest(task)
    });

    if (input) labelContent.focus();

}
window.addEventListener("DOMContentLoaded", init)