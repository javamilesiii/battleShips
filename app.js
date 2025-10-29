const flipButton = document.querySelector('#flip-button');
const startbutton = document.querySelector('#start-button');
const gamesBoardContainer = document.querySelector('#gamesboard-container');
const optionContainer = document.querySelector('#option-container');
const infoDisplay = document.querySelector('#info');
const turnDisplay = document.querySelector('#turn-display');

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

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship) {
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
    return {valid, notTaken, shipBlocks}
}

function addShipPiece(user, ship, startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let isHorizontal = user === 'player' ? angle === 0 : Math.random() < 0.5
    let randomStartIndex = Math.floor(Math.random() * allBoardBlocks.length)

    let startIndex = (startId !== undefined && startId !== null) ? Number(startId) : randomStartIndex

    const {valid, notTaken, shipBlocks} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(block => {
            block.classList.add(ship.name)
            block.classList.add('taken')
        })
        notDropped = false
        return true
    } else {
        if (user === 'computer') {
            addShipPiece('computer', ship)
        } else {
            notDropped = true
        }
        return false
    }
}

ships.forEach(ship => addShipPiece('computer', ship))

let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => {
    console.log(optionShip)
    optionShip.addEventListener('dragstart', dragStart)
})

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e) {
    notDropped = false
    draggedShip = e.target
    console.log(draggedShip)
}

function dragOver(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    highlightArea(Number(e.target.id), ship)
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]

    const placed = addShipPiece('player', ship, startId)

    if (placed) {
        draggedShip.removeEventListener('dragstart', dragStart)
        draggedShip.remove()
        draggedShip = null
    } else {
        infoDisplay.textContent = 'Cannot place ship here, try a different location.'
    }
}

function highlightArea(startIndex, ship) {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const {valid, notTaken, shipBlocks} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if (valid && notTaken) {
        shipBlocks.forEach(block => {
            block.classList.add('hover')
            setTimeout(() => block.classList.remove('hover'), 500)
        })
    } else {
        shipBlocks.forEach(block => {
            block.classList.remove('highlight')
        })
    }
}

let gameOver = false
let playerTurn

function startGame() {
    if (playerTurn === undefined) {
        if (optionContainer.children.length !== 0) {
            infoDisplay.textContent = 'Please place all your ships before starting the game'
        } else {
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick)
            )
            playerTurn = true
            turnDisplay.textContent = 'Player\'s turn'
            infoDisplay.textContent = 'Please take your turn'
        }
    }
}

startbutton.addEventListener('click', startGame)

let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

function handleClick(e) {
    if (!gameOver) {
        if (e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = 'You hit a ship!'
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block' && className !== 'boom' && className !== 'taken')
            playerHits.push(...classes)
            checkScore('player', playerHits, playerSunkShips)
        }
        if (!e.target.classList.contains('taken')) {
            infoDisplay.textContent = 'You missed!'
            e.target.classList.add('empty')
        }
        playerTurn = false
        document.querySelectorAll('#computer div').forEach(block => block.removeEventListener('click', handleClick))
        setTimeout(computerGo, 3000)
    }
}

function computerGo() {
    if (!gameOver) {
        turnDisplay.textContent = 'Computer\'s turn'
        infoDisplay.textContent = 'Computer is thinking...'

        setTimeout(() => {
            let randomGo = Math.floor(Math.random() * width * width)
            const allBoardBlocks = document.querySelectorAll('#player div')

            if (allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')) {
                computerGo()
            } else if (allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')) {
                allBoardBlocks[randomGo].classList.add('boom')
                infoDisplay.textContent = 'Computer hit a ship!'
                let classes = Array.from(allBoardBlocks[randomGo].classList)
                classes = classes.filter(className => className !== 'block' && className !== 'boom' && className !== 'taken')
                computerHits.push(...classes)
                checkScore('computer', computerHits, computerSunkShips)
            } else {
                allBoardBlocks[randomGo].classList.add('empty')
                infoDisplay.textContent = 'Computer missed!'
            }
        }, 3000)

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = 'Player\'s turn'
            infoDisplay.textContent = 'Please take your turn'
            document.querySelectorAll('#computer div').forEach(block => block.addEventListener('click', handleClick))
        }, 6000)
    }
}

function checkScore(user, userHits, userSunkShips) {
    function checkShip(shipName, shipLength) {
        if (userHits.filter(hit => hit === shipName).length === shipLength) {
            if (user === 'player') {
                infoDisplay.textContent = `${user} sunk the computer's ${shipName}!`
                playerHits = userHits.filter(hit => hit !== shipName)
            } else if (user === 'computer') {
                infoDisplay.textContent = `${user} defeated the player's ${shipName}!`
                computerHits = userHits.filter(hit => hit !== shipName)
            }
            userSunkShips.push(shipName)

        }
    }
    checkShip('destroyer', 2)
    checkShip('submarine', 3)
    checkShip('cruiser', 3)
    checkShip('battleship', 4)
    checkShip('carrier', 5)

    if (playerSunkShips.length === 5) {
        infoDisplay.textContent = 'You won!'
        gameOver = true
    }
    if (computerSunkShips.length === 5) {
        infoDisplay.textContent = 'You lost!'
        gameOver = true
    }
}