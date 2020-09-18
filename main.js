const fs = require('fs')
const readline = require('readline')

module.exports.import_tiles_from_file = async (file) => {
    try {
        if (!file.includes('.tiles')) throw 'Improper file extension. Is it .tiles?'
    }
    catch (err) {
        console.log(err)
        return
    }
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
            let split = line.split(" ")
            try {
                if (split.length <= 1) {
                    throw `There was a problem translating the file. Please refer to the documentation for proper formatting.\nLine ${cursor}`
                }
            }
            catch (err) {
                console.log(err)
            }

            let tile = {
                base_tile: split[0],
                tile_texture: split[1],
                item_placed: null,
                path_texture: null,
                special_building_claimed: false,
                player_manipulation: true
            }

            if (split.length >= 3) {
                tile.path_texture = split[2]
            }

            if (split.length >= 4) {
                tile.item_placed = split[3]
            }

            tileset.push(tile)
        })

        stream.on('close', () => {
            resolve(tileset)
        })
    })
    
}

module.exports.generate_tilemap = async (tileset, rows, columns) => {
    // add rules
    let tilemap = []
    for (let y= 0; y < rows; y++) {
        let row = y
        tilemap[row] = [] 

        for (let x = 0; x < columns; x++) {
            let chosen_tile = Math.floor(Math.random() * tileset.length);
            tilemap[row].push(tileset[chosen_tile])
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