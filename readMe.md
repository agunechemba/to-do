# TaskFlow // Professional To-Do

TaskFlow is a high-performance, minimalist task management web application engineered for mobile-first productivity. It features a modern, card-based interface with native system dark/light adaptation, persistent local storage, real-time productivity metrics, and full Progressive Web App (PWA) compliance for cross-platform support.

---

## 🚀 Key Features

* **Cross-Platform PWA Support:** Installable directly onto Android, iOS, and desktop devices via Chrome as a standalone application.
* **Fluid Column Swapping:** Built without a destructive delete button. Tapping a task item card toggles its completion state, instantly filtering it into its correct column workspace (**Active** or **Completed**).
* **Live Completion Timestamps:** Tasks marked as complete are instantly stamped with an elegant, localized metadata badge (e.g., *Completed at 2:15 PM*) that persists across browser sessions.
* **System Theme Detection:** Zero manual configuration required. The interface automatically adapts to your operating system's light or dark mode theme tokens.
* **Throttling-Resistant Mobile Alerts:** Built-in background intervals running alongside a Service Worker monitor the queue every 10 seconds. It comfortably bypasses mobile browser power-saving restrictions to deliver native reminders right on the hour.
* **Mobile-First Target Scaling:** Actionable card components utilize an expanded touch target map adhering directly to standard mobile touch-guidelines to prevent accidental clicks.

---

## 🛠️ Technology Stack

| Layer | Component | Description |
|---|---|---|
| **Structure** | HTML5 | Semantically organized markup optimizing accessibility. |
| **Styles** | CSS3 Variables | Adaptive style variables leveraging system media hooks. |
| **Logic** | Native ES6 JavaScript | Zero-dependency DOM reconciliation and event delegation engine. |
| **PWA Core** | Service Workers & Manifest | Handles local background execution, caching, and installation scripts. |
| **Assets** | Lucide Icons | Premium vector iconography loaded smoothly via open-source CDN. |

---

## 📂 Project Architecture

To run this project locally or host it over HTTPS, ensure your working directory contains the following five core files:

```bash
├── index.html       # Application layout, views, and structural DOM components
├── style.css        # Adaptive layout tokens, theme hooks, and mobile styles
├── app.js           # Core application logic, state tracker, and permission handlers
├── manifest.json    # PWA configuration script defining colors, scopes, and app icons
└── sw.js            # Service Worker background thread handling cache layers and alerts
