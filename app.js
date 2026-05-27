document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const taskCounter = document.getElementById('task-counter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('empty-state');
    const dateDisplay = document.getElementById('date-display');

    // App State - Default column view points to Active tasks
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'active';
    
    // State variable to track the last notified hour and prevent skipped intervals on hosted environments
    let lastNotificationHour = null;

    // Set Date Dynamic Values
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Lucide Icon Renderer
    const initIcons = () => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    };

    // Save state to Local Storage
    const saveToLocalStorage = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    // Update Counter Strings & Empty States
    const updateUIState = () => {
        const activeTasks = todos.filter(todo => !todo.completed).length;
        taskCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;

        const filteredTodos = getFilteredTodos();
        if (filteredTodos.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    };

    // Filter Column Router Logic
    const getFilteredTodos = () => {
        switch (currentFilter) {
            case 'active':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            default:
                return todos;
        }
    };

    // Readable Time Formatter String
    const getFormattedTime = () => {
        return new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Primary DOM Renderer Engine
    const renderTodos = () => {
        todoList.innerHTML = '';
        const filteredTodos = getFilteredTodos();

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            const timeTagHTML = todo.completedAt 
                ? `<span class="time-tag">Completed at ${todo.completedAt}</span>` 
                : '';

            li.innerHTML = `
                <div class="todo-item-content">
                    <div class="checkbox-container">
                        <i data-lucide="check"></i>
                    </div>
                    <div class="todo-text-wrapper">
                        <span class="todo-text"></span>
                        ${timeTagHTML}
                    </div>
                </div>
            `;

            // Escapes string text variables cleanly to prevent malicious layout payloads
            li.querySelector('.todo-text').textContent = todo.text;
            todoList.appendChild(li);
        });

        initIcons();
        updateUIState();
    };

    // Form Task Injection Event
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = todoInput.value.trim();
        if (!taskText) return;

        const newTodo = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            completedAt: null
        };

        todos.unshift(newTodo);
        saveToLocalStorage();
        renderTodos();
        
        todoInput.value = '';
        todoInput.focus();
    });

    // Touch Delegation Router - Seamless switching with no delete buttons
    todoList.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const id = todoItem.dataset.id;

        todos = todos.map(todo => {
            if (todo.id === id) {
                const isNowCompleted = !todo.completed;
                return { 
                    ...todo, 
                    completed: isNowCompleted,
                    completedAt: isNowCompleted ? getFormattedTime() : null
                };
            }
            return todo;
        });
        
        saveToLocalStorage();
        renderTodos();
    });

    // Handle Filter Buttons Action Layout Switches
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTodos();
        });
    });

// --- System Level Notification Engine (Mobile & Desktop Compatible) ---
    
    // Register the Service Worker for Android background support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered successfully!'))
                .catch(err => console.error('Service Worker registration failed:', err));
        });
    }

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    // Request permissions on the user's very first interaction click frame
    document.body.addEventListener('click', () => {
        requestNotificationPermission();
    }, { once: true });

    // Inspect timestamps precisely every 10 seconds
    const checkAndNotify = () => {
        const now = new Date();
        const minutes = now.getMinutes();
        const currentHour = now.getHours();

        if (minutes === 0 && lastNotificationHour !== currentHour) {
            const activeTasks = todos.filter(todo => !todo.completed).length;

            if (activeTasks > 0 && Notification.permission === 'granted') {
                const hourString = now.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                });

                const title = "TaskFlow Reminder";
                const options = {
                    body: `It's ${hourString}! You have ${activeTasks} active task${activeTasks !== 1 ? 's' : ''} remaining to complete.`,
                    icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
                    badge: 'https://cdn-icons-png.flaticon.com/512/906/906334.png', // Small icon for mobile status bars
                    vibrate: [200, 100, 200] // Haptic physical feedback for Android devices
                };

                // MOBILE FIX: Use service worker registration if available, fallback to standard desktop notification
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then((registration) => {
                        registration.showNotification(title, options);
                    });
                } else {
                    new Notification(title, options);
                }

                lastNotificationHour = currentHour;
            }
        }
        
        if (minutes !== 0) {
            lastNotificationHour = null;
        }
    };
    
    setInterval(checkAndNotify, 10000);

    // Initial Render
    renderTodos();
});
