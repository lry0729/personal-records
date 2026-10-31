// Tab switching
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Utils
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== Diary ====================
const diaryList = document.getElementById('diary-list');
const diaryForm = document.getElementById('diary-form');

function renderDiary() {
  const items = load('diary').sort((a, b) => b.date - a.date);
  diaryList.innerHTML = items.length === 0
    ? '<p style="color:var(--text-muted);text-align:center;">还没有日记，写一篇吧～</p>'
    : items.map(item => `
      <div class="item" data-id="${item.id}">
        <h3>${escapeHtml(item.title)}</h3>
        <div class="content">${escapeHtml(item.content)}</div>
        <div class="meta">${new Date(item.date).toLocaleString('zh-CN')}</div>
        <div class="actions">
          <button class="btn-small btn-danger" onclick="deleteDiary('${item.id}')">删除</button>
        </div>
      </div>
    `).join('');
}

diaryForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('diary-title').value.trim();
  const content = document.getElementById('diary-content').value.trim();
  if (!title || !content) return;
  const items = load('diary');
  items.push({ id: uid(), title, content, date: Date.now() });
  save('diary', items);
  diaryForm.reset();
  renderDiary();
});

window.deleteDiary = function(id) {
  if (!confirm('确定删除这篇日记？')) return;
  const items = load('diary').filter(i => i.id !== id);
  save('diary', items);
  renderDiary();
};

// ==================== Todo ====================
const todoList = document.getElementById('todo-list');
const todoForm = document.getElementById('todo-form');

function renderTodos() {
  const items = load('todos');
  todoList.innerHTML = items.length === 0
    ? '<p style="color:var(--text-muted);text-align:center;">没有待办事项</p>'
    : items.map(item => `
      <div class="item todo-item ${item.done ? 'completed' : ''}" data-id="${item.id}">
        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleTodo('${item.id}')">
        <span class="todo-text">${escapeHtml(item.text)}</span>
        <button class="btn-small btn-danger" style="margin-left:auto;" onclick="deleteTodo('${item.id}')">删除</button>
      </div>
    `).join('');
}

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = document.getElementById('todo-text').value.trim();
  if (!text) return;
  const items = load('todos');
  items.unshift({ id: uid(), text, done: false, created: Date.now() });
  save('todos', items);
  todoForm.reset();
  renderTodos();
});

window.toggleTodo = function(id) {
  const items = load('todos').map(i => i.id === id ? { ...i, done: !i.done } : i);
  save('todos', items);
  renderTodos();
};

window.deleteTodo = function(id) {
  const items = load('todos').filter(i => i.id !== id);
  save('todos', items);
  renderTodos();
};

// ==================== Goals ====================
const goalList = document.getElementById('goal-list');
const goalForm = document.getElementById('goal-form');

function renderGoals() {
  const items = load('goals');
  goalList.innerHTML = items.length === 0
    ? '<p style="color:var(--text-muted);text-align:center;">还没有设定目标</p>'
    : items.map(item => `
      <div class="item" data-id="${item.id}">
        <h3>${escapeHtml(item.title)}</h3>
        ${item.desc ? `<div class="content">${escapeHtml(item.desc)}</div>` : ''}
        <div class="progress-bar">
          <div class="progress-fill" style="width:${item.progress}%"></div>
        </div>
        <div class="meta">进度：${item.progress}%</div>
        <div class="actions">
          <input type="number" min="0" max="100" value="${item.progress}" style="width:70px;padding:0.3rem;" onchange="updateProgress('${item.id}', this.value)">
          <button class="btn-small btn-danger" onclick="deleteGoal('${item.id}')">删除</button>
        </div>
      </div>
    `).join('');
}

goalForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('goal-title').value.trim();
  const desc = document.getElementById('goal-desc').value.trim();
  const progress = parseInt(document.getElementById('goal-progress').value) || 0;
  if (!title) return;
  const items = load('goals');
  items.push({ id: uid(), title, desc, progress: Math.min(100, Math.max(0, progress)) });
  save('goals', items);
  goalForm.reset();
  document.getElementById('goal-progress').value = 0;
  renderGoals();
});

window.updateProgress = function(id, val) {
  const progress = Math.min(100, Math.max(0, parseInt(val) || 0));
  const items = load('goals').map(i => i.id === id ? { ...i, progress } : i);
  save('goals', items);
  renderGoals();
};

window.deleteGoal = function(id) {
  if (!confirm('确定删除这个目标？')) return;
  const items = load('goals').filter(i => i.id !== id);
  save('goals', items);
  renderGoals();
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;'
  }[m]));
}

// Init
renderDiary();
renderTodos();
renderGoals();
