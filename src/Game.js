const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')

function convert_type(item) {
    let result = item
    if (result.includes('_')) {
        let split_item = item.split('_')
        let type = split_item[0]
        let string = split_item[1]

        if (type == 'undefined') {
            result = undefined
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

module.exports.import_items = async (file) => {
    return new Promise((resolve) => {
        let items = {}

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
            let texture = convert_type(split[1])

            let size = {}
            size.x = split[2].split('x')[0]
            size.y = split[2].split('x')[1]
            let total_space = Math.max(size.x, size.y)

            try {
                if (split.length <= 1) {
                    throw `There was a problem translating the file. Please refer to the documentation for proper formatting.\nLine ${cursor}`
                }
            }
            catch (err) {
                console.log(err)
                resolve(items)
            }

            items[property] = {
                name: property,
                uid: 0,
                texture: texture,
                size: size,
                total_space: total_space,
                center: {
                    x: 0,
                    y: 0
                }
            }
        })

        stream.on('close', () => {
            resolve(items)
        })
    })
}

module.exports.generate_tilemap = async (rows, columns) => {
    let structureFile = './savedata/info/tile'
    let tilesFile = './savedata/info/gameTiles'
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

            if (tile.item_placed) {
                top_layer = tile.item_placed.texture
            }

            visual_row.push(top_layer)
        })
        console.log('', visual_row.join().replace(/,/g, ' '))
    })
}

module.exports.place_item = async (map, itemName, x, y) => {
    if (map.tiles[y] === undefined) throw 'Invalid Y Coordinate.'
    if (map.tiles[y][x] === undefined) throw 'Invalid X Coordinate.'

    let items = await this.import_items('./savedata/info/items')
    let item = items[itemName]

    let placed = []
    for (let newX = 0; newX < item.size.x; newX++) {
        for (let newY = 0; newY < item.size.y; newY++) {
            let occupied = map.tiles[newY+y][newX+x].item_placed
            if (!occupied) {
                if (item.center.x == 0 && item.center.y == 0) item.center = { x: newX + x, y: newY + y }
                placed.push(map.tiles[newY + y][newX + x].coordinates)
                map.tiles[newY + y][newX + x].item_placed = item
                console.log(`placed '${itemName}' at (${newX+x}, ${newY+y})`)
            } else {
                console.log(`${occupied.name} has already used tile (${newX+x}, ${newY+y})`)
            }
        }
    }

    placed.forEach(coordinates => {
        let item = map.tiles[coordinates[1]][coordinates[0]].item_placed 
        item.uid = map.next_id
        map.next_id++
    })
}

module.exports.remove_item = async (map, x, y) => {
    if (map.tiles[y] === undefined) throw 'Invalid Y Coordinate.'
    if (map.tiles[y][x] === undefined) throw 'Invalid X Coordinate.'

    let occupied = map.tiles[y][x].item_placed
    if (occupied) {
        for (let newX = 0; newX < occupied.size.x; newX++) {
            for (let newY = 0; newY < occupied.size.y; newY++) {
                map.tiles[newY+y][newX+x].item_placed = undefined
                console.log(`removed '${occupied.name}' from placement at (${newX+x}, ${newY+y})`)
            }
        }
    }
}

module.exports.rotate_item = async (map, target_x, target_y, angle) => {
    if (map.tiles[target_y] === undefined) throw 'Invalid Y Coordinate.'
    if (map.tiles[target_y][target_x] === undefined) throw 'Invalid X Coordinate.'

    let occupied = map.tiles[target_y][target_x].item_placed
    if (occupied) {
        let invalid = false
        let center = occupied.center
        let radians = (Math.PI / 180) * angle
        let cos = Math.cos(radians)
        let sin = Math.sin(radians)
        for (let newX = 0; newX < occupied.size.x; newX++) {
            for (let newY = 0; newY < occupied.size.y; newY++) {
                let x = newX + target_x
                let y = newY + target_y
                let rotated_x = Math.abs(Math.round(cos * (x - center.x) + (sin * (y - center.y)) + center.x))
                let rotated_y = Math.abs(Math.round(cos * (y - center.y) - (sin * (x - center.x)) + center.y))

                // check coordinates exist
                if (map.tiles[rotated_y] === undefined || map.tiles[rotated_y][rotated_x] === undefined || invalid) {
                    invalid = true
                    return console.log('Item didn\'t budge.')
                }

                // now check to see if an item other than itself is located on specified tile
                else if (map.tiles[rotated_y][rotated_x].item_placed !== undefined) {
                    if (map.tiles[rotated_y][rotated_x].item_placed.uid !== occupied.uid)  {
                        invalid = true
                        return console.log('Item didn\'t budge.')
                    }
                }

                // remove old item placement, add new.
                map.tiles[y][x].item_placed = undefined
                map.tiles[rotated_y][rotated_x].item_placed = occupied
                console.log(`rotated '${occupied.name}' from (${x}, ${y}) to (${rotated_x}, ${rotated_y})`)
            }
        }
    }
}