function promiseFiller(documents, callback) {
    const promises = [];
    documents.forEach(doc => promise.push(callback(doc)) )
    return Promise.all(promises);
}
module.exports = promiseFiller;