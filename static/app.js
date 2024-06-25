// -- REQUESTS --

const performRequest = async (url, method, body) => {
    const opts = { method: method };

    if (body)
    {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
    }
    
    return fetch(url, opts)
        .then(async (response) => {
            if (!response.ok)
            {
                console.error('Response was not ok');        
            }
            return await response.json();
        });
}

const getTasksRequest = () => {
    return performRequest(`/api/task/read?username=${username}&token=${token}`, 'GET');
}

const deleteTaskRequest = (task) => {
    return performRequest('/api/task/delete', 'DELETE', {task:task, username: username, token: token});
}

const updateTaskRequest = (task) => { 
    return performRequest('/api/task/update', 'PUT', {task:task, username: username, token: token});
}

const createTaskRequest = (task) => {
    return performRequest('/api/task/create', 'POST', {task:task, username: username, token: token});
}

const setAttr = (attr, value, ...elements) => {
    elements.forEach(element => {
        element[attr] = value;
    });
}

const taskContainerDiv = document.getElementById('task-container');

// -- TASKS --
//  task : list [id, content, checked, canceled]
const createTask = (task) => {
    const taskDiv = document.createElement('div');

    const checkbox = document.createElement('input');
    const label = document.createElement('input');
    const cancelButton = document.createElement('input');
    const deleteButton = document.createElement('input');
    const modifyButton = document.createElement('input');

    taskDiv.classList.add('task');

    checkbox.type = 'checkbox';
    checkbox.checked = task[2];
    checkbox.disabled = task[3];

    label.type = 'text';
    label.value = task[1];
    label.placeholder = 'fill';
    label.disabled = task[2] || task[3]; // if task is checked or disabled
    label.readOnly = !task[4];

    cancelButton.type = 'button';
    cancelButton.value = task[3] ? 'enable' : 'disable';
    cancelButton.disabled = task[2];
    cancelButton.classList.add('cancel-button');

    deleteButton.type = 'button';
    deleteButton.value = 'delete';
    deleteButton.classList.add('delete-button');

    modifyButton.type = 'button';
    modifyButton.value = task[4] ? 'save' : 'modify';
    modifyButton.disabled = task[2] || task[3]; // if task is checked or disabled
    modifyButton.classList.add('modify-button');

    taskDiv.append(checkbox, label, modifyButton, cancelButton, deleteButton);
    taskContainerDiv.appendChild(taskDiv);

    checkbox.addEventListener('change', () => {
        if (task[3])
        {
            checkbox.checked = false;
            alert("Can't check a disabled task");
            return;
        }

        if (task[4])
        {
            checkbox.checked = false;
            alert("Can't check a unsaved task");
            return;
        }

        if (label.value == '')
        {
            checkbox.checked = false;
            alert("Can't check an empty task");
            return;
        }

        task[2] = !task[2];
        label.disabled = task[2];
        cancelButton.disabled = task[2];
        modifyButton.disabled = task[2];

        if (task[0])
        {
            setAttr("readOnly", true, label, checkbox, cancelButton, modifyButton, deleteButton);

            updateTaskRequest(task)
            .then(() => {
                setAttr("readOnly", false, label, checkbox, cancelButton, modifyButton, deleteButton);
            });
        }
    });

    cancelButton.addEventListener('click', () => {
        if (task[2])
        {
            alert("Can't cancel a checked task");
            return;
        }

        if (task[4])
        {
            alert("Can't cancel a unsaved task");
            return;
        }

        if (label.value == '')
        {
            alert("Can't cancel an empty task");
            return;
        }

        task[3] = !task[3];
        label.disabled = task[3];
        checkbox.disabled = task[3];
        modifyButton.disabled = task[3];
        cancelButton.value = cancelButton.value == 'disable' ? 'enable' : 'disable';

        if (task[0])
        {
            setAttr("readOnly", true, label, checkbox, cancelButton, modifyButton, deleteButton);

            updateTaskRequest(task)
            .then(() => {
                setAttr("readOnly", false, label, checkbox, cancelButton, modifyButton, deleteButton);
            });
        }
    });

    deleteButton.addEventListener('click', () => {
        if (task[3])
        {
            alert("Can't remove a disabled task");
            return;
        }

        taskDiv.remove();
        if (task[0])
        { 
            setAttr("readOnly", true, label, checkbox, cancelButton, modifyButton, deleteButton);
    
            deleteTaskRequest(task)
            .then(() => {
                setAttr("readOnly", false, label, checkbox, cancelButton, modifyButton, deleteButton);
            });
        }
    });

    modifyButton.addEventListener('click', () => {
        if (label.value == '')
        {
            if (task[4])
                alert("Can't save an empty task");
            return;
        }
        
        task[4] = !task[4];
        label.readOnly = !task[4];
        modifyButton.value = modifyButton.value == 'modify' ? 'save' : 'modify';

        if (!task[4])
        {
            task[1] = label.value;
            if (task[0])
            {     
                setAttr("readOnly", true, checkbox, cancelButton, modifyButton, deleteButton);
                updateTaskRequest(task)
                .then(() => {
                    setAttr("readOnly", false, checkbox, cancelButton, modifyButton, deleteButton);
                });
            }
            else
            {
                setAttr("readOnly", true, checkbox, cancelButton, modifyButton, deleteButton);
                
                createTaskRequest(task)
                .then((response) => {
                    task[0] = response.id;
                    setAttr("readOnly", false, checkbox, cancelButton, modifyButton, deleteButton);
                });
            }
        }
    });
}

getTasksRequest()
.then(response => {
    console.log(response)
    tasks = response;
    tasks.forEach(task => {
        task.push(false);
        createTask(task);
    });
});

const createTaskButton = document.getElementById('create-task-button');
createTaskButton.addEventListener('click', () => {
    task = [0, '', false, false, true];
    createTask(task);
    tasks.push(task);
});

window.addEventListener('beforeunload', () => {
});