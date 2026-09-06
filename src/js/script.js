"use strict";

/* =========================================================
   Focusly
   Vanilla JavaScript Task Manager
========================================================= */

const STORAGE_KEYS = {
  tasks: "focusly-tasks",
  theme: "focusly-theme",
  categories: "focusly-categories",
  userName: "focusly-user-name"
};

const DEFAULT_CATEGORIES = ["Personal", "Work", "Study"];
const LEGACY_DEMO_TITLES = new Set([
  "Review weekly goals",
  "Study JavaScript",
  "Morning workout",
  "Prepare project presentation",
  "Read design article"
]);

const PRIORITY_WEIGHT = {
  High: 0,
  Medium: 1,
  Low: 2
};

/* =========================================================
   Application State
========================================================= */

const state = {
  tasks: [],
  categories: [],
  userName: "",
  filter: "all",
  view: "all",
  searchQuery: "",
  selectedCategory: null,
  editingTaskId: null,
  deletingTaskId: null,
  lastFocusedElement: null
};

/* =========================================================
   DOM References
========================================================= */

const elements = {
  taskForm: document.getElementById("taskForm"),

  taskTitle: document.getElementById("taskTitle"),
  taskDescription: document.getElementById("taskDescription"),
  taskDueDate: document.getElementById("taskDueDate"),
  taskPriority: document.getElementById("taskPriority"),
  taskCategory: document.getElementById("taskCategory"),
  categoryLists: document.querySelectorAll("[data-category-list]"),
  categorySelects: document.querySelectorAll("[data-category-select]"),

  titleError: document.getElementById("titleError"),
  dueDateError: document.getElementById("dueDateError"),

  searchInput: document.getElementById("searchInput"),
  searchSubmitButton: document.getElementById("searchSubmitButton"),
  searchSuggestions: document.getElementById("searchSuggestions"),

  taskList: document.getElementById("taskList"),
  taskListSection: document.getElementById("taskListSection"),
  emptyState: document.getElementById("emptyState"),
  emptyStateTitle: document.getElementById("emptyStateTitle"),
  emptyStateText: document.getElementById("emptyStateText"),
  emptyStateAddButton: document.getElementById("emptyStateAddButton"),

  filterGroup: document.getElementById("filterGroup"),

  taskListTitle: document.getElementById("taskListTitle"),
  taskListSubtitle: document.getElementById("taskListSubtitle"),

  totalTasks: document.getElementById("totalTasks"),
  completedTasks: document.getElementById("completedTasks"),
  pendingTasks: document.getElementById("pendingTasks"),
  completionPercentage: document.getElementById("completionPercentage"),

  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  progressPercentageBadge: document.getElementById("progressPercentageBadge"),

  clearCompletedButton: document.getElementById("clearCompletedButton"),

  currentDate: document.getElementById("currentDate"),
  userName: document.getElementById("userName"),
  userAvatar: document.getElementById("userAvatar"),
  welcomeModal: document.getElementById("welcomeModal"),
  welcomeForm: document.getElementById("welcomeForm"),
  userNameInput: document.getElementById("userNameInput"),
  userNameError: document.getElementById("userNameError"),

  editModal: document.getElementById("editModal"),
  editTaskForm: document.getElementById("editTaskForm"),
  editTaskId: document.getElementById("editTaskId"),
  editTaskTitle: document.getElementById("editTaskTitle"),
  editTaskDescription: document.getElementById("editTaskDescription"),
  editTaskDueDate: document.getElementById("editTaskDueDate"),
  editTaskPriority: document.getElementById("editTaskPriority"),
  editTaskCategory: document.getElementById("editTaskCategory"),
  editTitleError: document.getElementById("editTitleError"),
  editDateError: document.getElementById("editDateError"),
  closeEditModal: document.getElementById("closeEditModal"),
  cancelEditButton: document.getElementById("cancelEditButton"),

  deleteModal: document.getElementById("deleteModal"),
  deleteTaskName: document.getElementById("deleteTaskName"),
  closeDeleteModal: document.getElementById("closeDeleteModal"),
  cancelDeleteButton: document.getElementById("cancelDeleteButton"),
  confirmDeleteButton: document.getElementById("confirmDeleteButton"),

  toastContainer: document.getElementById("toastContainer"),

  mobileMenuButton: document.getElementById("mobileMenuButton"),
  closeMobileMenu: document.getElementById("closeMobileMenu"),
  mobileSidebar: document.getElementById("mobileSidebar"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  mobileQuickAdd: document.getElementById("mobileQuickAdd"),

  darkModeToggle: document.getElementById("darkModeToggle"),
  darkModeToggleMobile: document.getElementById("darkModeToggleMobile"),

  notificationButton: document.getElementById("notificationButton"),

  addCategoryBtn: document.getElementById("addCategoryBtn"),
  addCategoryBtnMobile: document.getElementById("addCategoryBtnMobile"),

  desktopAllTasksCount: document.getElementById("desktopAllTasksCount"),
  allTasksCount: document.getElementById("allTasksCount"),
  desktopCompletedNavCount: document.getElementById("desktopCompletedNavCount"),
  completedNavCount: document.getElementById("completedNavCount")
};

/* =========================================================
   Initialization
========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {
  loadUserProfile();
  loadTasks();
  setupTheme();
  setupEventListeners();
  setMinimumDates();
  updateCurrentDate();
  render();

  if (!state.userName) {
    openWelcomeModal();
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* =========================================================
   Local Storage
========================================================= */

function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEYS.tasks);

    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks);

      if (Array.isArray(parsedTasks)) {
        state.tasks = parsedTasks.map(normalizeTask);

        const isLegacyDemo =
          !state.userName &&
          state.tasks.length > 0 &&
          state.tasks.every(task =>
            LEGACY_DEMO_TITLES.has(task.title)
          );

        if (isLegacyDemo) {
          state.tasks = [];
          saveTasks();
        }
      } else {
        state.tasks = [];
      }
    }

  } catch (error) {
    console.error("Unable to load Focusly tasks:", error);
    state.tasks = [];
    showToast(
      "Could not load saved tasks. Starting with an empty list.",
      "danger"
    );
  }

  loadCategories();
}

