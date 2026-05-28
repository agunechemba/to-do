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

    // Smart Date-Aware Completion Formatter
    const getReadableCompletionTime = (isoString) => {
        if (!isoString) return '';
        
        const completedDate = new Date(isoString);
        const today = new Date();
        
        // Format the clock portion smoothly (e.g., 2:15 PM)
        const timeString = completedDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        // Check if the calendar dates match perfectly
        const isToday = completedDate.getDate() === today.getDate() &&
                        completedDate.getMonth() === today.getMonth() &&
                        completedDate.getFullYear() === today.getFullYear();
                        
        if (isToday) {
            return `Today at ${timeString}`;
        } else {
            const dateString = completedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            return `${dateString} at ${timeString}`;
        }
    };

    // Filter Column & Sorting Router Logic
    const getFilteredTodos = () => {
        let result = [];
        
        switch (currentFilter) {
            case 'active':
                result = todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                result = todos.filter(todo => todo.completed);
                // SORT MATRIX: Most recently completed tasks move to the top safely
                result.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                break;
            default:
                result = todos;
                break;
        }
        return result;
    };

    // Primary DOM Renderer Engine
    const renderTodos = () => {
        todoList.innerHTML = '';
        const filteredTodos = getFilteredTodos();

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            // Render readable dates derived dynamically from stored ISO timestamps
            const timeTagHTML = todo.completedAt 
                ? `<span class="time-tag">Completed ${getReadableCompletionTime(todo.completedAt)}</span>` 
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
                    // Persist the full raw timestamp object string for processing later
                    completedAt: isNowCompleted ? new Date().toISOString() : null
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
                    badge: 'https://cdn-icons-png.flaticon.com/512/906/906334.png', 
                    vibrate: [200, 100, 200] 
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