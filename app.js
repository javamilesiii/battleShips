const flipButton = document.querySelector('#flip-button');
const gamesBoardContainer = document.querySelector('#gamesboard-container');
const optionContainer = document.querySelector('#option-container');

let angle = 0

function flip() {
    const optionShips = Array.from(optionContainer.children)
    angle = angle === 0 ? 90 : 0
    optionShips.forEach(ship => ship.style.transform = `rotate(${angle}deg)`)
}

flipButton.addEventListener('click', flip);

const width = 10

function createBoard(color, user) {

    const gameBoardContainer = document.createElement('div')
    gameBoardContainer.classList.add('game-board')
    gameBoardContainer.style.backgroundColor = color
    gameBoardContainer.id = user

    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i
        gameBoardContainer.append(block)
    }

    gamesBoardContainer.append(gameBoardContainer)
}

createBoard('yellow', 'player')
createBoard('pink', 'computer')

class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length
    }
}


const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let isHorizontal = user === 'player' ? angle === 0 : Math.random() < 0.5
    let randomStartIndex = Math.floor(Math.random() * allBoardBlocks.length)

    let startIndex = startId ? startId : randomStartIndex

    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex : width * width - ship.length : startIndex <= width * width - width * ship.length ? startIndex : startIndex - ship.length * width + width

    let shipBlocks = []

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    }

    let valid

    if (isHorizontal) {
        shipBlocks.every((_shipBlock, index) => valid = Number(shipBlocks[0].id) % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every((_shipBlock, index) => valid = Number(shipBlocks[0].id) < 90 + (width * index + 1))
    }

    const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

    if (valid && notTaken) {
        shipBlocks.forEach(block => {
            block.classList.add(ship.name)
            block.classList.add('taken')
        })
    } else {
        user === 'computer' ? addShipPiece('computer', ship) : notDropped = true
    }
}
ships.forEach(ship => addShipPiece('computer', ship))

// Drag and Drop Ships
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e) {
    notDropped = false
    draggedShip = e.target
}

function dragOver(e) {
    e.preventDefault()
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player', ship, startId)
    if (!notDropped) {
        draggedShip.remove()
    }
}