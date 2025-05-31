const fs = require('fs');
const path = require('path');

const getAllFiles = (dirPath, folderOnly = false, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      if (folderOnly) {
        arrayOfFiles.push(fullPath);
      } else {
        getAllFiles(fullPath, folderOnly, arrayOfFiles);
      }
    } else if (!folderOnly && file.name.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
};

module.exports = getAllFiles;