function loadUserProfile() {
  state.userName = (localStorage.getItem(STORAGE_KEYS.userName) || "").trim();
}

function saveUserProfile() {
  localStorage.setItem(STORAGE_KEYS.userName, state.userName);
}

function loadCategories() {
  let storedCategories = [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.categories);
    const parsed = stored ? JSON.parse(stored) : [];

    if (Array.isArray(parsed)) {
      storedCategories = parsed;
    }
  } catch (error) {
    console.error("Unable to load Focusly categories:", error);
  }

  state.categories = normalizeCategories([
    ...DEFAULT_CATEGORIES,
    ...storedCategories,
    ...state.tasks.map(task => task.category)
  ]);

  saveCategories();
}

function saveCategories() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.categories,
      JSON.stringify(state.categories)
    );
  } catch (error) {
    console.error("Unable to save Focusly categories:", error);
  }
}

function normalizeCategories(categories) {
  const uniqueCategories = [];
  const categoryKeys = new Set();

  categories.forEach(category => {
    const normalized = String(category || "").trim();
    const key = normalized.toLowerCase();

    if (normalized && !categoryKeys.has(key)) {
      categoryKeys.add(key);
      uniqueCategories.push(normalized);
    }
  });

  return uniqueCategories;
}

function saveTasks() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.tasks,
      JSON.stringify(state.tasks)
    );

    localStorage.setItem(
      STORAGE_KEYS.initialized,
      "true"
    );
  } catch (error) {
    console.error("Unable to save Focusly tasks:", error);

    showToast(
      "Your browser could not save the latest changes.",
      "danger"
    );
  }
}

function normalizeTask(task) {
  return {
    id: String(task.id || generateId()),
    title: String(task.title || ""),
    description: String(task.description || ""),
    dueDate: String(task.dueDate || ""),
    priority: ["Low", "Medium", "High"].includes(task.priority)
      ? task.priority
      : "Medium",
    category: String(task.category || "Personal"),
    completed: Boolean(task.completed),
    createdAt: Number(task.createdAt) || Date.now()
  };
}

/* =========================================================
   Theme
========================================================= */

function setupTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");

  localStorage.setItem(
    STORAGE_KEYS.theme,
    isDark ? "dark" : "light"
  );

  updateThemeIcons();
}

