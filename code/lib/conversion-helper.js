const maxScanSize = process.env.MAX_SCAN_SIZE ? process.env.MAX_SCAN_SIZE : "2000M";
const k = 1024;
exports.isValidSize = (contentLength) => {
  return convertByteToMB(contentLength) < Number(maxScanSize.slice(0, -1)) ? true : false;
};

const convertByteToMB = (size) => {
  return Math.ceil(size / k ** 2);
};

exports.byteConverter = (contentLength, decimals = 1) => {
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(contentLength) / Math.log(k));
    return parseFloat((contentLength / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
