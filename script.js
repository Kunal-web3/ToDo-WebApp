// ----- State & Persistence -----
const storageKey = "modern_todo_tasks_v1";
let tasks = [];

function load() {
  try {
    tasks = JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    tasks = [];
  }
}
function save() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

// ----- DOM -----
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

// Edit dialog
const editDialog = document.getElementById("editDialog");
const editInput = document.getElementById("editInput");
const saveEditBtn = document.getElementById("saveEditBtn");
let editId = null;

// ----- Utils -----
const uid = () => Math.random().toString(36).slice(2, 10);
const dt = (d) =>
  new Date(d).toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });

// ----- Actions -----
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({
    id: uid(),
    text,
    completed: false,
    createdAt: Date.now(),
    completedAt: null,
  });
  taskInput.value = "";
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  t.completedAt = t.completed ? Date.now() : null;
  save();
  render();
}

function removeTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function openEdit(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  editId = id;
  editInput.value = t.text;
  editDialog.showModal();
}

function commitEdit() {
  const text = editInput.value.trim();
  if (!text || !editId) return;
  const t = tasks.find((x) => x.id === editId);
  if (t) t.text = text;
  editId = null;
  save();
  render();
}

// ----- Render -----
function taskItem(t) {
  const wrap = document.createElement("div");
  wrap.className = `task ${t.completed ? "done" : ""}`;

  // checkbox
  const cb = document.createElement("button");
  cb.className = `checkbox ${t.completed ? "done" : ""}`;
  cb.setAttribute("aria-label", "Toggle complete");
  cb.innerHTML = t.completed ? "✓" : "";
  cb.addEventListener("click", () => toggleTask(t.id));

  // content
  const content = document.createElement("div");
  content.className = "content";

  const titleLine = document.createElement("div");
  titleLine.className = "title-line";
  const text = document.createElement("div");
  text.className = "text";
  text.textContent = t.text;
  titleLine.appendChild(text);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = t.completed
    ? `Completed • ${dt(t.completedAt)}`
    : `Added • ${dt(t.createdAt)}`;

  content.appendChild(titleLine);
  content.appendChild(meta);

  // actions
  const actions = document.createElement("div");
  actions.className = "actions";
  const editBtn = document.createElement("button");
  editBtn.className = "btn icon edit";
  editBtn.textContent = "✏";
  editBtn.title = "Edit";
  editBtn.addEventListener("click", () => openEdit(t.id));

  const delBtn = document.createElement("button");
  delBtn.className = "btn icon delete";
  delBtn.textContent = "🗑";
  delBtn.title = "Delete";
  delBtn.addEventListener("click", () => removeTask(t.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  wrap.appendChild(cb);
  wrap.appendChild(content);
  wrap.appendChild(actions);
  return wrap;
}

function render() {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  if (pending.length === 0) {
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.style.padding = "10px 12px";
    empty.textContent = "No pending tasks 🎉";
    pendingList.appendChild(empty);
  } else {
    pending.forEach((t) => pendingList.appendChild(taskItem(t)));
  }

  if (completed.length === 0) {
    const empty = document.createElement("div");
    empty.className = "meta";
    empty.style.padding = "10px 12px";
    empty.textContent = "No completed tasks yet ✅";
    completedList.appendChild(empty);
  } else {
    completed.forEach((t) => completedList.appendChild(taskItem(t)));
  }

  pendingCount.textContent = pending.length;
  completedCount.textContent = completed.length;
}

// ----- Events -----
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

saveEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  commitEdit();
  editDialog.close();
});
editDialog.addEventListener("close", () => (editId = null));

// ----- Init -----
load();
render();
