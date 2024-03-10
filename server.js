const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path'); // Add this line

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/your_database_name', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const userDataSchema = new mongoose.Schema({
    name: String,
    email: String
});

const UserData = mongoose.model('UserData', userDataSchema);

const dataFilePath = path.join(__dirname, 'data.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/submit', async (req, res) => {
    try {
        const userData = new UserData({
            name: req.body.name,
            email: req.body.email
        });

        await userData.save();
        console.log('Data saved to MongoDB');
        res.redirect('/display');
    } catch (err) {
        console.error('Error saving data to MongoDB:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/display', async (req, res) => {
    try {
        // Fetch data from MongoDB
        const mongoDBData = await UserData.find();

        // Fetch data from data.json file
        let fileData = [];
        try {
            const fileContent = await fs.readFile(dataFilePath, 'utf-8');
            fileData = JSON.parse(fileContent);
        } catch (readError) {
            if (readError.code !== 'ENOENT') {
                throw readError;
            }
        }

        res.render('display', { mongoDBData, fileData });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
