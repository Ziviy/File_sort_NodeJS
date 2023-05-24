const fs = require('fs');
const crypto = require('crypto');


function generateRandomString() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@';
    let randomString = '';

    let max = 30;
    let min = 7;
    let length = Math.floor(Math.random() * (max - min) + min);

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
};

function generateFileWithRows(numRows) {
    const writeStream = fs.createWriteStream('File.txt');

    for (let i = 0; i < numRows; i++) {
        const randomString = generateRandomString();
        writeStream.write(randomString + '\n');
    }

    writeStream.end();

    writeStream.on('finish', () => {
        console.log('File generation complete.');
    });

    writeStream.on('error', (err) => {
        console.error('Error generating file:', err);
    });
}

    module.exports = {
        generateFileWithRows,
        generateRandomString
    };
    