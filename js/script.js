/* ============================================================
   LIFE DASHBOARD – script.js
   Vanilla JS · No frameworks · No backend
   Features:
     ✔ Digital clock & date
     ✔ Greeting by time
     ✔ Pomodoro focus timer (25 min, Start/Stop/Reset)
     ✔ To-Do List (add/edit/complete/delete) + LocalStorage
     ✔ Prevent duplicate tasks
     ✔ Quick Links (add/delete) + LocalStorage
     ✔ Light/Dark mode toggle
     ✔ Custom name in greeting
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, '0');

/* ============================================================
   1. CLOCK & DATE
   ============================================================ */
function updateClock() {
  const now  = new Date();
  const h    = pad(now.getHours());
  const m    = pad(now.getMinutes());
  const s    = pad(now.getSeconds());

  $('clock').textContent = `${h}:${m}:${s}`;

  const days  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];

  const dayName = days[now.getDay()];
  const date    = now.getDate();
  const month   = months[now.getMonth()];
  const year    = now.getFullYear();

  $('date-display').textContent = `${dayName}, ${date} ${month} ${year}`;
  $('footer-year').textContent  = year;
}

setInterval(updateClock, 1000);
updateClock(); // immediate first call

/* ============================================================
   2. GREETING + CUSTOM NAME
   ============================================================ */
const LS_NAME = 'dashboard_name';

function getGreetingWord() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return 'Selamat Pagi';
  if (hour >= 12 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
}

function renderGreeting() {
  const name = localStorage.getItem(LS_NAME) || '';
  const word = getGreetingWord();
  $('greeting').textContent = name ? `${word}, ${name}! 👋` : `${word}! 👋`;
}

function initGreeting() {
  const saved = localStorage.getItem(LS_NAME) || '';
  $('name-input').value = saved;
  renderGreeting();

  $('save-name-btn').addEventListener('click', () => {
    const val = $('name-input').value.trim();
    if (val) {
      localStorage.setItem(LS_NAME, val);
    } else {
      localStorage.removeItem(LS_NAME);
    }
    renderGreeting();
    showNameFeedback();
  });

  $('name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('save-name-btn').click();
  });
}

function showNameFeedback() {
  const btn = $('save-name-btn');
  const orig = btn.textContent;
  btn.textContent = '✓ Tersimpan';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.disabled = false;
  }, 1500);
}

// Refresh greeting text each minute so "Selamat Pagi/Siang/…" stays accurate
setInterval(renderGreeting, 60_000);

/* ============================================================
   3. LIGHT / DARK MODE
   ============================================================ */
const LS_THEME = 'dashboard_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(LS_THEME, theme);
}

