const fs = require('fs')
const Game = require('../src/Game')
const SaveData = require('../src/SaveData')
const path = './savedata/savedata'

const Main = async () => {
    if (fs.existsSync(path)) {
        StartGame(path)
    } else {
        console.log('No savefile found. Starting new game..')
        NewGame()
    }
}

const NewGame = async () => {
    let tilemap = await Game.generate_tilemap(5, 10)
    let player = {
        new: true,
        name: require("os").userInfo().username
    }
    let mapdata = {
        next_id: 100,
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
    // load save, load visual
    let save = await SaveData.load(savefile)
    await Game.visualize_tilemap(save.mapdata.tiles)

    // welcome player
    let welcome
    if (save.player.new) {
        welcome = `Welcome to your new home, ${save.player.name}!`
        save.player.new = false
    } else {
        welcome = `Welcome back, ${save.player.name}!`
    }
    console.log(welcome)

    // put items onto tiles
    await Game.place_item(save.mapdata, 'shovel', 1, 1)
    await Game.place_item(save.mapdata, 'net', 5, 0)
    await Game.place_item(save.mapdata, 'fishing_rod', 7, 3)
    await Game.place_item(save.mapdata, 'log', 1, 0)
    await Game.visualize_tilemap(save.mapdata.tiles)
    await Game.rotate_item(save.mapdata, 1, 0, 90)
    await Game.visualize_tilemap(save.mapdata.tiles)
    await Game.remove_item(save.mapdata, 1, 1)
    await Game.rotate_item(save.mapdata, 1, 0, 90)
    await Game.visualize_tilemap(save.mapdata.tiles)

    ExitGame(save)
}

const ExitGame = async (savedata) => {
    let data = new SaveData(savedata.player, savedata.mapdata, savedata.villagers)
    data.save(path)
}

Main()