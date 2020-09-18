const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { Transform } = require('stream')
const { stringify } = require('querystring')

class AppendInitVect extends Transform {
    constructor(initVect, opts) {
        super(opts)
        this.initVect = initVect
        this.appended = false
    }

    _transform(chunk, encoding, cb) {
        if (!this.appended) {
            this.push(this.initVect)
            this.appended = true
        }
        this.push(chunk)
        cb()
    }
}

function getCipherKey(password) {
    return crypto.createHash('sha256').update(stringify(password)).digest()
}

module.exports.encrypt = (file, password, resultFile) => {
    const initVect = crypto.randomBytes(16)

    const key = getCipherKey(password)
    const readStream = fs.createReadStream(file)
    const gzip = zlib.createGzip()
    const cipher = crypto.createCipheriv('aes256', key, initVect)
    const appendInitVect = new AppendInitVect(initVect)
    const writeStream = fs.createWriteStream(resultFile)

    readStream
        .pipe(gzip)
        .pipe(cipher)
        .pipe(appendInitVect)
        .pipe(writeStream)
}

module.exports.decrypt = async (file, password) => {
    return new Promise((resolve) => {
        const readInitVect = fs.createReadStream(file, { end: 15 })

        let initVect
        readInitVect.on('data', (chunk) => {
            initVect = chunk
        })

        readInitVect.on('close', async () => {
            const key = getCipherKey(password)
            const readStream = fs.createReadStream(file, { start: 16 })
            const decipher = crypto.createDecipheriv('aes256', key, initVect)
            const unzip = zlib.createUnzip()
            //const writeStream = fs.createWriteStream(file + '.tmp')

            let data = ''
            readStream
                .pipe(decipher)
                .pipe(unzip)
                .on('data', chunk => data += chunk)
                .on('end', () => resolve(data))
                .on('error', error => reject(error))
        })
    })
}