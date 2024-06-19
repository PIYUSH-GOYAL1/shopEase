const fs = require('fs');
const path = require('path');

// Read the default image file into a Buffer
const defaultImagePath = path.join("D:\\HERO\\SCS\\shopEase\\public\\images\\uploads", 'download.jpeg'); // Update the path as needed
const defaultProductImage = path.join("D:\\HERO\\SCS\\shopEase\\public\\images\\uploads" , "download.png");


const defaultImageBuffer = fs.readFileSync(defaultImagePath);
const defaultProductBuffer = fs.readFileSync(defaultProductImage)
// console.log(defaultImageBuffer);

module.exports = {defaultImageBuffer , defaultProductBuffer};