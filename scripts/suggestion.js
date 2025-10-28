
// Этот файл содержит предлагаемые улучшения для вашего приложения Weight Tracker.
// Вы можете использовать его как руководство для внесения изменений в ваш основной файл script.js.

// --- Инициализация Chart.js ---
// Этот код остается таким же, как и в вашем оригинальном файле.
const ctx = document.getElementById('weight-chart').getContext('2d');
let weightChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Вес (кг)',
            data: [],
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

// --- Хранилище данных (localStorage) ---
// localStorage - это простое хранилище в браузере, которое позволяет сохранять данные между сессиями.

/**
 * Получает данные о весе из localStorage.
 * @returns {Array} - Массив объектов с данными о весе (например, [{date: '2025-10-27', weight: 85.5}]).
 */
const getWeightData = () => {
    // localStorage хранит данные в виде строк, поэтому мы используем JSON.parse для преобразования строки обратно в массив.
    const data = localStorage.getItem('weightData');
    return data ? JSON.parse(data) : [];
};

/**
 * Сохраняет данные о весе в localStorage.
 * @param {Array} data - Массив объектов с данными о весе для сохранения.
 */
const saveWeightData = (data) => {
    // Перед сохранением мы преобразуем массив в строку с помощью JSON.stringify.
    localStorage.setItem('weightData', JSON.stringify(data));
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

        // Создаем HTML-элемент для новой строки таблицы.
        const row = document.createElement('div');
        row.classList.add('history_table_row');
        row.innerHTML = `
            <div class="history_table_cell">
                <div class="row_weight_container">
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


// --- Обработчики событий ---

// Обработчик отправки формы для добавления нового веса.
document.querySelector('.add_weight_container').addEventListener('submit', (event) => {
    // Предотвращаем стандартное поведение формы (перезагрузку страницы).
    event.preventDefault();

    const date = dateInput.value;
    const weight = parseFloat(weightInput.value);

    // Простая валидация: проверяем, что дата и вес введены корректно.
    if (!date || isNaN(weight)) {
        alert('Пожалуйста, введите корректные дату и вес.');
        return;
    }

    const newEntry = { date, weight };
    const data = getWeightData();

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
    renderChart(data);
    renderHistory(data);

    // Очищаем поле ввода веса.
    weightInput.value = '';
});

// Обработчик для удаления записей из истории.
// Используем делегирование событий, чтобы не навешивать обработчик на каждую кнопку удаления.
document.querySelector('.history_table_row_container').addEventListener('click', (event) => {
    // Проверяем, был ли клик по кнопке удаления.
    if (event.target.closest('.row_delete_container')) {
        const dateToDelete = event.target.closest('.row_delete_container').dataset.date;
        // Запрашиваем подтверждение у пользователя.
        if (confirm('Вы уверены, что хотите удалить эту запись?')) {
            let data = getWeightData();
            // Фильтруем массив, удаляя запись с выбранной датой.
            data = data.filter(item => item.date !== dateToDelete);
            // Сохраняем изменения и обновляем интерфейс.
            saveWeightData(data);
            renderChart(data);
            renderHistory(data);
        }
    }
});


// --- Начальная загрузка ---

// Этот код выполнится, когда весь HTML-документ будет загружен и готов.
document.addEventListener('DOMContentLoaded', () => {
    // Получаем данные из localStorage.
    const data = getWeightData();
    // Отрисовываем график и историю на основе сохраненных данных.
    renderChart(data);
    renderHistory(data);
});
