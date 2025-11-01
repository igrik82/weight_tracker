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
    const profile = currentUserProfile;
    if (profile.clothesWeight) {
        document.getElementById('clothes_weight').value = profile.clothesWeight;
    }
    document.getElementById('ignore_clothes_weight_checkbox').checked = profile.ignoreClothesWeight || false;
    settingsModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
}

const periodModal = document.getElementById('periodModal');

const openPeriodModal = () => {
    periodModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
};

const closeModal = () => {
    profileModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    periodModal.classList.add('hidden');
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
const getWeightData = async (page = 1) => {
    try {
        const response = await fetch(`/api/weight?page=${page}&limit=20`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weight data:', error);
        return { weights: [], total: 0, page: 1, pages: 1 };
    }
};

/**
 * Сохраняет данные о весе в localStorage.
 * @param {Array} data - Массив объектов с данными о весе для сохранения.
 */
const saveWeightData = async (newEntry) => {
    try {
        const response = await fetch('/api/weight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEntry),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedWeight = await response.json();
        return savedWeight;
    } catch (error) {
        console.error('Error saving weight data:', error);
        return null;
    }
};

const saveProfileData = async () => {
    try {
        const profile = currentUserProfile; // Используем данные из глобального объекта

        profile.gender = document.querySelector('input[name="gender"]:checked').value;
        profile.height = document.getElementById('height').value;
        profile.birth_date = document.getElementById('birth_date').value;
        profile.muscle = document.querySelector('input[name="muscle"]:checked').value;
        profile.target_weight = document.getElementById('target_weight').value;

        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedProfile = await response.json();
        currentUserProfile = savedProfile; // Обновляем глобальный профиль
        return savedProfile;
    } catch (error) {
        console.error('Error saving profile data:', error);
        return null;
    }
};

const loadProfileData = () => {
    const profile = currentUserProfile;
    if (profile.gender) {
        document.querySelector(`input[name="gender"][value="${profile.gender}"]`).checked = true;
    }
    if (profile.height) {
        document.getElementById('height').value = profile.height;
    }
    if (profile.birth_date) {
        document.getElementById('birth_date').value = new Date(profile.birth_date).toISOString().split('T')[0];
    }
    if (profile.muscle) {
        document.querySelector(`input[name="muscle"][value="${profile.muscle}"]`).checked = true;
    }
    if (profile.target_weight) {
        document.getElementById('target_weight').value = profile.target_weight;
    }
    if (profile.avatarUrl) {
        updateAvatarDisplay(profile.avatarUrl);
    }
};

const updateAvatarDisplay = (avatarUrl) => {
    document.querySelector('.login_icon img').src = avatarUrl;
    document.querySelector('.avatar-container .avatar').src = avatarUrl;
};

let allWeightData = [];
let currentUserProfile = {};
let currentPeriod = 'month'; // week, month, year, all
let customDateRange = {};

// --- Централизованное обновление данных ---
const updateAllData = async () => {
    try {
        // 1. Получаем все данные одновременно
        const [allWeights, firstPage, profile] = await Promise.all([
            fetch('/api/weight/all').then(res => res.json()), // Все данные для графика
            getWeightData(1), // Первая страница для истории
            fetch('/api/profile').then(res => res.json())
        ]);

        // 2. Сохраняем в глобальные переменные
        allWeightData = allWeights;
        currentUserProfile = profile;
        currentPage = 1;
        hasMore = firstPage.weights.length < firstPage.total;

        // 3. Вызываем все функции отрисовки с актуальными данными
        const filteredData = filterDataByPeriod(allWeightData, currentPeriod, customDateRange);
        renderChart(filteredData);
        renderHistory(firstPage.weights, true); // Первоначальная загрузка истории
        updateCurrentWeight(allWeightData, filteredData);
        calculateAndDisplayBMI(currentUserProfile);
        updateProgressBar(currentUserProfile);
        updateAvatarDisplay(currentUserProfile.avatarUrl);

        // Обновление иконки настроек
        const clothesWeight = currentUserProfile.clothesWeight || 0;
        const ignoreClothesWeight = currentUserProfile.ignoreClothesWeight || false;
        if (clothesWeight > 0 && !ignoreClothesWeight) {
            document.getElementById('weight_setting').classList.add('gear-icon-active');
        } else {
            document.getElementById('weight_setting').classList.remove('gear-icon-active');
        }

    } catch (error) {
        console.error('Error updating all data:', error);
    }
};

const filterDataByPeriod = (data, period, customRange = {}) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = now;

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
        case 'custom':
            startDate = new Date(customRange.start);
            endDate = new Date(customRange.end);
            // Добавляем один день к конечной дате, чтобы включить ее в диапазон
            endDate.setDate(endDate.getDate() + 1);
            return data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate && itemDate <= endDate;
            });
        default:
            return data;
    }

    return data.filter(item => new Date(item.date) >= startDate && new Date(item.date) <= endDate);
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
const renderHistory = (data, isInitialLoad = false) => {
    const historyContainer = document.querySelector('.history_table_row_container');
    if (isInitialLoad) {
        historyContainer.innerHTML = '';
    }

    // Сортируем данные в обратном хронологическом порядке (новые записи сверху).
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedData.forEach((item, index) => {
        const prevItem = sortedData[index + 1];
        // Рассчитываем тренд по сравнению с предыдущей записью.
        const trend = prevItem ? (item.weight - prevItem.weight).toFixed(1) : 0;
        const trendImage = trend > 0 ? 'images/weight_up.svg' : 'images/weight_down.svg';
        const trendAbs = Math.abs(trend).toFixed(1);

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
                <div class="row_delete_container" data-id="${item._id}">
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

const calculateAndDisplayBMI = (profile) => {
    const lastWeight = allWeightData.length > 0 ? allWeightData.sort((a, b) => new Date(b.date) - new Date(a.date))[0].weight : 0;

    if (profile && lastWeight > 0) {
        const height = parseFloat(profile.height);

        if (height > 0) {
            const heightInMeters = height / 100;
            const bmi = lastWeight / (heightInMeters * heightInMeters);

            document.getElementById('text_bmi_value').textContent = bmi.toFixed(1);

            const bmiStatus = document.querySelector('.bmi_status p');
            const bmiTriangle = document.getElementById('bmi_progress_bar_triangle');

            let statusText = '';
            let trianglePosition = 0;

            if (bmi < 18.5) {
                statusText = 'Недостаточный вес';
                trianglePosition = (bmi / 18.5) * 25;
            } else if (bmi >= 18.5 && bmi < 25) {
                statusText = 'Норма';
                trianglePosition = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
            } else if (bmi >= 25 && bmi < 30) {
                statusText = 'Избыточный вес';
                trianglePosition = 50 + ((bmi - 25) / (30 - 25)) * 25;
            } else {
                statusText = 'Ожирение';
                trianglePosition = 75 + ((bmi - 30) / (40 - 30)) * 25; // Assuming max BMI of 40 for the scale
            }

            const gradientColors = [
                { p: 0, color: { r: 61, g: 133, b: 216 } },   // #3D85D8
                { p: 45, color: { r: 23, g: 226, b: 46 } },  // #17E22E
                { p: 57, color: { r: 255, g: 225, b: 0 } },   // #FFE100
                { p: 100, color: { r: 231, g: 85, b: 80 } }    // #E75550
            ];

            const triangleColor = getColorForPercentage(trianglePosition, gradientColors);

            bmiStatus.textContent = statusText;
            bmiTriangle.style.borderBottomColor = triangleColor;
            bmiTriangle.style.marginLeft = `${Math.min(100, Math.max(0, trianglePosition))}%`;
        }
    }
};

function getColorForPercentage(percentage, colorPoints) {
    let p1, p2;
    for (let i = 0; i < colorPoints.length - 1; i++) {
        if (percentage >= colorPoints[i].p && percentage <= colorPoints[i + 1].p) {
            p1 = colorPoints[i];
            p2 = colorPoints[i + 1];
            break;
        }
    }

    if (!p1 || !p2) {
        return `rgb(${colorPoints[0].color.r}, ${colorPoints[0].color.g}, ${colorPoints[0].color.b})`;
    }

    const t = (percentage - p1.p) / (p2.p - p1.p);

    const r = Math.round(p1.color.r * (1 - t) + p2.color.r * t);
    const g = Math.round(p1.color.g * (1 - t) + p2.color.g * t);
    const b = Math.round(p1.color.b * (1 - t) + p2.color.b * t);

    return `rgb(${r}, ${g}, ${b})`;
}

const updateProgressBar = (profile) => {
    const targetWeight = profile ? parseFloat(profile.target_weight) : 0;
    const progressBarCover = document.getElementById('progress_bar_cover');

    if (allWeightData.length > 0 && targetWeight > 0) {
        const sortedData = [...allWeightData].sort((a, b) => new Date(a.date) - new Date(b.date));
        const startWeight = sortedData[0].weight;
        const startDate = new Date(sortedData[0].date).toLocaleDateString('ru-RU');
        let currentWeight = sortedData[sortedData.length - 1].weight;

        document.getElementById('weight_before').textContent = startWeight.toFixed(2);
        document.getElementById('date_before').textContent = startDate;
        document.getElementById('weight_point').textContent = targetWeight.toFixed(2);

        // Расчет прогнозируемой даты
        let weeksPassed = 0;
        let tempWeight = currentWeight;
        while (tempWeight > targetWeight) {
            tempWeight *= (1 - 0.0075);
            weeksPassed++;
        }
        const today = new Date();
        const targetDate = new Date(today.setDate(today.getDate() + weeksPassed * 7));
        document.getElementById('date_point').textContent = targetDate.toLocaleDateString('ru-RU');


        let progressPercentage = 0;
        progressBarCover.classList.remove('progress-bar-overweight');

        if (currentWeight > startWeight) {
            // Логика для набора веса
            progressBarCover.classList.add('progress-bar-overweight');
            const weightGain = currentWeight - startWeight;
            // Условно примем, что 100% - это +10 кг от начального веса
            progressPercentage = (weightGain / 10) * 100;
        } else {
            // Логика для потери веса
            const totalWeightLossNeeded = startWeight - targetWeight;
            const weightLossAchieved = startWeight - currentWeight;
            if (totalWeightLossNeeded > 0) {
                progressPercentage = (weightLossAchieved / totalWeightLossNeeded) * 100;
            }
        }

        progressBarCover.style.width = `${Math.min(100, Math.max(0, progressPercentage))}%`;
    } else {
        // Очищаем прогресс-бар, если данных нет
        document.getElementById('weight_before').textContent = '-';
        document.getElementById('date_before').textContent = '-';
        document.getElementById('weight_point').textContent = '-';
        document.getElementById('date_point').textContent = '-';
        progressBarCover.style.width = '0%';
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

    const clothesWeight = currentUserProfile.clothesWeight || 0;
    const ignoreClothesWeight = currentUserProfile.ignoreClothesWeight || false;

    const newEntry = { date, weight, clothesApplied: false };

    if (clothesWeight > 0 && !ignoreClothesWeight) {
        newEntry.weight -= clothesWeight;
        newEntry.clothesApplied = true;
    }

    await saveWeightData(newEntry);
    await updateAllData();

    // Очищаем поле ввода веса.
    weightInput.value = '';
});

// Обработчик для удаления записей из истории.
// Используем делегирование событий, чтобы не навешивать обработчик на каждую кнопку удаления.
document.querySelector('.history_table_row_container').addEventListener('click', async (event) => {
    // Проверяем, был ли клик по кнопке удаления.
    if (event.target.closest('.row_delete_container')) {
        const idToDelete = event.target.closest('.row_delete_container').dataset.id;
        // Запрашиваем подтверждение у пользователя.
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            try {
                const response = await fetch(`/api/weight/${idToDelete}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                await updateAllData();
            } catch (error) {
                console.error('Error deleting weight data:', error);
            }
        }
    }
});


document.getElementById('save_settings_button').addEventListener('click', async () => {
    const clothesWeight = parseFloat(document.getElementById('clothes_weight').value) || 0;
    const ignoreClothesWeight = document.getElementById('ignore_clothes_weight_checkbox').checked;

    try {
        const profile = currentUserProfile; // Используем данные из глобального объекта

        profile.clothesWeight = clothesWeight;
        profile.ignoreClothesWeight = ignoreClothesWeight;

        await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        closeModal();
        await updateAllData();
    } catch (error) {
        console.error('Error saving settings:', error);
    }
});


document.querySelector('#profileModal .form-container').addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveProfileData();
    await updateAllData(); // Обновляем все данные и перерисовываем интерфейс
    closeModal();
});

// Обработчик загрузки аватара
const avatarInput = document.createElement('input');
avatarInput.type = 'file';
avatarInput.accept = 'image/*';

avatarInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const spinner = document.querySelector('.avatar-spinner');
    spinner.classList.remove('hidden');

    try {
        let uploadFile = file;
        let fileName = file.name;

        // Обрабатываем только растровые изображения, SVG загружаем как есть
        if (file.type !== 'image/svg+xml') {
            const processedImageBlob = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const size = Math.min(img.width, img.height);
                        const x = (img.width - size) / 2;
                        const y = (img.height - size) / 2;
                        canvas.width = 300;
                        canvas.height = 300;
                        ctx.drawImage(img, x, y, size, size, 0, 0, 300, 300);
                        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                        canvas.toBlob(resolve, outputType, 0.9);
                    };
                    img.onerror = reject;
                    img.src = e.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            uploadFile = processedImageBlob;
            fileName = file.type === 'image/png' ? 'avatar.png' : 'avatar.jpg';
        }

        const formData = new FormData();
        formData.append('avatar', uploadFile, fileName);

        const response = await fetch('/api/profile/avatar', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentUserProfile.avatarUrl = data.avatarUrl;
        updateAvatarDisplay(data.avatarUrl);

    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Ошибка при загрузке изображения. Пожалуйста, попробуйте другой файл.');
    } finally {
        spinner.classList.add('hidden');
    }
});

document.querySelector('.avatar-container').addEventListener('click', () => {
    avatarInput.click();
});


// --- Начальная загрузка и обработка периодов ---



document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/profile');
        const profile = await response.json();
        if (profile.avatarUrl) {
            updateAvatarDisplay(profile.avatarUrl);
        }
    } catch (error) {
        console.error('Error pre-loading avatar:', error);
    }
    await updateAllData();
});

document.getElementById('myDropdown').addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        const period = event.target.dataset.period;
        document.querySelector('.month_button').textContent = event.target.textContent;
        if (period === 'custom') {
            openPeriodModal();
        } else {
            currentPeriod = period;
            updateAllData();
        }
        //  Скрываем дропдаун
        document.getElementById("myDropdown").classList.remove("show");
    }
});

document.getElementById('apply_period_button').addEventListener('click', () => {
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    if (startDate && endDate) {
        currentPeriod = 'custom';
        customDateRange = { start: startDate, end: endDate };
        document.querySelector('.month_button').textContent = 'Период';
        updateAllData();
        closeModal();
    }
});

// --- Логика бесконечной прокрутки ---
let currentPage = 1;
let isLoading = false;
let hasMore = true;

const historyContainer = document.querySelector('.history_table_row_container');

historyContainer.addEventListener('scroll', () => {
    if (isLoading || !hasMore) return;

    if (historyContainer.scrollTop + historyContainer.clientHeight >= historyContainer.scrollHeight - 5) {
        loadMoreWeightData();
    }
});

const loadMoreWeightData = async () => {
    isLoading = true;
    currentPage++;
    const data = await getWeightData(currentPage);
    if (data.weights.length > 0) {
        renderHistory(data.weights, false);
    } else {
        hasMore = false;
    }
    isLoading = false;
};
