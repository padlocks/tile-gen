const fs = require('fs')
const Game = require('../src/Game')
const SaveData = require('../src/SaveData')
const path = './savedata/savedata'

const Main = async () => {
    console.log('No savefile found. Starting new game..')
    NewGame()
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

    let saved //= await data.save(path)
    if (!saved) {
			await Game.visualize_tilemap(data.mapdata.tiles)
        //StartGame(path)
    } else {
        console.log('There was an error creating save. Evacuating..')
        return
    }
}

const ExitGame = async (savedata) => {
    let data = new SaveData(savedata.player, savedata.mapdata, savedata.villagers)
    data.save(path)
}

Main()