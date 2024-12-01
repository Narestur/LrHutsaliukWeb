let deviceList = [];
let isAuthenticated = false;
let deviceToDelete = null;
let deviceToEdit = null;

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  body.setAttribute("data-theme", newTheme);
  document.querySelector(".theme-toggle").innerHTML =
    newTheme === "light"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  updateDisplay(); // Оновлення відображення пристроїв при зміні теми
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "master" && password === "master") {
    isAuthenticated = true;
    document.body.classList.add("authorized");
    document.getElementById("loginMessage").style.display = "none";
    document.getElementById("logoutButton").style.display = "inline-block";
    showModal("modalSuccess");
    document.getElementById("successMessage").textContent = "Вхід успішний!";
  } else {
    document.getElementById("loginMessage").style.display = "block";
  }
}

function showLogoutConfirmModal() {
  showModal("modalLogoutConfirm");
}

function logout() {
  isAuthenticated = false;
  document.body.classList.remove("authorized");
  document.getElementById("logoutButton").style.display = "none";
  closeModal("modalLogoutConfirm");
  // alert("Ви вийшли з аккаунту!");
}

function addDevice() {
  if (!isAuthenticated) {
    alert("Ви повинні увійти, щоб додати пристрій!");
    return;
  }

  const deviceName = document.getElementById("deviceName").value.trim();
  let deviceStatus = document.getElementById("deviceStatus").value;

  if (deviceName === "") {
    alert("Будь ласка, заповніть поле назви пристрою!");
    return;
  }

  if (deviceStatus === "") {
    deviceStatus = "Очікує на діагностику";
  }

  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString(
    "uk-UA"
  )} ${currentDate.toLocaleTimeString("uk-UA")}`;

  const device = {
    id: Date.now(),
    name: deviceName,
    status: deviceStatus,
    dateAdded: formattedDate,
  };

  deviceList.push(device);
  updateDisplay();
  clearInputs();
  updateStats();

  document.getElementById("successMessage").textContent =
    "Пристрій успішно додано!";
  showModal("modalSuccess");
}

function addDeviceFromModal() {
  if (!isAuthenticated) {
    alert("Ви повинні увійти, щоб додати пристрій!");
    return;
  }

  const deviceName = document.getElementById("modalDeviceName").value.trim();
  let deviceStatus = document.getElementById("modalDeviceStatus").value;

  if (deviceName === "") {
    alert("Будь ласка, заповніть поле назви пристрою!");
    return;
  }

  if (deviceStatus === "") {
    deviceStatus = "Очікує на діагностику";
  }

  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString(
    "uk-UA"
  )} ${currentDate.toLocaleTimeString("uk-UA")}`;

  const device = {
    id: Date.now(),
    name: deviceName,
    status: deviceStatus,
    dateAdded: formattedDate,
  };

  deviceList.push(device);
  updateDisplay();
  clearInputs();
  updateStats();

  closeModal("modalAddDevice");
  document.getElementById("successMessage").textContent =
    "Пристрій успішно додано!";
  showModal("modalSuccess");
}

function showDeleteConfirmModal(deviceId) {
  deviceToDelete = deviceId;
  showModal("modalDeleteConfirm");
}

function confirmDeleteDevice() {
  if (deviceToDelete !== null) {
    deviceList = deviceList.filter((device) => device.id !== deviceToDelete);
    updateDisplay();
    updateStats();
    deviceToDelete = null;
    closeModal("modalDeleteConfirm");
  }
}

function showEditStatusModal(deviceId) {
  deviceToEdit = deviceId;
  const device = deviceList.find((device) => device.id === deviceId);
  if (device) {
    document.getElementById("editDeviceStatus").value = device.status;
    showModal("modalEditStatus");
  }
}

function updateDeviceStatusFromModal() {
  const newStatus = document.getElementById("editDeviceStatus").value;
  const device = deviceList.find((device) => device.id === deviceToEdit);
  if (device) {
    device.status = newStatus;
    updateDisplay();
    updateStats();
    closeModal("modalEditStatus");
    deviceToEdit = null;
  }
}

function filterDevices() {
  const searchTerm = document
    .getElementById("searchDevice")
    .value.toLowerCase();
  const filteredDevices = deviceList.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm) ||
      device.status.toLowerCase().includes(searchTerm)
  );
  displayDevices(filteredDevices);
}

function getStatusClass(status) {
  switch (status) {
    case "В роботі":
      return "status-in-progress";
    case "Відремонтовано":
      return "status-completed";
    case "Очікує на діагностику":
      return "status-waiting";
    default:
      return "";
  }
}

function displayDevices(devices = deviceList) {
  const deviceListElement = document.getElementById("deviceList");
  deviceListElement.innerHTML = "";

  devices.forEach((device) => {
    const li = document.createElement("li");
    li.className = "device-item";
    li.setAttribute("data-id", device.id);

    li.innerHTML = `
      <div class="device-info">
        <span class="device-name">${device.name}</span>
        <span class="device-status ${getStatusClass(device.status)}">${
      device.status
    }</span>
        <div style="font-size: 0.875rem; color: var(--date-text-color);">
          Додано: ${device.dateAdded}
        </div>
      </div>
      <div class="device-actions">
        <button class="btn-primary" onclick="showEditStatusModal(${
          device.id
        })" ${isAuthenticated ? "" : "disabled"}>
          <i class="fas fa-edit"></i> Редагувати
        </button>
        <button class="btn-danger" onclick="showDeleteConfirmModal(${
          device.id
        })">
          <i class="fas fa-trash"></i> Видалити
        </button>
      </div>
    `;

    deviceListElement.appendChild(li);
  });
}

function updateStats() {
  document.getElementById("inProgressCount").textContent = deviceList.filter(
    (d) => d.status === "В роботі"
  ).length;

  document.getElementById("completedCount").textContent = deviceList.filter(
    (d) => d.status === "Відремонтовано"
  ).length;

  document.getElementById("waitingCount").textContent = deviceList.filter(
    (d) => d.status === "Очікує на діагностику"
  ).length;
}

function clearInputs() {
  document.getElementById("deviceName").value = "";
  document.getElementById("deviceStatus").selectedIndex = 0;
  document.getElementById("modalDeviceName").value = "";
  document.getElementById("modalDeviceStatus").selectedIndex = 0;
}

function updateDisplay() {
  displayDevices();
  localStorage.setItem("devices", JSON.stringify(deviceList));
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

window.onclick = function (event) {
  const modals = document.getElementsByClassName("modal");
  for (let i = 0; i < modals.length; i++) {
    if (event.target == modals[i]) {
      modals[i].classList.remove("active");
    }
  }
};

window.onload = function () {
  const savedDevices = localStorage.getItem("devices");
  if (savedDevices) {
    deviceList = JSON.parse(savedDevices);
    updateDisplay();
    updateStats();
  }
};
