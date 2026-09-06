# Focusly

Focusly is a responsive productivity dashboard for organizing tasks, tracking priorities, and monitoring daily progress. It provides a focused workspace for creating, filtering, editing, completing, and removing tasks while keeping data stored locally in the browser.

## Features

- Create tasks with a title, description, due date, priority, and category
- Edit task details through an accessible modal dialog
- Delete tasks with confirmation
- Mark tasks as completed or active
- Filter tasks by:
  - All tasks
  - Active tasks
  - Completed tasks
  - High priority
  - Tasks due today
- Browse tasks by workspace view:
  - All tasks
  - Today
  - Upcoming
  - Completed
- Filter tasks by category
- Add custom categories and persist them across sessions
- Search tasks by title, description, or category
- View task statistics for total, completed, pending, and completion percentage
- Track progress with a visual completion bar
- Clear all completed tasks with confirmation
- Light and dark themes with saved theme preference
- Responsive desktop, tablet, and mobile layouts
- Mobile navigation drawer with overlay and smooth navigation
- Smooth scrolling and subtle interface animations
- Keyboard shortcut `/` to focus the task search field
- Accessible labels, focus states, modal focus handling, and reduced-motion support
- Local browser storage with no account or server required
- Contact links for LinkedIn, GitHub, and email

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Tailwind CSS 3
- Lucide Icons
- Google Fonts: Inter
- Browser `localStorage` API

## Getting Started

### Requirements

- Node.js 18 or newer
- npm
- A modern web browser

### Installation

```bash
npm install
```

### Build Styles

```bash
npm run build:css
```

This generates the production stylesheet at `dist/style.css` from the Tailwind configuration and the source styles.

### Run the Application

Open `index.html` in a modern browser after building the stylesheet.

## Project Structure

```text
.
├── index.html           # Application markup and layout
├── src/
│   ├── css/
│   │   └── style.css    # Tailwind entry file and custom component styles
│   └── js/
│       └── script.js    # Task management, state, storage, filtering, and interactions
├── dist/
│   └── style.css        # Generated, minified stylesheet used by the application
├── tailwind.config.js   # Tailwind content paths and theme configuration
├── package.json         # Project metadata and build script
└── package-lock.json    # Locked npm dependency versions
```

## Data Storage

Focusly stores tasks, categories, the user's name, and theme preference in the browser's local storage. The application does not send task data to a backend or external API.

The local storage keys are:

| Key | Purpose |
| --- | --- |
| `focusly-tasks` | Saved task data |
| `focusly-categories` | Saved category names |
| `focusly-user-name` | Saved user name |
| `focusly-theme` | Light or dark theme preference |

## Task Behavior

Tasks are displayed with active tasks first. Within each status group, tasks are ordered by priority, due date, and creation time. Overdue tasks are visually identified, while tasks due on the current day receive a dedicated status indicator.

Each new browser profile starts with an empty task list. On first use, Focusly asks for the user's name and stores it locally for the personalized greeting and profile badge.

## Interface Design

Focusly uses a clean dashboard layout with:

- A persistent desktop sidebar
- A responsive mobile navigation drawer
- Summary statistic cards
- Task creation and progress panels
- Search and filter controls
- Task cards with clear metadata and actions
- Toast notifications for important actions
- Modal dialogs for editing and deleting tasks
- Responsive spacing, typography, and controls for smaller screens

## Accessibility

The interface includes semantic landmarks, descriptive ARIA labels, keyboard-friendly controls, visible focus states, modal focus restoration, focus trapping, and support for users who prefer reduced motion.

## License

This project is available for personal and educational use.