function updateThemeIcons() {
  const isDark = document.documentElement.classList.contains("dark");

  document.querySelectorAll(".theme-toggle").forEach(button => {
    const icon = button.querySelector("[data-lucide]");

    if (icon) {
      icon.setAttribute(
        "data-lucide",
        isDark ? "sun" : "moon"
      );
    }
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* =========================================================
   Event Listeners
========================================================= */

function setupEventListeners() {
  /* Task creation */
  elements.taskForm.addEventListener(
    "submit",
    handleAddTask
  );

  /* Search */
  elements.searchInput.addEventListener(
    "input",
    handleSearch
  );

  elements.searchInput.addEventListener(
    "focus",
    () => {
      if (elements.searchInput.value.trim()) {
        requestAnimationFrame(() => {
          renderSearchSuggestions();
        });
      }
    }
  );

  elements.searchInput.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitSearch();
      }
    }
  );

  elements.searchSubmitButton.addEventListener(
    "click",
    event => {
      event.stopPropagation();
      submitSearch();
    }
  );

  elements.searchSuggestions.addEventListener(
    "click",
    handleSearchSuggestionClick
  );

  elements.taskDueDate.addEventListener(
    "click",
    openDatePicker
  );

  elements.editTaskDueDate.addEventListener(
    "click",
    openDatePicker
  );

  document.addEventListener(
    "click",
    event => {
      if (!event.target.closest(".search-wrapper")) {
        elements.searchSuggestions.classList.add("hidden");
      }
    }
  );

  /* Filters */
  elements.filterGroup.addEventListener(
    "click",
    handleFilterClick
  );

  /* Task list event delegation */
  elements.taskList.addEventListener(
    "click",
    handleTaskListClick
  );

  /* Navigation event delegation */
  document.addEventListener(
    "click",
    handleNavigationClick
  );

  /* Clear completed */
  elements.clearCompletedButton.addEventListener(
    "click",
    clearCompletedTasks
  );

  /* Empty state */
  elements.emptyStateAddButton.addEventListener(
    "click",
    focusAddTask
  );

  /* First-use profile */
  elements.welcomeForm.addEventListener(
    "submit",
    handleWelcomeSubmit
  );

  /* Edit modal */
  elements.editTaskForm.addEventListener(
    "submit",
    handleEditTask
  );

  elements.closeEditModal.addEventListener(
    "click",
    closeEditModal
  );

  elements.cancelEditButton.addEventListener(
    "click",
    closeEditModal
  );

  elements.editModal.addEventListener(
    "click",
    event => {
      if (event.target === elements.editModal) {
        closeEditModal();
      }
    }
  );

  /* Delete modal */
  elements.closeDeleteModal.addEventListener(
    "click",
    closeDeleteModal
  );

  elements.cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
  );

  elements.confirmDeleteButton.addEventListener(
    "click",
    confirmDelete
  );

  elements.deleteModal.addEventListener(
    "click",
    event => {
      if (event.target === elements.deleteModal) {
        closeDeleteModal();
      }
    }
  );

  /* Mobile navigation */
  elements.mobileMenuButton.addEventListener(
    "click",
    openMobileMenu
  );

  elements.closeMobileMenu.addEventListener(
    "click",
    closeMobileMenu
  );

  elements.sidebarOverlay.addEventListener(
    "click",
    closeMobileMenu
  );

  elements.mobileQuickAdd.addEventListener(
    "click",
    focusAddTask
  );

  /* Theme */
  elements.darkModeToggle.addEventListener(
    "click",
    toggleTheme
  );

  elements.darkModeToggleMobile.addEventListener(
    "click",
    toggleTheme
  );

  /* Category buttons */
  elements.addCategoryBtn.addEventListener(
    "click",
    addCategory
  );

  elements.addCategoryBtnMobile.addEventListener(
    "click",
    addCategory
  );

  /* Keyboard */
  document.addEventListener(
    "keydown",
    handleKeyboard
  );

  /* Notifications */
  elements.notificationButton.addEventListener(
    "click",
    () => {
      showToast(
        "You're all caught up. No new notifications.",
        "info"
      );
    }
  );
}

/* =========================================================
   Add Task
========================================================= */

function handleAddTask(event) {
  event.preventDefault();

  clearFormErrors();

  const title = elements.taskTitle.value.trim();
  const description = elements.taskDescription.value.trim();
  const dueDate = elements.taskDueDate.value;
  const priority = elements.taskPriority.value;
  const category = elements.taskCategory.value;

  let valid = true;

  if (!title) {
    showFieldError(
      elements.titleError,
      elements.taskTitle,
      "Please enter a task title."
    );

    valid = false;
  }

  if (!dueDate) {
    showFieldError(
      elements.dueDateError,
      elements.taskDueDate,
      "Please choose a due date."
    );

    valid = false;
  }

  if (!valid) {
    const firstInvalid =
      document.querySelector(".form-input.error");

    firstInvalid?.focus();

    return;
  }

  const task = {
    id: generateId(),
    title,
    description,
    dueDate,
    priority,
    category,
    completed: false,
    createdAt: Date.now()
  };

  state.tasks.push(task);

  saveTasks();

  elements.taskForm.reset();

  elements.taskPriority.value = "Medium";
  elements.taskCategory.value = "Personal";

  setMinimumDates();

  state.filter = "all";
  state.view = "all";
  state.selectedCategory = null;

  updateFilterButtons();
  updateNavigation();

  render();

  showToast("Task added successfully.", "success");

  elements.taskTitle.focus();
}

/* =========================================================
   Task List
========================================================= */

function render() {
  renderUserProfile();
  renderCategories();
  renderStatistics();
  renderProgress();
  renderTaskList();
  updateNavigation();
  updateFilterButtons();
  updateThemeIcons();

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderUserProfile() {
  const displayName = state.userName || "there";
  const profileName = state.userName || "User";
  const initials = state.userName
    ? state.userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join("")
    : "?";

  elements.userName.textContent = displayName;
  elements.userAvatar.textContent = initials;
  elements.userAvatar.setAttribute(
    "aria-label",
    `${profileName} profile`
  );
  elements.userAvatar.title = profileName;
}

function renderCategories() {
  elements.categoryLists.forEach(list => {
    list.innerHTML = "";

    state.categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nav-item category-filter";
      button.dataset.category = category;

      const dot = document.createElement("span");
      dot.className = `category-dot ${getCategoryDotClass(category)}`;

      const label = document.createElement("span");
      label.textContent = category;

      button.appendChild(dot);
      button.appendChild(label);
      list.appendChild(button);
    });
  });

  elements.categorySelects.forEach(select => {
    const selectedCategory = select.value;
    select.innerHTML = "";

    state.categories.forEach(category => {
      select.appendChild(createOption(category));
    });

    select.value = state.categories.includes(selectedCategory)
      ? selectedCategory
      : state.categories[0];
  });
}