function initTheme() {
  const saved  = localStorage.getItem(LS_THEME);
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || prefer);

  $('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

/* ============================================================
   4. POMODORO FOCUS TIMER
   ============================================================ */
const POMODORO_SECONDS = 25 * 60; // 25 minutes

let timerInterval  = null;
let timeLeft       = POMODORO_SECONDS;
let timerRunning   = false;

function formatTime(secs) {
  return `${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
}

function updateTimerDisplay() {
  const el = $('timer-display');
  el.textContent = formatTime(timeLeft);

  el.classList.remove('running', 'finished');
  if (timerRunning)        el.classList.add('running');
  if (timeLeft === 0)      el.classList.add('finished');
}

function timerTick() {
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    timerInterval  = null;
    timerRunning   = false;
    timeLeft       = 0;
    updateTimerDisplay();
    $('timer-label').textContent = '🎉 Waktu habis! Istirahat sebentar.';
    notifyTimerDone();
    return;
  }
  timeLeft--;
  updateTimerDisplay();
}

function notifyTimerDone() {
  // Web Notifications (if permitted)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Life Dashboard', {
      body: '⏱ Sesi Pomodoro selesai! Waktunya istirahat.',
      icon: ''
    });
  }
  // Fallback: alert if tab not visible
  if (document.hidden) {
    alert('⏱ Sesi Pomodoro selesai! Waktunya istirahat.');
  }
}

function initPomodoro() {
  updateTimerDisplay();

  $('start-btn').addEventListener('click', () => {
    if (timerRunning || timeLeft === 0) return;
    timerRunning = true;
    $('timer-label').textContent = '⚡ Fokus! Jangan terganggu.';
    timerInterval = setInterval(timerTick, 1000);
    updateTimerDisplay();
    // Request notification permission on first start
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  });

  $('stop-btn').addEventListener('click', () => {
    if (!timerRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning  = false;
    $('timer-label').textContent = '⏸ Dijeda.';
    updateTimerDisplay();
  });

  $('reset-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning  = false;
    timeLeft      = POMODORO_SECONDS;
    $('timer-label').textContent = 'Pomodoro · 25 menit';
    updateTimerDisplay();
  });
}

/* ============================================================
   5. TO-DO LIST
   ============================================================ */
const LS_TODOS = 'dashboard_todos';

let todos = [];
let editingId = null;

/* -- Storage helpers -- */
function loadTodos()  { todos = JSON.parse(localStorage.getItem(LS_TODOS) || '[]'); }
function saveTodos()  { localStorage.setItem(LS_TODOS, JSON.stringify(todos)); }
function genId()      { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* -- Duplicate check (case-insensitive, trimmed) -- */
function isDuplicate(text, excludeId = null) {
  const normalized = text.trim().toLowerCase();
  return todos.some(t => t.text.trim().toLowerCase() === normalized && t.id !== excludeId);
}

/* -- Render -- */
function renderTodos() {
  const list = $('todo-list');
  list.innerHTML = '';

  if (todos.length === 0) {
    list.innerHTML = '<li class="empty-state" style="text-align:center;color:var(--text-muted);padding:24px 0;font-size:.9rem;">Belum ada tugas. Yuk tambahkan! 🚀</li>';
    $('todo-footer').innerHTML = '';
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' completed' : '');
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input
        type="checkbox"
        class="todo-checkbox"
        ${todo.done ? 'checked' : ''}
        aria-label="Tandai selesai: ${escapeHtml(todo.text)}"
      />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="todo-edit-btn"   aria-label="Edit tugas">✏ Edit</button>
        <button class="todo-delete-btn" aria-label="Hapus tugas">🗑</button>
      </div>
    `;

    // Events
    li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
    li.querySelector('.todo-edit-btn').addEventListener('click', () => openEditModal(todo.id));
    li.querySelector('.todo-delete-btn').addEventListener('click', () => deleteTodo(todo.id));

    list.appendChild(li);
  });

  renderTodoFooter();
}

function renderTodoFooter() {
  const total     = todos.length;
  const completed = todos.filter(t => t.done).length;
  const footer    = $('todo-footer');

  let html = `<span>${completed} dari ${total} selesai</span>`;

  if (completed > 0) {
    html += `<button class="clear-completed-btn" aria-label="Hapus semua tugas selesai">Hapus selesai (${completed})</button>`;
  }

  footer.innerHTML = html;

  footer.querySelector('.clear-completed-btn')?.addEventListener('click', clearCompleted);
}

/* -- Actions -- */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (isDuplicate(trimmed)) {
    showDuplicateMsg(`⚠ Tugas "${trimmed}" sudah ada!`);
    return;
  }

  clearDuplicateMsg();
  todos.unshift({ id: genId(), text: trimmed, done: false, createdAt: Date.now() });
  saveTodos();
  renderTodos();
  $('todo-input').value = '';
  $('todo-input').focus();
}

