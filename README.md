# TaskTrack-KanBan-Board

> A modern, responsive Kanban board with optimistic UI updates and automatic rollback on failures.

---

## 📸 Screenshots

### Landing Page

<img width="1896" height="911" alt="image" src="https://github.com/user-attachments/assets/a3be2dd6-41e7-48a2-a0d4-68f334ea24d5" />

*Home page with feature highlights*

---

### Login page

<img width="1918" height="907" alt="image" src="https://github.com/user-attachments/assets/ca5e030a-904f-4d72-adc6-f7bdbc488c66" />

---

### Main Board View

<img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/4812f8f4-20c2-4b48-ad81-7be096dc25b3" />

<br/>

<img width="1897" height="897" alt="image" src="https://github.com/user-attachments/assets/83d80a29-bdb3-4391-a181-75162a347394" />

*Kanban board with drag-and-drop functionality*

---

### Mobile Responsive

<img width="378" height="785" alt="image" src="https://github.com/user-attachments/assets/304a0863-a3c7-4b3b-994e-4ca299d4aa17" />

*Responsive design for mobile devices*

---

## 💡 Project Overview

I built a Kanban board that feels **super fast** because it uses **"Optimistic UI"** - when you drag a card or add a task, it updates immediately on screen even before the server confirms it. If something goes wrong, it automatically rolls back.

---

## ✨ Key Features

- ✅ Drag & drop tasks between columns  
- ✅ Add tasks with priority levels (Low, Medium, High)  
- ✅ Instant UI updates with auto rollback  
- ✅ Mock authentication (no backend required)  
- ✅ Responsive design with dark theme  
- ✅ LocalStorage persistence  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| **React 18** | UI Library |
| **Vite** | Build Tool |
| **Zustand** | State Management |
| **@dnd-kit** | Drag & Drop |
| **Tailwind CSS** | Styling |
| **Wouter** | Routing |
| **Lucide React** | Icons |

---

## 📋 Prerequisites

Before running this project, make sure you have:

- ✓ Node.js (v16 or higher)  
- ✓ npm or yarn  
- ✓ A code editor (VS Code recommended)  

---

## 🚀 How to Run Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/krypton-kanban.git
cd krypton-Kanban
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Development Server

```bash
npm run dev
```

### Step 4: Open in Browser

🌐 http://localhost:5000

### Step 5: Login

📧 Username: test@example.com  
🔑 Password: anything (just type something)

---

## 📁 Project Structure

```bash
├── src/
│
│   ├── components/
│   │   ├── Board/
│   │   │   ├── BoardHeader.jsx
│   │   │   ├── Column.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── QuickTask.jsx
│   │   │   └── TaskCard.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Container.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   └── ui/
│   │       ├── card.jsx
│   │       ├── dropdown-menu.jsx
│   │       ├── input.jsx
│   │       ├── label.jsx
│   │       ├── select.jsx
│   │       ├── toast.jsx
│   │       ├── toaster.jsx
│   │       └── tooltip.jsx
│   │
│   ├── hooks/
│   │   ├── use-board.js
│   │   └── use-toast.js
│   │
│   ├── lib/
│   │   ├── queryClient.js
│   │   └── utils.js
│   │
│   ├── pages/
│   │   ├── board.jsx
│   │   ├── landing.jsx
│   │   ├── login.jsx
│   │   ├── not-found.jsx
│   │   └── register.jsx
│   │
│   ├── state/
│   │   ├── auth.js
│   │   └── boardStore.js
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── postcss.config.js
├── tailwind.config.js
```

---

## 🎨 Optimistic UI Approach

### 🤔 What is Optimistic UI?

Instead of waiting for the server to confirm an action, we update the UI immediately assuming it will succeed. This makes the app feel super fast and responsive.

```text
┌─────────────────────────────────────────────────────────┐
│  1. USER ACTION                                        │
│     └─> User drags a task to new column               │
│                                                        │
│  2. IMMEDIATE UPDATE                                   │
│     └─> UI updates instantly (optimistic)             │
│     └─> Save backup of current state                  │
│                                                        │
│  3. API CALL                                           │
│     └─> Send request to server in background          │
│                                                        │
│  4. HANDLE RESPONSE                                    │
│     ├─> ✅ SUCCESS: Keep the change                   │
│     └─> ❌ FAILURE: Rollback to backup state          │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Code Example

```javascript
// Simplified version from boardStore.js

moveTask: async (id, newColumn) => {

  // 1️⃣ Save current state as backup
  const backup = [...get().tasks];

  // 2️⃣ Update UI immediately (optimistic)
  set({
    tasks: get().tasks.map(t =>
      t.id === id ? { ...t, column: newColumn, pending: true } : t
    )
  });

  // 3️⃣ Call API in background
  const result = await mockApi.moveTask(id, newColumn);

  // 4️⃣ Handle response
  if (!result.ok) {
    set({ tasks: backup });  // ⏮️ Rollback if failed!
    showErrorToast();
  } else {
    set({
      tasks: get().tasks.map(t =>
        t.id === id ? { ...t, pending: false } : t
      )
    });
  }
}
```

---

## 🎯 Why This Approach?

✨ Better UX → No waiting for server responses  
⚡ Feels Faster → Instant feedback on every action  
🔄 Graceful Errors → Automatic rollback, no broken states  
🌟 Real-world → Used by Twitter, Slack, Trello  

---

## 🎭 Visual Feedback

While an action is pending:

- 🔄 Card shows subtle pulse animation  
- 👻 Opacity slightly reduced  
- ⏳ "Syncing..." badge appears  

---

## 🚧 Future Improvements

- □ Real backend with Node.js/Express  
- □ Task due dates and reminders  
- □ User avatars and profiles  
- □ Team collaboration features  
- □ Dark/Light theme toggle  
- □ Export to CSV functionality  

---

## 📚 What I Learned

- ✓ How to implement optimistic UI patterns  
- ✓ Complex drag-and-drop interactions  
- ✓ Handling errors and rollbacks gracefully  
- ✓ Building responsive layouts with Tailwind  
- ✓ React hooks and component composition  

---

## 👨‍💻 Author

👤 Kamal Suthar  
📧 suthargaurishankar398@gmail.com  
🐙 https://github.com/kamalsuthar123456  
💼 https://www.linkedin.com/in/kamal-suthar-636303277/