function renderTaskList() {
  const visibleTasks = getVisibleTasks();

  elements.taskList.innerHTML = "";

  if (!visibleTasks.length) {
    elements.emptyState.classList.remove("hidden");

    updateEmptyState();
    return;
  }

  elements.emptyState.classList.add("hidden");

  const fragment = document.createDocumentFragment();

  visibleTasks.forEach(task => {
    fragment.appendChild(createTaskCard(task));
  });

  elements.taskList.appendChild(fragment);
}

function createTaskCard(task) {
  const article = document.createElement("article");

  article.className =
    `task-card${task.completed ? " completed" : ""}`;

  article.dataset.taskId = task.id;

  const main = document.createElement("div");
  main.className = "task-main";

  const checkbox = document.createElement("button");
  checkbox.type = "button";
  checkbox.className =
    `task-checkbox${task.completed ? " checked" : ""}`;

  checkbox.dataset.action = "toggle";
  checkbox.dataset.taskId = task.id;

  checkbox.setAttribute(
    "aria-label",
    task.completed
      ? `Mark "${task.title}" as active`
      : `Complete "${task.title}"`
  );

  if (task.completed) {
    checkbox.innerHTML =
      '<i data-lucide="check"></i>';
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-description";

  if (task.description) {
    description.textContent = task.description;
  } else {
    description.textContent = "No description provided.";
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";

  meta.appendChild(
    createCategoryBadge(task.category)
  );

  meta.appendChild(
    createPriorityBadge(task.priority)
  );

  meta.appendChild(
    createDueDateElement(task)
  );

  main.appendChild(title);
  main.appendChild(description);
  main.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = document.createElement("button");

  editButton.type = "button";
  editButton.className = "task-action-button";
  editButton.dataset.action = "edit";
  editButton.dataset.taskId = task.id;
  editButton.setAttribute(
    "aria-label",
    `Edit "${task.title}"`
  );
  editButton.title = "Edit task";
  editButton.innerHTML =
    '<i data-lucide="pencil"></i>';

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.className =
    "task-action-button delete";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.taskId = task.id;
  deleteButton.setAttribute(
    "aria-label",
    `Delete "${task.title}"`
  );
  deleteButton.title = "Delete task";
  deleteButton.innerHTML =
    '<i data-lucide="trash-2"></i>';

  actions.appendChild(editButton);
  actions.appendChild(deleteButton);

  article.appendChild(checkbox);
  article.appendChild(main);
  article.appendChild(actions);

  return article;
}

function createCategoryBadge(category) {
  const badge = document.createElement("span");

  badge.className =
    "task-badge category-badge";

  const icon = document.createElement("i");

  icon.dataset.lucide = getCategoryIcon(category);

  badge.appendChild(icon);

  const text = document.createTextNode(category);

  badge.appendChild(text);

  return badge;
}

function createPriorityBadge(priority) {
  const badge = document.createElement("span");

  badge.className =
    `task-badge priority-${priority.toLowerCase()}`;

  const icon = document.createElement("i");

  icon.dataset.lucide =
    priority === "High"
      ? "chevron-up"
      : priority === "Medium"
        ? "minus"
        : "chevron-down";

  badge.appendChild(icon);

  badge.appendChild(
    document.createTextNode(priority)
  );

  return badge;
}

function createDueDateElement(task) {
  const wrapper = document.createElement("span");

  const status = getDueDateStatus(task.dueDate);

  wrapper.className =
    `due-date${status.className ? ` ${status.className}` : ""}`;

  const icon = document.createElement("i");

  icon.dataset.lucide =
    status.className === "overdue"
      ? "triangle-alert"
      : "calendar-days";

  wrapper.appendChild(icon);

  wrapper.appendChild(
    document.createTextNode(status.label)
  );

  return wrapper;
}

/* =========================================================
   Filtering / Views
========================================================= */

function getVisibleTasks() {
  let tasks = [...state.tasks];

  if (state.view === "today") {
    tasks = tasks.filter(
      task => task.dueDate === getTodayString()
    );
  }

  if (state.view === "upcoming") {
    const today = getTodayString();

    tasks = tasks.filter(
      task => task.dueDate > today
    );
  }

  if (state.view === "completed") {
    tasks = tasks.filter(task => task.completed);
  }

  if (state.selectedCategory) {
    tasks = tasks.filter(
      task => task.category === state.selectedCategory
    );
  }

  switch (state.filter) {
    case "active":
      tasks = tasks.filter(task => !task.completed);
      break;

    case "completed":
      tasks = tasks.filter(task => task.completed);
      break;

    case "high":
      tasks = tasks.filter(
        task => task.priority === "High"
      );
      break;

    case "today":
      tasks = tasks.filter(
        task => task.dueDate === getTodayString()
      );
      break;

    default:
      break;
  }

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();

    tasks = tasks.filter(task => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    });
  }

  return tasks.sort(sortTasks);
}

