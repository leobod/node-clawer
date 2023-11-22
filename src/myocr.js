const { createWorker } = require('tesseract.js');
const path = require('path');

const getVerifyCode = async (imgBase64) => {
    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng', 3);
    const { data: { text } } = await worker.recognize(imgBase64);
    await worker.terminate();
    return text
}

module.exports = {
    getVerifyCode
}

