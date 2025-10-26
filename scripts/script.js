// Получаем элемент input по его ID
const dateInput = document.getElementById('date');

// Создаем новый объект Date, который содержит текущую дату и время
const today = new Date();

// Форматируем дату в формат YYYY-MM-DD
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
const day = String(today.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;

// Устанавливаем значение input
dateInput.value = formattedDate;

// When the user clicks on the button,
// toggle between hiding and showing the dropdown content
document.querySelector('.button_period_select').addEventListener('click', function() {
    document.getElementById("myDropdown").classList.toggle("show");
});

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.closest('.button_period_select')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Инициализация Chart.js
const ctx = document.getElementById('weight-chart').getContext('2d');
let weightChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Вес (кг)',
            data: [],
            // borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// Изменение плейсхолдера в зависимости от ширины экрана
const weightInput = document.getElementById('weight');
const placeholderText = () => {
    if (window.innerWidth <= 450) {
        weightInput.placeholder = 'Текущий вес';
    } else {
        weightInput.placeholder = 'Добавить текущий вес';
    }
};

// Вызываем функцию при загрузке страницы и при изменении размера окна
window.addEventListener('DOMContentLoaded', placeholderText);
window.addEventListener('resize', placeholderText);

// Modal window logic
const loginIcon = document.querySelector('.login_icon');
const profileModal = document.getElementById('profileModal');
const settingsModal = document.getElementById('settingsModal');
const modalOverlay = document.getElementById('modalOverlay');
const logoutModalButton = document.querySelector('.logout_button');
const closeButtons = document.querySelectorAll('.close_button');
const settingsIcon = document.getElementById('weight_setting');

const openProfileModal = () => {
    profileModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

const openSettingsModal = () => {
    settingsModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

const closeModal = () => {
    profileModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
};

loginIcon.addEventListener('click', openProfileModal);
settingsIcon.addEventListener('click', openSettingsModal);

closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
});

logoutModalButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
// test