function sortTasks(a, b) {
  /*
   * Active tasks come before completed tasks.
   * Within each group:
   * 1. Higher priority
   * 2. Earlier due date
   * 3. Newer task
   */

  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }

  const priorityDifference =
    PRIORITY_WEIGHT[a.priority] -
    PRIORITY_WEIGHT[b.priority];

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const dateDifference =
    parseDateValue(a.dueDate) -
    parseDateValue(b.dueDate);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return b.createdAt - a.createdAt;
}

function handleFilterClick(event) {
  const button =
    event.target.closest("[data-filter]");

  if (!button) {
    return;
  }

  state.filter = button.dataset.filter;

  render();
}

function handleSearch(event) {
  state.searchQuery =
    event.target.value.trim();

  renderSearchSuggestions();
  renderTaskList();
  updateFilterButtons();

  if (window.lucide) {
    lucide.createIcons();
  }
}

function submitSearch() {
  state.searchQuery = elements.searchInput.value.trim();
  renderSearchSuggestions();
  renderTaskList();
  updateNavigation();
  updateFilterButtons();

  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderSearchSuggestions() {
  const query = elements.searchInput.value.trim().toLowerCase();
  elements.searchSuggestions.innerHTML = "";

  if (!query) {
    elements.searchSuggestions.classList.add("hidden");
    return;
  }

  const matches = state.tasks
    .filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    )
    .sort(sortTasks)
    .slice(0, 6);

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "search-suggestion-empty";
    empty.textContent = "No matching tasks";
    elements.searchSuggestions.appendChild(empty);
  } else {
    matches.forEach(task => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-suggestion";
      button.dataset.taskId = task.id;
      button.setAttribute("role", "option");

      const title = document.createElement("strong");
      title.textContent = task.title;

      const description = document.createElement("span");
      description.textContent = task.description || "No description provided.";

      button.appendChild(title);
      button.appendChild(description);
      elements.searchSuggestions.appendChild(button);
    });
  }

  elements.searchSuggestions.classList.remove("hidden");
}

