require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); // Для парсинга JSON-тел запросов
app.use(express.static(path.join(__dirname, '/'), { index: false })); // Отключаем стандартную подачу index.html
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Для раздачи загруженных файлов

// --- Подключение к MongoDB ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Схемы и Модели Mongoose ---

// Схема для записей о весе
const weightSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
    clothesApplied: { type: Boolean, default: false }
});

// Схема для пользователя
const userSchema = new mongoose.Schema({
    // В будущем здесь будут поля, идентифицирующие пользователя, например, из Authelia
    // Пока создадим одного пользователя для простоты
    username: { type: String, required: true, unique: true },
    profile: {
        gender: String,
        height: Number,
        birth_date: Date,
        muscle: String,
        target_weight: Number,
        clothesWeight: { type: Number, default: 0 },
        ignoreClothesWeight: { type: Boolean, default: false },
        avatarUrl: { type: String, default: 'images/default.jpg' }
    }
});

const User = mongoose.model('User', userSchema);
const Weight = mongoose.model('Weight', weightSchema);

// --- Middleware для идентификации пользователя ---
const identifyUser = async (req, res, next) => {
    // Для локальной разработки, если заголовок не установлен, используем 'igrik82'
    const username = req.headers['remote-user'] || 'igrik82';

    if (!username) {
        return res.status(401).json({ message: 'Unauthorized: User not identified by proxy.' });
    }

    try {
        let user = await User.findOne({ username });
        if (!user) {
            console.log(`First login for user: ${username}. Creating user...`);
            user = new User({ username, profile: {} });
            await user.save();
        }
        req.user = user; // Прикрепляем пользователя к объекту запроса
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error identifying user.' });
    }
};

// --- API Маршруты ---

// Применяем middleware ко всем /api маршрутам
app.use('/api', identifyUser);

// Получение всех данных о весе для пользователя
app.get('/api/weight', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // 20 записей по умолчанию
        const skip = (page - 1) * limit;

        const weights = await Weight.find({ userId: req.user._id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Weight.countDocuments({ userId: req.user._id });

        res.json({
            weights,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Получение ВСЕХ данных о весе для графика
app.get('/api/weight/all', async (req, res) => {
    try {
        const weights = await Weight.find({ userId: req.user._id }).sort({ date: 'asc' });
        res.json(weights);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Добавление новой записи о весе
app.post('/api/weight', async (req, res) => {
    try {
        const { date, weight, clothesApplied } = req.body;
        const newWeight = new Weight({
            userId: req.user._id,
            date,
            weight,
            clothesApplied
        });
        const savedWeight = await newWeight.save();
        res.status(201).json(savedWeight);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Удаление записи о весе
app.delete('/api/weight/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Убедимся, что запись принадлежит текущему пользователю
        const weightEntry = await Weight.findOne({ _id: id, userId: req.user._id });
        if (!weightEntry) {
            return res.status(404).json({ message: 'Weight entry not found or you do not have permission to delete it.' });
        }
        await Weight.findByIdAndDelete(id);
        res.json({ message: 'Weight entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Получение профиля пользователя
app.get('/api/profile', async (req, res) => {
    res.json(req.user.profile || {});
});

// Обновление профиля пользователя
app.post('/api/profile', async (req, res) => {
    try {
        const { gender, height, birth_date, muscle, target_weight, clothesWeight, ignoreClothesWeight } = req.body;

        req.user.profile.gender = gender;
        req.user.profile.height = height;
        req.user.profile.birth_date = birth_date;
        req.user.profile.muscle = muscle;
        req.user.profile.target_weight = target_weight;
        req.user.profile.clothesWeight = clothesWeight;
        req.user.profile.ignoreClothesWeight = ignoreClothesWeight;

        const updatedUser = await req.user.save();
        res.json(updatedUser.profile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Настройка Multer для загрузки аватаров
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'uploads/avatars';
        // Создаем директорию, если она не существует
        const fs = require('fs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.username + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        if (file.mimetype === 'image/svg+xml') {
            return cb(null, true);
        }

        cb('Error: File upload only supports the following filetypes - jpeg, jpg, png, gif, svg');
    }
});
// Загрузка аватара
app.post('/api/profile/avatar', upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'Please upload a file.' });
    }

    try {
        // Сохраняем путь к файлу в профиле пользователя
        req.user.profile.avatarUrl = `/uploads/avatars/${req.file.filename}`;
        await req.user.save();
        res.json({ avatarUrl: req.user.profile.avatarUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// --- Рендеринг главной страницы с аватаром ---
app.get('/', identifyUser, (req, res) => {
    const fs = require('fs');
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading index.html');
        }
        const avatarUrl = req.user.profile.avatarUrl || 'images/default.jpg';
        const modifiedHtml = data.replace(/%%AVATAR_URL%%/g, avatarUrl);
        res.send(modifiedHtml);
    });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
