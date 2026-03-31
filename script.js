document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize the app
    renderTasks();
    updateTaskCount();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            addTask(text);
            input.value = '';
            input.focus();
        }
    });

    function addTask(text) {
        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTaskElement(newTask, true); // true indicates it's newly added so it goes to bottom or top
        updateTaskCount();
        checkEmptyState();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        
        const item = document.getElementById(`task-${id}`);
        if(item) {
            const checkbox = item.querySelector('.checkbox');
            checkbox.checked = tasks.find(t => t.id === id).completed;
            item.classList.toggle('completed', checkbox.checked);
        }
        updateTaskCount();
    }

    function deleteTask(id) {
        const item = document.getElementById(`task-${id}`);
        if (item) {
            // Trigger exit animation
            item.classList.add('removing');
            
            // Remove from array and DOM after animation completes
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                item.remove();
                updateTaskCount();
                checkEmptyState();
            }, 250); 
        }
    }

    function renderTaskElement(task, prepend = false) {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.id = `task-${task.id}`;

        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle completed status">
            <span class="todo-text">${escapeHTML(task.text)}</span>
            <button class="delete-btn" aria-label="Delete task">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;

        // Event listeners
        const checkbox = li.querySelector('.checkbox');
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        const textSpan = li.querySelector('.todo-text');
        textSpan.addEventListener('click', () => {
            toggleTask(task.id);
        });

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        if (prepend) {
            todoList.prepend(li);
        } else {
            todoList.append(li);
        }
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach(task => {
            renderTaskElement(task);
        });
        checkEmptyState();
    }

    function checkEmptyState() {
        if (tasks.length === 0) {
            todoList.innerHTML = `<div class="empty-state">All caught up! Add a new task above.</div>`;
        } else {
            // Remove empty state if it exists and we have tasks
            const emptyState = todoList.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
        }
    }

    function updateTaskCount() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