function handleSearchSuggestionClick(event) {
  const suggestion = event.target.closest("[data-task-id]");

  if (!suggestion) {
    return;
  }

  const task = state.tasks.find(item =>
    item.id === suggestion.dataset.taskId
  );

  if (!task) {
    return;
  }

  state.view = "all";
  state.filter = "all";
  state.selectedCategory = null;
  state.searchQuery = task.title;
  elements.searchInput.value = task.title;
  renderSearchSuggestions();
  render();

  requestAnimationFrame(() => {
    const card = document.querySelector(
      `article.task-card[data-task-id="${CSS.escape(task.id)}"]`
    );

    card?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
}

function handleNavigationClick(event) {
  const viewButton =
    event.target.closest("[data-view]");

  if (viewButton) {
    state.view = viewButton.dataset.view;
    state.selectedCategory = null;
    state.filter = "all";

    closeMobileMenu();
    render();
    scrollToTaskList();

    return;
  }

  const categoryButton =
    event.target.closest(".category-filter");

  if (categoryButton) {
    state.selectedCategory =
      categoryButton.dataset.category;

    state.view = "all";
    state.filter = "all";

    closeMobileMenu();
    render();
    scrollToTaskList();
  }
}

function scrollToTaskList() {
  elements.taskListSection?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  requestAnimationFrame(() => {
    document.getElementById("taskListHeading")?.focus({
      preventScroll: true
    });
  });
}

function updateFilterButtons() {
  document
    .querySelectorAll(".filter-button")
    .forEach(button => {
      const isActive =
        button.dataset.filter === state.filter;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });
}

function updateNavigation() {
  document
    .querySelectorAll("[data-view]")
    .forEach(button => {
      const active =
        button.dataset.view === state.view &&
        !state.selectedCategory;

      button.classList.toggle(
        "active",
        active
      );
    });

  document
    .querySelectorAll(".category-filter")
    .forEach(button => {
      const active =
        button.dataset.category ===
        state.selectedCategory;

      button.classList.toggle(
        "active",
        active
      );
    });

  const total = state.tasks.length;

  const completed =
    state.tasks.filter(task => task.completed).length;

  elements.desktopAllTasksCount.textContent = total;
  elements.allTasksCount.textContent = total;

  elements.desktopCompletedNavCount.textContent =
    completed;

  elements.completedNavCount.textContent =
    completed;

  const viewLabels = {
    all: "All tasks",
    today: "Today's tasks",
    upcoming: "Upcoming tasks",
    completed: "Completed tasks"
  };

  let title =
    state.selectedCategory ||
    viewLabels[state.view] ||
    "All tasks";

  elements.taskListTitle.textContent = title;

  if (state.searchQuery) {
    elements.taskListSubtitle.textContent =
      `Showing results for "${state.searchQuery}".`;
  } else if (state.selectedCategory) {
    elements.taskListSubtitle.textContent =
      `Tasks organized under the ${state.selectedCategory} category.`;
  } else {
    elements.taskListSubtitle.textContent =
      "Keep your priorities clear and your momentum strong.";
  }
}

/* =========================================================
   Statistics / Progress
========================================================= */

function renderStatistics() {
  const total = state.tasks.length;

  const completed =
    state.tasks.filter(task => task.completed).length;

  const pending = total - completed;

  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  elements.totalTasks.textContent = total;
  elements.completedTasks.textContent = completed;
  elements.pendingTasks.textContent = pending;
  elements.completionPercentage.textContent =
    `${percentage}%`;
}

function renderProgress() {
  const total = state.tasks.length;

  const completed =
    state.tasks.filter(task => task.completed).length;

  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  elements.progressBar.style.width =
    `${percentage}%`;

  elements.progressBar
    .parentElement
    .setAttribute(
      "aria-valuenow",
      String(percentage)
    );

  elements.progressPercentageBadge.textContent =
    `${percentage}%`;

  elements.progressText.textContent =
    `${completed} of ${total} task${total === 1 ? "" : "s"} completed`;

  elements.clearCompletedButton.disabled =
    completed === 0;
}

/* =========================================================
   Task Actions
========================================================= */

function handleTaskListClick(event) {
  const actionButton =
    event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const taskId =
    actionButton.dataset.taskId;

  const action =
    actionButton.dataset.action;

  if (!taskId) {
    return;
  }

  switch (action) {
    case "toggle":
      toggleTask(taskId);
      break;

    case "edit":
      openEditModal(taskId);
      break;

    case "delete":
      openDeleteModal(taskId);
      break;

    default:
      break;
  }
}

function toggleTask(taskId) {
  const task =
    state.tasks.find(item => item.id === taskId);

  if (!task) {
    return;
  }

  task.completed = !task.completed;

  saveTasks();
  render();

  if (task.completed) {
    showToast(
      "Task completed. Nice work!",
      "success"
    );
  }
}

function clearCompletedTasks() {
  const completedCount =
    state.tasks.filter(task => task.completed).length;

  if (completedCount === 0) {
    return;
  }

  const confirmed =
    window.confirm(
      `Clear ${completedCount} completed task${completedCount === 1 ? "" : "s"}?`
    );

  if (!confirmed) {
    return;
  }

  state.tasks =
    state.tasks.filter(task => !task.completed);

  saveTasks();
  render();

  showToast(
    `${completedCount} completed task${completedCount === 1 ? "" : "s"} cleared.`,
    "success"
  );
}

/* =========================================================
   Edit Task
========================================================= */

function openEditModal(taskId) {
  const task =
    state.tasks.find(item => item.id === taskId);

  if (!task) {
    return;
  }

  state.editingTaskId = taskId;
  state.lastFocusedElement =
    document.activeElement;

  elements.editTaskId.value = task.id;
  elements.editTaskTitle.value = task.title;
  elements.editTaskDescription.value =
    task.description;
  elements.editTaskDueDate.value =
    task.dueDate;
  elements.editTaskPriority.value =
    task.priority;
  elements.editTaskCategory.value =
    task.category;

  clearEditFormErrors();

  openModal(elements.editModal);

  requestAnimationFrame(() => {
    elements.editTaskTitle.focus();
  });
}

function handleEditTask(event) {
  event.preventDefault();

  clearEditFormErrors();

  const taskId =
    elements.editTaskId.value;

  const task =
    state.tasks.find(item => item.id === taskId);

  if (!task) {
    closeEditModal();
    return;
  }

  const title =
    elements.editTaskTitle.value.trim();

  const description =
    elements.editTaskDescription.value.trim();

  const dueDate =
    elements.editTaskDueDate.value;

  const priority =
    elements.editTaskPriority.value;

  const category =
    elements.editTaskCategory.value;

  let valid = true;

  if (!title) {
    showFieldError(
      elements.editTitleError,
      elements.editTaskTitle,
      "Please enter a task title."
    );

    valid = false;
  }

  if (!dueDate) {
    showFieldError(
      elements.editDateError,
      elements.editTaskDueDate,
      "Please choose a due date."
    );

    valid = false;
  }

  if (!valid) {
    const firstInvalid =
      elements.editModal.querySelector(
        ".form-input.error"
      );

    firstInvalid?.focus();

    return;
  }

  task.title = title;
  task.description = description;
  task.dueDate = dueDate;
  task.priority = priority;
  task.category = category;

  saveTasks();
  closeEditModal();
  render();

  showToast(
    "Task updated successfully.",
    "success"
  );
}

function closeEditModal() {
  elements.editModal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");

  state.editingTaskId = null;

  restoreFocus();
}

function clearEditFormErrors() {
  elements.editTitleError.textContent = "";
  elements.editDateError.textContent = "";

  elements.editTitleError.classList.add("hidden");
  elements.editDateError.classList.add("hidden");

  elements.editTaskTitle.classList.remove("error");
  elements.editTaskDueDate.classList.remove("error");
}

/* =========================================================
   Delete Task
========================================================= */

function openDeleteModal(taskId) {
  const task =
    state.tasks.find(item => item.id === taskId);

  if (!task) {
    return;
  }

  state.deletingTaskId = taskId;
  state.lastFocusedElement =
    document.activeElement;

  elements.deleteTaskName.textContent =
    task.title;

  openModal(elements.deleteModal);

  requestAnimationFrame(() => {
    elements.cancelDeleteButton.focus();
  });
}

function confirmDelete() {
  if (!state.deletingTaskId) {
    return;
  }

  const task =
    state.tasks.find(
      item => item.id === state.deletingTaskId
    );

  if (!task) {
    closeDeleteModal();
    return;
  }

  const taskTitle = task.title;

  state.tasks =
    state.tasks.filter(
      item => item.id !== state.deletingTaskId
    );

  saveTasks();
  closeDeleteModal();
  render();

  showToast(
    `"${taskTitle}" was deleted.`,
    "danger"
  );
}

function closeDeleteModal() {
  elements.deleteModal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");

  state.deletingTaskId = null;

  restoreFocus();
}

/* =========================================================
   Modal Helpers
========================================================= */

function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function restoreFocus() {
  const element = state.lastFocusedElement;

  if (
    element &&
    typeof element.focus === "function" &&
    document.contains(element)
  ) {
    element.focus();
  }

  state.lastFocusedElement = null;
}

function handleKeyboard(event) {
  /* Escape closes active modal */
  if (event.key === "Escape") {
    if (!elements.editModal.classList.contains("hidden")) {
      closeEditModal();
      return;
    }

    if (!elements.deleteModal.classList.contains("hidden")) {
      closeDeleteModal();
      return;
    }

    if (elements.mobileSidebar.classList.contains("open")) {
      closeMobileMenu();
      return;
    }
  }

  /* "/" focuses search */
  if (
    event.key === "/" &&
    !isTypingTarget(event.target)
  ) {
    event.preventDefault();
    elements.searchInput.focus();
  }

  /* Tab focus trap */
  const activeModal =
    !elements.welcomeModal.classList.contains("hidden")
      ? elements.welcomeModal
      : !elements.editModal.classList.contains("hidden")
      ? elements.editModal
      : !elements.deleteModal.classList.contains("hidden")
        ? elements.deleteModal
        : null;

  if (
    activeModal &&
    event.key === "Tab"
  ) {
    trapFocus(event, activeModal);
  }
}

function trapFocus(event, container) {
  const focusableElements =
    container.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );

  const focusable =
    Array.from(focusableElements);

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last =
    focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    document.activeElement === last
  ) {
    event.preventDefault();
    first.focus();
  }
}