function toggleTodo(id) {
  const t = todos.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTodos(); renderTodos(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter(t => !t.done);
  saveTodos();
  renderTodos();
}

/* -- Duplicate message -- */
let dupTimer = null;
function showDuplicateMsg(msg) {
  const el = $('duplicate-msg');
  el.textContent = msg;
  clearTimeout(dupTimer);
  dupTimer = setTimeout(clearDuplicateMsg, 3000);
}
function clearDuplicateMsg() {
  $('duplicate-msg').textContent = '';
}

/* -- Edit Modal -- */
function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editingId = id;
  $('edit-input').value = todo.text;
  $('edit-modal').hidden = false;
  $('edit-input').focus();
  clearDuplicateMsg();
}

function closeEditModal() {
  $('edit-modal').hidden = true;
  editingId = null;
}

function saveEdit() {
  if (editingId === null) return;
  const newText = $('edit-input').value.trim();

  if (!newText) return;

  if (isDuplicate(newText, editingId)) {
    // Show warning inside modal context – reuse same element (visible outside, but okay)
    $('duplicate-msg').textContent = `⚠ Tugas "${newText}" sudah ada!`;
    clearTimeout(dupTimer);
    dupTimer = setTimeout(clearDuplicateMsg, 3000);
    return;
  }

  const todo = todos.find(t => t.id === editingId);
  if (todo) {
    todo.text = newText;
    saveTodos();
    renderTodos();
  }
  clearDuplicateMsg();
  closeEditModal();
}

/* -- Init Todo -- */
function initTodos() {
  loadTodos();
  renderTodos();

  $('add-todo-btn').addEventListener('click', () => addTodo($('todo-input').value));

  $('todo-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo($('todo-input').value);
  });

  $('modal-save-btn').addEventListener('click', saveEdit);

  $('modal-cancel-btn').addEventListener('click', closeEditModal);

  $('edit-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  saveEdit();
    if (e.key === 'Escape') closeEditModal();
  });

  // Close modal on overlay click
  $('edit-modal').addEventListener('click', (e) => {
    if (e.target === $('edit-modal')) closeEditModal();
  });
}

/* ============================================================
   6. QUICK LINKS
   ============================================================ */
const LS_LINKS = 'dashboard_links';

let links = [];

function loadLinks() { links = JSON.parse(localStorage.getItem(LS_LINKS) || '[]'); }
function saveLinks() { localStorage.setItem(LS_LINKS, JSON.stringify(links)); }

function normalizeUrl(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

function renderLinks() {
  const list = $('links-list');
  list.innerHTML = '';

  if (links.length === 0) {
    list.innerHTML = '<li style="color:var(--text-muted);font-size:.85rem;padding:4px 0;">Belum ada link. Tambahkan sekarang!</li>';
    return;
  }

  links.forEach(link => {
    const li = document.createElement('li');
    li.className = 'link-item';
    li.innerHTML = `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(link.url)}">
        🔗 ${escapeHtml(link.name)}
      </a>
      <button class="link-delete-btn" aria-label="Hapus link ${escapeHtml(link.name)}">✕</button>
    `;
    li.querySelector('.link-delete-btn').addEventListener('click', () => deleteLink(link.id));
    list.appendChild(li);
  });
}

function addLink() {
  const name = $('link-name-input').value.trim();
  const url  = normalizeUrl($('link-url-input').value);

  if (!name) { $('link-name-input').focus(); return; }
  if (!isValidUrl(url)) { $('link-url-input').focus(); return; }

  links.push({ id: genId(), name, url });
  saveLinks();
  renderLinks();
  $('link-name-input').value = '';
  $('link-url-input').value  = '';
  $('link-name-input').focus();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

function isValidUrl(str) {
  try { new URL(str); return true; }
  catch { return false; }
}

function initLinks() {
  loadLinks();
  renderLinks();

  $('add-link-btn').addEventListener('click', addLink);

  $('link-url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });

  $('link-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('link-url-input').focus();
  });
}

/* ============================================================
   SECURITY HELPER – HTML escaping
   ============================================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ============================================================
   BOOTSTRAP – run everything on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGreeting();
  initPomodoro();
  initTodos();
  initLinks();
});
