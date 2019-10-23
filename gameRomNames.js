const fs = require('fs');

const pathToFolder = './roms';
const pathToFileWithNames = './roms/names.txt';

fs.readdir(pathToFolder, (error, files) => {
  if (error) {
    console.log(error);
  } else {
    files.forEach(file => {
      if (file !== 'names') {
        fs.appendFile(pathToFileWithNames, `${file}.`, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
});