/* =========================================================
   Mobile Menu
========================================================= */

function openMobileMenu() {
  elements.mobileSidebar.classList.add("open");
  elements.sidebarOverlay.classList.add("visible");

  elements.mobileMenuButton.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.classList.add("overflow-hidden");

  requestAnimationFrame(() => {
    elements.closeMobileMenu.focus();
  });
}

function closeMobileMenu() {
  elements.mobileSidebar.classList.remove("open");
  elements.sidebarOverlay.classList.remove("visible");

  elements.mobileMenuButton.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.classList.remove("overflow-hidden");
}

/* =========================================================
   Categories
========================================================= */

function addCategory() {
  const category =
    window.prompt(
      "Enter a new category name:"
    );

  if (!category) {
    return;
  }

  const normalized =
    category.trim();

  if (!normalized) {
    return;
  }

  if (state.categories.some(category =>
    category.toLowerCase() === normalized.toLowerCase()
  )) {
    showToast(
      "That category already exists.",
      "info"
    );

    return;
  }

  /*
   * Since categories are stored directly on tasks,
   * dynamically created categories can be used for
   * future tasks and remain valid after reload.
   */
  state.categories.push(normalized);
  saveCategories();
  renderCategories();

  elements.taskCategory.value =
    normalized;
  elements.editTaskCategory.value =
    normalized;

  showToast(
    `${normalized} category added.`,
    "success"
  );
}

function createOption(value) {
  const option =
    document.createElement("option");

  option.value = value;
  option.textContent = value;

  return option;
}

function getCategoryDotClass(category) {
  const colors = {
    Personal: "bg-violet-500",
    Work: "bg-blue-500",
    Study: "bg-emerald-500"
  };

  return colors[category] || "category-dot-custom";
}

/* =========================================================
   Empty State
========================================================= */

