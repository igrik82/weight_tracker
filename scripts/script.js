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
    loadProfileData();
    profileModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

const openSettingsModal = () => {
    const clothesWeight = localStorage.getItem('clothesWeight');
    if (clothesWeight) {
        document.getElementById('clothes_weight').value = clothesWeight;
    }
    const ignoreClothesWeight = localStorage.getItem('ignoreClothesWeight') === 'true';
    document.getElementById('ignore_clothes_weight_checkbox').checked = ignoreClothesWeight;
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


// --- Хранилище данных (localStorage) ---
// localStorage - это простое хранилище в браузере, которое позволяет сохранять данные между сессиями.

/**
 * Получает данные о весе из localStorage.
 * @returns {Array} - Массив объектов с данными о весе (например, [{date: '2025-10-27', weight: 85.5}]).
 */
const getWeightData = async () => {
    const data = localStorage.getItem('weightData');
    if (data) {
        try {
            // localStorage хранит данные в виде строк, поэтому мы используем JSON.parse для преобразования строки обратно в массив.
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing weightData from localStorage:', error);
            // Если данные повреждены, загружаем начальные данные
        }
    }

    try {
        const response = await fetch('data/initial-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const initialData = await response.json();
        saveWeightData(initialData);
        return initialData;
    } catch (error) {
        console.error('Error fetching initial data:', error);
        return [];
    }
};

/**
 * Сохраняет данные о весе в localStorage.
 * @param {Array} data - Массив объектов с данными о весе для сохранения.
 */
const saveWeightData = (data) => {
    // Перед сохранением мы преобразуем массив в строку с помощью JSON.stringify.
    localStorage.setItem('weightData', JSON.stringify(data));
};

const saveProfileData = () => {
    const profile = {
        gender: document.querySelector('input[name="gender"]:checked').value,
        height: document.getElementById('height').value,
        birth_date: document.getElementById('birth_date').value,
        muscle: document.querySelector('input[name="muscle"]:checked').value,
        target_weight: document.getElementById('target_weight').value
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
};

const loadProfileData = () => {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
        const profile = JSON.parse(profileData);
        document.querySelector(`input[name="gender"][value="${profile.gender}"]`).checked = true;
        document.getElementById('height').value = profile.height;
        document.getElementById('birth_date').value = profile.birth_date;
        document.querySelector(`input[name="muscle"][value="${profile.muscle}"]`).checked = true;
        document.getElementById('target_weight').value = profile.target_weight;
    }
};

let allWeightData = [];
let currentPeriod = 'month'; // week, month, year, all

const filterDataByPeriod = (data, period) => {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'all':
            return data;
        default:
            return data;
    }

    return data.filter(item => new Date(item.date) >= startDate);
};


// --- Отрисовка (Рендеринг) ---
// Эти функции отвечают за отображение данных на странице.

/**
 * Отрисовывает график веса.
 * @param {Array} data - Массив данных о весе.
 */
const renderChart = (data) => {
    // Сортируем данные по дате, чтобы на графике они отображались в хронологическом порядке.
    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Создаем массив меток (дат) для оси X.
    const labels = sortedData.map(item => new Date(item.date).toLocaleDateString('ru-RU'));
    // Создаем массив значений (веса) для оси Y.
    const weights = sortedData.map(item => item.weight);

    // Обновляем данные графика и перерисовываем его.
    weightChart.data.labels = labels;
    weightChart.data.datasets[0].data = weights;
    weightChart.update();
};

/**
 * Отрисовывает таблицу с историей взвешиваний.
 * @param {Array} data - Массив данных о весе.
 */
const renderHistory = (data) => {
    const historyContainer = document.querySelector('.history_table_row_container');
    // Очищаем существующие строки перед добавлением новых.
    historyContainer.innerHTML = '';

    // Сортируем данные в обратном хронологическом порядке (новые записи сверху).
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedData.forEach((item, index) => {
        const prevItem = sortedData[index + 1];
        // Рассчитываем тренд по сравнению с предыдущей записью.
        const trend = prevItem ? (item.weight - prevItem.weight).toFixed(1) : 0;
        const trendImage = trend > 0 ? 'images/weight_up.svg' : 'images/weight_down.svg';
        const trendAbs = Math.abs(trend);

        const clothesIcon = item.clothesApplied ? `<img src="images/tshirt.svg" class="tshirt-icon" alt="Clothes weight">` : '<div class="tshirt-icon-placeholder"></div>';

        // Создаем HTML-элемент для новой строки таблицы.
        const row = document.createElement('div');
        row.classList.add('history_table_row');
        row.innerHTML = `
            <div class="history_table_cell">
                <div class="row_weight_container">
                    ${clothesIcon}
                    <div id="row_weight">${item.weight.toFixed(2)}</div>
                    <div>кг</div>
                </div>
            </div>
            <div class="history_table_cell">
                <div class="row_trend_container">
                    <div id="trend_image">
                        <img src="${trendImage}" loading="lazy" />
                    </div>
                    <div id="tred_text">${trendAbs}</div>
                </div>
            </div>
            <div class="history_table_cell">
                <div class="row_date_container">
                    <div id="row_date">${new Date(item.date).toLocaleDateString('ru-RU')}</div>
                </div>
            </div>
            <div class="history_table_cell">
                <div class="row_delete_container" data-date="${item.date}">
                    <img src="images/delete.svg" loading="lazy" />
                </div>
            </div>
        `;
        // Добавляем новую строку в контейнер таблицы.
        historyContainer.appendChild(row);
    });
};

const updateCurrentWeight = (allData, periodData) => {
    const sortedAllData = allData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastWeight = sortedAllData.length > 0 ? sortedAllData[0].weight : 0;

    const sortedPeriodData = periodData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstWeightOfPeriod = sortedPeriodData.length > 0 ? sortedPeriodData[0].weight : 0;

    const weightChange = lastWeight - firstWeightOfPeriod;

    document.getElementById('text_current_weight').textContent = lastWeight.toFixed(2);
    document.getElementById('text_weight_changes').textContent = Math.abs(weightChange).toFixed(1);

    const trendImage = document.getElementById('img_weight_changes');
    if (weightChange > 0) {
        trendImage.src = 'images/weight_up.svg';
    } else {
        trendImage.src = 'images/weight_down.svg';
    }
};

const calculateAndDisplayBMI = () => {
    const profileData = localStorage.getItem('userProfile');
    const lastWeight = allWeightData.length > 0 ? allWeightData.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight : 0;

    if (profileData && lastWeight > 0) {
        const profile = JSON.parse(profileData);
        const height = parseFloat(profile.height);

        if (height > 0) {
            const heightInMeters = height / 100;
            const bmi = lastWeight / (heightInMeters * heightInMeters);

            document.getElementById('text_bmi_value').textContent = bmi.toFixed(1);

            const bmiStatus = document.querySelector('.bmi_status p');
            const bmiTriangle = document.getElementById('bmi_progress_bar_triangle');

            let statusText = '';
            let triangleColor = '';
            let trianglePosition = 0;

            if (bmi < 18.5) {
                statusText = 'Недостаточный вес';
                triangleColor = '#3D85D8';
                trianglePosition = (bmi / 18.5) * 25;
            } else if (bmi >= 18.5 && bmi < 25) {
                statusText = 'Норма';
                triangleColor = '#17E22E';
                trianglePosition = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
            } else if (bmi >= 25 && bmi < 30) {
                statusText = 'Избыточный вес';
                triangleColor = '#FFE100';
                trianglePosition = 50 + ((bmi - 25) / (30 - 25)) * 25;
            } else {
                statusText = 'Ожирение';
                triangleColor = '#E75550';
                trianglePosition = 75 + ((bmi - 30) / (40 - 30)) * 25; // Assuming max BMI of 40 for the scale
            }

            bmiStatus.textContent = statusText;
            bmiTriangle.style.borderBottomColor = triangleColor;
            bmiTriangle.style.marginLeft = `${Math.min(100, Math.max(0, trianglePosition))}%`;
        }
    }
};


// --- Обработчики событий ---

// Обработчик отправки формы для добавления нового веса.
document.querySelector('.add_weight_container').addEventListener('submit', async (event) => {
    // Предотвращаем стандартное поведение формы (перезагрузку страницы).
    event.preventDefault();

    const date = dateInput.value;
    let weight = parseFloat(weightInput.value);

    // Простая валидация: проверяем, что дата и вес введены корректно.
    if (!date || isNaN(weight)) {
        alert('Пожалуйста, введите корректные дату и вес.');
        return;
    }

    const clothesWeight = parseFloat(localStorage.getItem('clothesWeight')) || 0;
    const ignoreClothesWeight = localStorage.getItem('ignoreClothesWeight') === 'true';
    const newEntry = { date, weight, clothesApplied: false };

    if (clothesWeight > 0 && !ignoreClothesWeight) {
        newEntry.weight -= clothesWeight;
        newEntry.clothesApplied = true;
    }

    let data = await getWeightData();

    // Проверяем, существует ли уже запись для этой даты.
    // Если да, обновляем ее. Если нет, добавляем новую.
    const existingEntryIndex = data.findIndex(item => item.date === date);
    if (existingEntryIndex > -1) {
        data[existingEntryIndex] = newEntry;
    } else {
        data.push(newEntry);
    }

    // Сохраняем обновленные данные и перерисовываем интерфейс.
    saveWeightData(data);
    allWeightData = await getWeightData();
    updateDisplay();

    // Очищаем поле ввода веса.
    weightInput.value = '';
});

// Обработчик для удаления записей из истории.
// Используем делегирование событий, чтобы не навешивать обработчик на каждую кнопку удаления.
document.querySelector('.history_table_row_container').addEventListener('click', async (event) => {
    // Проверяем, был ли клик по кнопке удаления.
    if (event.target.closest('.row_delete_container')) {
        const dateToDelete = event.target.closest('.row_delete_container').dataset.date;
        // Запрашиваем подтверждение у пользователя.
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            let data = await getWeightData();
            // Фильтруем массив, удаляя запись с выбранной датой.
            data = data.filter(item => item.date !== dateToDelete);
            // Сохраняем изменения и обновляем интерфейс.
            saveWeightData(data);
            allWeightData = await getWeightData();
            updateDisplay();
        }
    }
});


