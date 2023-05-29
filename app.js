//const gen = require('./generation');
const fs = require('fs');
const readline = require('readline');


let chunkIndex = 0;

const inputFile = 'Files/originalFile.txt';
const outputFile = 'Files/sortedFile.txt';

const chunkSize = 1 * 1024 * 1024; //1mb

async function SortFile() {
    await ReadFile();
    await mergeChunks(chunkIndex);
    //await DeleteChunks(chunkIndex);
}

async function ReadFile() {
    let chunk = [];
    let currentChunkSize = 0;

    const readStream = fs.createReadStream(inputFile, { encoding: 'utf-8' });
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
    });


    for await (const line of rl) {
        chunk.push(line);

        currentChunkSize += line.length;
        if (currentChunkSize >= chunkSize) {
            writeChunk(chunk);
            
            chunk = [];
            currentChunkSize = 0;
        }
    }

    if (currentChunkSize > 0) {
        writeChunk(chunk);
        chunk = [];
        currentChunkSize = 0;
    }
}

function writeChunk(chunk) {
    chunk.sort();
    const writeStream = fs.createWriteStream(`Files/chunk_${chunkIndex}.txt`);
    chunk.forEach(function(v) {
        writeStream.write(v + '\n');
    })
    
    writeStream.end();

    
    chunkIndex++;
}

async function mergeChunks() {
    const chunkFiles = await findChunkFiles();
    const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf-8' });
  
    const chunkReaders = chunkFiles.map((chunkFile) => createChunkReader(chunkFile));
    const linePromises = chunkReaders.map((chunkReader) => getNextLine(chunkReader));
  
    while (linePromises.length > 0) {
      const lines = await Promise.all(linePromises);
  
      let smallestLine = null;
      let smallestLineIndex = null;
  
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line !== null && (smallestLine === null || line < smallestLine)) {
          smallestLine = line;
          smallestLineIndex = i;
        }
      }
  
      if (smallestLine !== null) {
        writeStream.write(smallestLine + '\n');
        linePromises[smallestLineIndex] = getNextLine(chunkReaders[smallestLineIndex]);
      } else {
        linePromises.splice(smallestLineIndex, 1);
        chunkReaders.splice(smallestLineIndex, 1);
      }
    }
  
    writeStream.end();
    console.log('Chunk files merged and sorted successfully!');
  
    await deleteChunkFiles(chunkFiles);
    console.log('Chunk files deleted successfully!');
  }
  
  async function findChunkFiles() {
    return new Promise((resolve, reject) => {
      fs.readdir('Files', (error, files) => {
        if (error) {
          reject(error);
        } else {
          const chunkFiles = files.filter((file) => file.startsWith('chunk_'));
          resolve(chunkFiles);
        }
      });
    });
  }
  
  function createChunkReader(chunkFile) {
    const readStream = fs.createReadStream(`Files/${chunkFile}`, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity
    });
  
    const chunkReader = {
      rl,
      lineIterator: rl[Symbol.asyncIterator]()
    };
  
    return chunkReader;
  }
  
  async function getNextLine(chunkReader) {
    const { value, done } = await chunkReader.lineIterator.next();
    return done ? null : value;
  }
  
  async function deleteChunkFiles(chunkFiles) {
    return new Promise((resolve, reject) => {
      let deletedCount = 0;
  
      for (const chunkFile of chunkFiles) {
        fs.unlink(`Files/${chunkFile}`, (error) => {
          if (error) {
            reject(error);
          } else {
            deletedCount++;
            if (deletedCount === chunkFiles.length) {
              resolve();
            }
          }
        });
      }
    });
  }
  

// 10000000 - 187mb
// 100000000 - 1.87gb
// 1000000000 - 10.87gb


//gen.generateFileWithRows(100000);
SortFile();

// const used = process.memoryUsage();
// console.log(`Memory usage: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);