function updateEmptyState() {
  if (state.searchQuery) {
    elements.emptyStateTitle.textContent =
      "No matching tasks";

    elements.emptyStateText.textContent =
      `No tasks match "${state.searchQuery}". Try another search.`;

    elements.emptyStateAddButton.classList.add(
      "hidden"
    );

    return;
  }

  if (
    state.filter !== "all" ||
    state.view !== "all" ||
    state.selectedCategory
  ) {
    elements.emptyStateTitle.textContent =
      "Nothing here yet";

    elements.emptyStateText.textContent =
      "There are no tasks matching the current view or filters.";

    elements.emptyStateAddButton.classList.remove(
      "hidden"
    );

    return;
  }

  elements.emptyStateTitle.textContent =
    "Your task list is empty";

  elements.emptyStateText.textContent =
    "Add your first task and start making progress.";

  elements.emptyStateAddButton.classList.remove(
    "hidden"
  );
}

/* =========================================================
   Validation
========================================================= */

function clearFormErrors() {
  elements.titleError.textContent = "";
  elements.dueDateError.textContent = "";

  elements.titleError.classList.add("hidden");
  elements.dueDateError.classList.add("hidden");

  elements.taskTitle.classList.remove("error");
  elements.taskDueDate.classList.remove("error");
}

function showFieldError(
  errorElement,
  inputElement,
  message
) {
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");

  inputElement.classList.add("error");
}

function openWelcomeModal() {
  elements.welcomeModal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");

  requestAnimationFrame(() => {
    elements.userNameInput.focus();
  });
}

function handleWelcomeSubmit(event) {
  event.preventDefault();

  const name = elements.userNameInput.value.trim();

  if (!name) {
    showFieldError(
      elements.userNameError,
      elements.userNameInput,
      "Please enter your name."
    );

    elements.userNameInput.focus();
    return;
  }

  state.userName = name;
  saveUserProfile();

  elements.userNameError.textContent = "";
  elements.userNameError.classList.add("hidden");
  elements.userNameInput.classList.remove("error");
  elements.welcomeModal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");

  render();
  showToast(`Welcome to Focusly, ${name}.`, "success");
  elements.taskTitle.focus();
}

function openDatePicker(event) {
  const input = event.currentTarget;

  if (typeof input.showPicker !== "function") {
    return;
  }

  try {
    input.showPicker();
  } catch (error) {
    // The browser may already have opened its native picker.
  }
}

/* =========================================================
   Date Helpers
========================================================= */

function setMinimumDates() {
  const today = getTodayString();

  elements.taskDueDate.min = today;
}

function updateCurrentDate() {
  const now = new Date();

  elements.currentDate.textContent =
    new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    ).format(now);
}

function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month =
    String(now.getMonth() + 1).padStart(2, "0");
  const day =
    String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(dateString) {
  if (!dateString) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).getTime();
}

function getDueDateStatus(dateString) {
  if (!dateString) {
    return {
      label: "No due date",
      className: ""
    };
  }

  const today = getTodayString();

  if (dateString < today) {
    return {
      label: `Overdue · ${formatFriendlyDate(dateString)}`,
      className: "overdue"
    };
  }

  if (dateString === today) {
    return {
      label: "Due today",
      className: "today"
    };
  }

  return {
    label: formatFriendlyDate(dateString),
    className: ""
  };
}

function formatFriendlyDate(dateString) {
  const timestamp =
    parseDateValue(dateString);

  if (!Number.isFinite(timestamp)) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(new Date(timestamp));
}

/* =========================================================
   Utility
========================================================= */

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function getCategoryIcon(category) {
  const icons = {
    Personal: "user-round",
    Work: "briefcase-business",
    Study: "book-open"
  };

  return icons[category] || "folder";
}

function isTypingTarget(element) {
  if (!element) {
    return false;
  }

  const tagName =
    element.tagName?.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
}

function focusAddTask() {
  closeMobileMenu();

  document
    .getElementById("addTaskSection")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  setTimeout(() => {
    elements.taskTitle.focus();
  }, 250);
}

/* =========================================================
   Toast Notifications
========================================================= */

function showToast(message, type = "success") {
  const toast =
    document.createElement("div");

  toast.className =
    `toast ${type}`;

  const iconWrapper =
    document.createElement("div");

  iconWrapper.className =
    "toast-icon";

  const icon =
    document.createElement("i");

  icon.dataset.lucide =
    type === "success"
      ? "check"
      : type === "danger"
        ? "trash-2"
        : "info";

  iconWrapper.appendChild(icon);

  const messageElement =
    document.createElement("p");

  messageElement.className =
    "toast-message";

  messageElement.textContent =
    message;

  toast.appendChild(iconWrapper);
  toast.appendChild(messageElement);

  elements.toastContainer.appendChild(toast);

  if (window.lucide) {
    lucide.createIcons();
  }

  const timeout =
    setTimeout(() => {
      removeToast(toast);
    }, 3500);

  toast.addEventListener("click", () => {
    clearTimeout(timeout);
    removeToast(toast);
  });
}

function removeToast(toast) {
  if (!toast.isConnected) {
    return;
  }

  toast.classList.add("removing");

  setTimeout(() => {
    toast.remove();
  }, 200);
}

/* =========================================================
   Prevent Accidental Data Loss
========================================================= */

window.addEventListener("beforeunload", () => {
  /*
   * State is persisted after every mutation,
   * so no additional save is necessary here.
   */
});