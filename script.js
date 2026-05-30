const myModal = new HystModal({
  linkAttributeName: "data-hystmodal",
  // настройки (не обязательно), см. API
});

const columns = document.querySelectorAll(".column");
const addBtns = document.querySelectorAll(".add-task");

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Очищаем колонки от визуальных элементов
  document.querySelectorAll(".column").forEach((column) => {
    const existingTasks = column.querySelectorAll(".task:not(.add-task)");
    existingTasks.forEach((task) => task.remove());
  });

  // Отображаем задачи без сохранения в localStorage
  savedTasks.forEach((taskData) => {
    displayTask(taskData.text, taskData.status);
  });
}

function updateStatusLocalStorage(taskText, newStatus) {
  try {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updateTask = tasks.map((task) => {
      if (task.text === taskText) {
        if (task.status !== newStatus) {
          return { ...task, status: newStatus };
        }
      }
      return task;
    });
    localStorage.setItem("tasks", JSON.stringify(updateTask));
  } catch (error) {
    console.log("Статус не обновился", error);
  }
}

function displayTask(text, status) {
  const task = document.createElement("figure");
  task.className = `task ${status}`;
  task.draggable = true;
  task.innerHTML = `<span class="text">${text}</span>`;

  const btnDelete = document.createElement("span");
  btnDelete.textContent = "Удалить";
  btnDelete.classList.add("btn-delete");
  task.appendChild(btnDelete);

  const column = document.querySelector(`[data-status='${status}']`);
  const addBtn = column.querySelector(".add-task");
  column.insertBefore(task, addBtn);

  updateCounters();
  addDragListeners(task);
}

// Вызываем загрузку задач при полной загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  clearTask();
});
clearTasks();

function updateCounters() {
  columns.forEach((col) => {
    const countEl = col.querySelector(".task-count");
    const tasks = col.querySelectorAll(".task");
    countEl.textContent = tasks.length;
  });
}

function createTask(text = "Новая задача", status = "todo") {
  const task = document.createElement("figure");
  task.className = `task ${status}`;
  task.draggable = true;
  // позволяет делать перетаскивание
  task.innerHTML = `<span class="text">${text}</span>`;

  const btnDelete = document.createElement("span");
  btnDelete.textContent = "Удалить";
  btnDelete.classList.add("btn-delete");
  task.appendChild(btnDelete);

  const column = document.querySelector(`[data-status='${status}']`);
  const addBtn = column.querySelector(".add-task");
  column.insertBefore(task, addBtn);

  // в каком порядке будут располагаться элементы
  updateCounters();
  addDragListeners(task);
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ text, status });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  clearTask();
}

addBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const column = btn.closest(".column");
    // const status = column.dataset.status;
    const writeContainer = column.querySelector(".write-task");
    writeContainer.style.display = "flex";
    const writeInput = column.querySelector(".write-task-input");
    writeInput.focus();
    // const text = prompt("Введите текст задачи")?.trim();
    // const text = writeInput.value;

    // if (text) {
    //   createTask(text, status);
    // }
  });
});

const createTaskBtns = document.querySelectorAll(".add-new-task");

createTaskBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const column = btn.closest(".column");
    const status = column.dataset.status;
    const writeInput = column.querySelector(".write-task-input");
    const text = writeInput.value.trim();
    if (text) {
      createTask(text, status);
    }
    column.querySelector(".write-task").style.display = "none";
    writeInput.value = "";
  });
});

const writeInput = document.querySelectorAll(".write-task-input");
writeInput.forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.keycode === 13) {
      e.preventDefault();
      const column = input.closest(".column");
      const status = column.dataset.status;
      const text = input.value.trim();
      if (text) {
        createTask(text, status);
      }
      input.value = "";
      column.querySelector(".write-task").style.display = "none";
    }
  });
});

let draggedTask = null;

function addDragListeners(task) {
  task.addEventListener("dragstart", () => {
    draggedTask = task;
    setTimeout(() => task.classList.add("dragging"), 0);
  });
  task.addEventListener("dragend", () => {
    setTimeout(() => {
      task.classList.remove("dragging");
      draggedTask = null;
    }, 0);
  });
}

columns.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("over");
  });
  column.addEventListener("dragleave", () => {
    column.classList.remove("over");
  });
  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("over");
    if (!draggedTask) return;
    const addBtn = column.querySelector(".add-task");
    column.insertBefore(draggedTask, addBtn);

    const newStatus = column.dataset.status;
    draggedTask.className = `task ${newStatus}`;
    const taskText = draggedTask.querySelector(".text").textContent;
    updateStatusLocalStorage(taskText, newStatus);
    updateCounters();
  });
});

function getDragAfterElement(column, y) {
  const dragElem = [...column.querySelectorAll(".task:not(.dragging)")];
  return dragElem.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function clearTask() {
  const clearBtn = document.querySelectorAll(".btn-delete");
  clearBtn.forEach((button) => {
    button.addEventListener("click", (event) => {
      const task = event.target.closest(".task");
      const textTask = task.querySelector(".text").textContent;
      task.remove();
      updateCounters();
      let tasksStorage = JSON.parse(localStorage.getItem("tasks")) || [];
      let currentTasks = tasksStorage.filter((task) => task.text !== textTask);
      console.log(currentTasks);
      localStorage.setItem("tasks", JSON.stringify(currentTasks));
    });
  });
}

function clearTasks() {
  const trashBtn = document.querySelectorAll(".all-trash-btn");
  trashBtn.forEach((button) => {
    button.addEventListener("click", () => {
      const column = button.closest(".column");
      const status = column.dataset.status;
      if (status) {
        let tasks = column.querySelectorAll(".task");
        tasks.forEach((task) => {
          task.remove();
        });
      }
      updateCounters();

      let tasksStorage = JSON.parse(localStorage.getItem("tasks")) || [];

      let newTask = tasksStorage.filter((task) => task.status !== status);
      localStorage.setItem("tasks", JSON.stringify(newTask));
    });
  });
}
