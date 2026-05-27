# TaskFlow // Professional To-Do

TaskFlow is a high-performance, minimalist task management web application designed for mobile-first productivity. It features a modern, card-based interface with native system dark/light adaptation, persistent local storage, and real-time productivity metrics.

---

## 🚀 Key Features

* **Fluid Column Swapping:** No delete buttons. Tapping a task item card toggles its completion state, instantly filtering it into its correct column workspace (**Active** or **Completed**).
* **Live Completion Timestamps:** Tasks marked as complete are stamped with a precision time badge (e.g., *Completed at 2:15 PM*) that persists across browser sessions.
* **System Theme Detection:** Zero manual configuration. The user interface automatically evaluates and shifts color palettes to match your OS light or dark theme configurations.
* **Hourly Background Reminders:** Uses native browser background workers to check your queue on top of the hour. If active items remain, a system notification reminds you to stay on track.
* **Mobile-First Target Scaling:** Touch elements feature a wide, high-contrast surface configuration mapping directly to standard iOS and Android touch target guidelines to prevent accidental miss-clicks.

---

## 🛠️ Technology Stack

| Layer | Component | Description |
|---|---|---|
| **Structure** | HTML5 | Semantically organized markup optimizing accessibility. |
| **Styles** | CSS3 Variables | Core architecture leveraging system dark-mode media hooks. |
| **Logic** | Native ES6 JavaScript | Zero-dependency DOM reconciliation engine. |
| **Assets** | Lucide Icons | Premium vector iconography loaded smoothly via open-source CDN. |

---

## 📂 Project Architecture

To run this project locally, ensure your working directory contains the following three foundational files:

```bash
├── index.html       # Application layout, views, and core DOM structures
├── style.css        # Adaptive design layout tokens and custom media wrappers
└── app.js           # LocalStorage state engine and interval workers