document.getElementById('save_settings_button').addEventListener('click', async () => {
    const clothesWeight = parseFloat(document.getElementById('clothes_weight').value);
    const ignoreClothesWeight = document.getElementById('ignore_clothes_weight_checkbox').checked;

    if (!isNaN(clothesWeight)) {
        localStorage.setItem('clothesWeight', clothesWeight);
    } else {
        localStorage.removeItem('clothesWeight');
    }
    localStorage.setItem('ignoreClothesWeight', ignoreClothesWeight);

    closeModal();
    allWeightData = await getWeightData();
    updateDisplay();
});


document.querySelector('#profileModal .form-container').addEventListener('submit', (event) => {
    event.preventDefault();
    saveProfileData();
    calculateAndDisplayBMI();
    closeModal();
});


// --- Начальная загрузка и обработка периодов ---

const updateDisplay = () => {
    const filteredData = filterDataByPeriod(allWeightData, currentPeriod);
    renderChart(filteredData);
    renderHistory(allWeightData); // History should show all data
    updateCurrentWeight(allWeightData, filteredData);
    calculateAndDisplayBMI();

    const clothesWeight = parseFloat(localStorage.getItem('clothesWeight')) || 0;
    const ignoreClothesWeight = localStorage.getItem('ignoreClothesWeight') === 'true';
    if (clothesWeight > 0 && !ignoreClothesWeight) {
        document.getElementById('weight_setting').classList.add('gear-icon-active');
    } else {
        document.getElementById('weight_setting').classList.remove('gear-icon-active');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    allWeightData = await getWeightData();
    updateDisplay();
});

document.getElementById('myDropdown').addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        currentPeriod = event.target.dataset.period;
        document.querySelector('.month_button').textContent = event.target.textContent;
        updateDisplay();
        //  Скрываем дропдаун
        document.getElementById("myDropdown").classList.remove("show");
    }
});
