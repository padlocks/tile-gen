const crypto = require('crypto')
const fs = require('fs')
const zlib = require('zlib')
const { Transform } = require('stream')
const { stringify } = require('querystring')
const { Readable } = require("stream")

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

module.exports.encrypt = (string, password, resultFile) => {
    return new Promise((resolve, reject) => {
        let initVect = crypto.randomBytes(16)

        let key = getCipherKey(password)
        let readStream = Readable.from([string])
        let gzip = zlib.createGzip()
        let cipher = crypto.createCipheriv('aes256', key, initVect)
        let appendInitVect = new AppendInitVect(initVect)
        let writeStream = fs.createWriteStream(resultFile)

        readStream
            .pipe(gzip)
            .pipe(cipher)
            .pipe(appendInitVect)
            .pipe(writeStream)
        writeStream.on('close', () => resolve(true))
    })
}

module.exports.decrypt = async (file, password) => {
    return new Promise((resolve, reject) => {

        let initVect
        fs.open(file, 'r', (err, fd) => {
            if (err) console.log(err)

            fs.read(
                fd, Buffer.alloc(16), 0, 16, 0,
                (err, bytes, buffer) => {
                    if (err) console.log(err)

                    initVect = buffer
                    let key = getCipherKey(password)
                    let readStream = fs.createReadStream(file, { start: 16 })
                    let decipher = crypto.createDecipheriv('aes256', key, initVect)
                    let unzip = zlib.createUnzip()

                    let data = ''
                    readStream
                        .pipe(decipher)
                        .pipe(unzip)
                        .on('data', chunk => data += chunk)
                        .on('end', () => resolve(data))
                        .on('error', error => reject(error))
                })
        }) 
    })
}