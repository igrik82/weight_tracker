require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// --- Модели (копии из server.js для работы с БД) ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    profile: { gender: String, height: Number, birth_date: Date, muscle: String, target_weight: Number }
});
const User = mongoose.model('User', userSchema);

const weightSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    weight: { type: Number, required: true },
    clothesApplied: { type: Boolean, default: false }
});
const Weight = mongoose.model('Weight', weightSchema);

// --- Основная функция импорта ---
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected for import.');

        const USERNAME = 'igrik82';

        // 1. Найти или создать пользователя
        let user = await User.findOne({ username: USERNAME });
        if (!user) {
            console.log(`User '${USERNAME}' not found, creating one...`);
            user = new User({ username: USERNAME, profile: {} });
            await user.save();
            console.log(`User '${USERNAME}' created.`);
        }

        // 2. Прочитать JSON файл
        const dataPath = path.join(__dirname, 'data', 'initial-data.json');
        const weightData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // 3. Подготовить данные для вставки, привязав к ID пользователя
        const weightsToInsert = weightData.map(item => ({
            ...item,
            userId: user._id,
            date: new Date(item.date)
        }));

        // 4. Очистить старые данные о весе для этого пользователя
        console.log(`Clearing old weight data for user '${USERNAME}'...`);
        await Weight.deleteMany({ userId: user._id });

        // 5. Вставить новые данные
        console.log('Inserting new data...');
        await Weight.insertMany(weightsToInsert);

        console.log(`Data successfully imported for user '${USERNAME}'!
`);

    } catch (error) {
        console.error('Error during data import:', error);
    } finally {
        // 6. Закрыть соединение с базой данных
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

// Запустить импорт
importData();
