const gameboard = document.querySelector('#gameboard')
const player = document.querySelector('#player')
const displayInfo = document.querySelector('#info-display')
const displayShips = document.querySelector('#shipsBoard')

const availableShips = [
    smallShip, mediumShip, mediumShip, largeShip, giantShip
]

const startBoard = [
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", ""
]

function createBoard() {
    startBoard.forEach((cell, i) => {
        const cellElement = document.createElement('div')
        cellElement.classList.add('cell')
        cellElement.setAttribute('cell-id', i)
        cellElement.innerHTML = cell
        cellElement.addEventListener('dragover', (e) => {
            e.preventDefault()
        })
        cellElement.addEventListener('dragstart', (e) => {
            draggedShip = e.target
        })
        cellElement.addEventListener('drop', dropEvent)
        gameboard.appendChild(cellElement)
    })
    availableShips.forEach((ship) => {
        const shipElement = document.createElement('div')
        shipElement.classList.add('ship')
        shipElement.innerHTML = ship
        shipElement.draggable
        /*shipElement.forEach((part, i) => {
            part.setAttribute('part-id', i)
        })*/
        shipElement.setAttribute('ship-length', shipElement.children.length)
        displayShips.appendChild(shipElement)
    })
}

createBoard()

let draggedShip

const ships = document.querySelectorAll('.ship')
ships.forEach(ship => {
    console.log(ship)
    ship.addEventListener('dragstart', (e) => {
        console.log(e.target)
            console.log(e.target.getAttribute('ship-length'))
            draggedShip = e.target
        }
    )
    /*shipCell.addEventListener('dragover', (e) => {
        e.preventDefault()
        }
    )*/

})
displayShips.addEventListener('drop', (e) => {
    e.stopPropagation()
    e.target.appendChild(draggedShip)
})

function dropEvent(e) {
    console.log(e.target)
    e.stopPropagation()
    e.target.appendChild(draggedShip)
}