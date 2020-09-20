const crypto = require('./Cryptography.js')

module.exports = class SaveData {
    constructor(player, mapdata, villagers) {
        this.player = player
        this.mapdata = mapdata
        this.villagers = villagers
    }

    save = async (file) => {
        let save = {
            player: this.player,
            mapdata: this.mapdata,
            villagers: this.villagers
        }

        let string = JSON.stringify(save)
        return await crypto.encrypt(string, 'default', file)
    }

    static load = async (encrypted_file) => {
        let decrypted = await crypto.decrypt(encrypted_file, 'default')
        return JSON.parse(decrypted)
    }
}