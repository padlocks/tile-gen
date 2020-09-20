const fs = require('fs')
const Game = require('../src/Game')
const SaveData = require('../src/SaveData')
const path = './test/savedata'

const Main = async () => {
    if (fs.existsSync(path)) {
        StartGame(path)
    } else {
        console.log('No savefile found. Starting new game..')
        NewGame('./test/structure', './test/main')
    }
}

const NewGame = async (structureFile, tilesFile) => {
    let structure = await Game.import_structure_from_file(structureFile)
    let tileset = await Game.import_tiles_from_file(tilesFile, structure)
    let tilemap = await Game.generate_tilemap(tileset, 5, 10)
    let player = {
        new: true,
        name: require("os").userInfo().username
    }
    let mapdata = {
        tiles: tilemap
    }
    let villagers = {}
    let data = new SaveData(player, mapdata, villagers)

    let saved = await data.save(path)
    if (saved) {
        StartGame(path)
    } else {
        console.log('There was an error creating save. Evacuating..')
        return
    }
}

const StartGame = async (savefile) => {
    let save = await SaveData.load(savefile)
    await Game.visualize_tilemap(save.mapdata.tiles)
    
    let welcome
    if (save.player.new) {
        welcome = `Welcome to your new home, ${save.player.name}!`
        save.player.new = false
    } else {
        welcome = `Welcome back, ${save.player.name}!`
    }
    console.log(welcome)
    ExitGame(save)
}

const ExitGame = async (savedata) => {
    let data = new SaveData(savedata.player, savedata.mapdata, savedata.villagers)
    data.save(path)
}

Main()