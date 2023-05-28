const fs = require('fs');
const crypto = require('crypto');


const characters = '123456789';
//const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@';

const writeStream = fs.createWriteStream('Files/originalFile.txt', 'utf-8');

function generateRandomString() {

    let randomString = '';

    let max = 30;
    let min = 7;
    let length = Math.floor(Math.random() * (max - min) + min);

    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
};

function generateFileWithRows(numRows, callback) {
    let i = numRows;
    write();
    function write() {
        let ok = true;
        do {
            i -= 1;
            if (i === 0) {
                writeStream.write(generateRandomString() + '\n', callback);
            } else {
                ok = writeStream.write(generateRandomString() + '\n');
            }
        } while (i > 0 && ok);

        if (i > 0) {
            writeStream.once('drain', write);
        }
    }

}


module.exports = {
    generateFileWithRows,
    generateRandomString
};
