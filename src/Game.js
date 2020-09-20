const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')

function convert_type(item) {
    let result = item
    if (result.includes('_')) {
        let split_item = item.split('_')
        let type = split_item[0]
        let string = split_item[1]

        if (type == 'null') {
            result = null
        } else if (type == 'int') {
            result = parseInt(string)
        } else if (type == 'bool') {
            if (string == 'true') {
                result = true
            } else {
                result = false
            }
        }
    }
    return result
}

module.exports.create_tile_object = async (file) => {
    return new Promise((resolve) => {
        let packed = {}
        packed.structure = {}
        packed.book = []

        let cursor = 0
        let stream = readline.createInterface({
            input: fs.createReadStream(file),
            output: process.stdout,
            terminal: false,
            autoClose: true
        })

        stream.on('line', (line) => {
            cursor++
            if (line.startsWith("--")) return
            if (line === '') return

            let split = line.replace(/ /g, '').split(":")
            let property = split[0]
            let default_value = convert_type(split[1])

            try {
                if (split.length <= 1) {
                    throw `There was a problem translating the file. Please refer to the documentation for proper formatting.\nLine ${cursor}`
                }
            }
            catch (err) {
                console.log(err)
                resolve(packed)
            }

            packed.structure[property] = default_value
            packed.book[split[2] - 1] = property
        })

        stream.on('close', () => {
            resolve(packed)
        })
    })
}
module.exports.import_tiles = async (file, packed) => {
    return new Promise((resolve) => {
        let tileset = []
        let cursor = 0
        let stream = readline.createInterface({
            input: fs.createReadStream(file),
            output: process.stdout,
            terminal: false,
            autoClose: true
        })

        stream.on('line', (line) => {
            cursor++
            if (line.startsWith("--")) return
            if (line === '') return
            let split = line.replace(/ /g, '').split(":")
            try {
                if (split.length <= 1) {
                    throw `There was a problem translating the file. Please refer to the documentation for proper formatting.\nLine ${cursor}`
                }
            }
            catch (err) {
                console.log(err)
            }

            let structure = packed.structure
            let book = packed.book
            let tile = _.cloneDeep(structure)

            for (let i = 0; i <= split.length; i++) {
                tile[book[i]] = split[i]
            }

            tileset.push(tile)
        })

        stream.on('close', () => {
            resolve(tileset)
        })
    })

}

module.exports.generate_tilemap = async (rows, columns) => {
    let structureFile = './savedata/tile'
    let tilesFile = './savedata/gameTiles'
    let structure = await this.create_tile_object(structureFile)
    let tileset = await this.import_tiles(tilesFile, structure)

    let tilemap = []
    for (let y = 0; y < rows; y++) {
        let row = y
        tilemap[row] = []

        for (let x = 0; x < columns; x++) {
            let chosen_tile = Math.floor(Math.random() * tileset.length);
            let tile = _.cloneDeep(tileset[chosen_tile])
            tile.coordinates = [x, y]
            tilemap[row].push(tile)

        }
    }

    return tilemap
}

module.exports.visualize_tilemap = async (tilemap) => {
    tilemap.forEach(row => {
        let visual_row = []
        row.forEach(tile => {
            let top_layer = tile.tile_texture

            if (tile.path_texture) {
                top_layer = tile.path_texture
            }

            if (tile.item_placed) {
                top_layer = tile.item_placed
            }

            visual_row.push(top_layer)
        })
        console.log(visual_row.join().replace(/,/g, ' '))
    })
}