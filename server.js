const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.post('/start', (_req, res) => {
    const resultsDir = path.join(__dirname, 'results');
    const filesToDelete = ['legislators-support-oppose-count.csv', 'bills-support-oppose-count.csv'];

    filesToDelete.forEach(file => {
        const filePath = path.join(resultsDir, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
    
    exec('npm start', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error starting to process CSV files.');
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send('Processing of CSV files started successfully.');
    });
});

app.get('/csv-files', (_req, res) => {
    const resultsDir = path.join(__dirname, 'results');
    fs.readdir(resultsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error listing CSV files.');
        }
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        const fileContents = csvFiles.map(file => {
            const filePath = path.join(resultsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            return { filename: file, content };
        });
        res.json(fileContents);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`);
});
