const io = require("socket.io-client");

class Player {
  constructor(name, id, defenseLength, attack = -1, defenseArray = []) {
    this.name = name;
    this.id = id;
    this.defenseLength = defenseLength;
    this.points = 0;
    this.attack = attack;
    this.defenseArray = defenseArray;
  }

  incrementPoints = () => {
    this.points++;
  };
}

module.exports = Player;
