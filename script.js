import { WORDS } from "./words.js";
import { WORDS_6 } from "./words6.js";

const NUMBER_OF_GUESSES = (wordLength = 5) => {return Math.ceil(wordLength * 6 / 5)}
const DEBUG = false

const modal = document.getElementById('modal-overlay')
const newGame5 = document.getElementById('new-game-5')
const newGame6 = document.getElementById('new-game-6')


let guessesRemaining;
let currentGuess;
let nextLetter;
let rightGuessString;
let currentGameWordLength = 6;

const colors = {
    aero: '#815bebff',
    maize: '#FDE74C',
    'yellow-green': '#b0e242',
    'persian-red': '#e64c49',
    'raisin-black': '#211A1E',
    'vanish-gray': '#bbbbbb'
}

const boardColors = {
    wrong: 'var(--vanish-gray)',
    right: 'var(--yellow-green)',
    rightMultiple: 'linear-gradient(180deg in oklab, var(--yellow-green) 45%, var(--aero) 115%)',
    rightLetter: 'var(--maize)',
    rightLetterMultiple: 'linear-gradient(180deg in oklab, var(--maize) 45%, var(--aero) 115%)'
}

/**
 * 
 * @param {number} wordLength 
 */
const initBoard = (wordLength = 5) => {
    let board = document.getElementById('game-board')
    board.innerHTML = ""

    for (let i = 0; i < NUMBER_OF_GUESSES(wordLength); i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for(let j = 0; j < wordLength; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard(currentGameWordLength);


const animateCSS = (element, animation, prefix = 'animate__') => {
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`
        const node = element;
        node.style.setProperty('--animation-duration', '0.3s')

        node.classList.add(`${prefix}animated`, animationName)

        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName)
            resolve('Animation eneded')
        }

        node.addEventListener('animationend', handleAnimationEnd, {once: true})
    })
}

/**
 * 
 * @param {string} string 
 * @param {any} char 
 * @returns {int[]}
 */
const indexesOfOccurense = (string, char) => {
    let occurenses = []
    for (let i = 0; i < string.length; i++) {
        if(string[i] === char) occurenses.push(i)
    }
    return occurenses;
}

/**
 * 
 * @param {string} pressedKey 
 */
const insertLetter = (pressedKey) => {
    if (nextLetter === currentGameWordLength) return;

    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES(currentGameWordLength) - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, 'pulse')
    box.textContent = pressedKey;
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const deleteLetter = () => {
    let row = document.getElementsByClassName('letter-row')[NUMBER_OF_GUESSES(currentGameWordLength) - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

const checkGuess = () => {
    let row = document.getElementsByClassName('letter-row')[NUMBER_OF_GUESSES(currentGameWordLength) - guessesRemaining]
    let guessString = ""
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length !== currentGameWordLength) {
        toastr.error("Not enough letters!")
        return;
    }

    switch (currentGameWordLength) {
        case 5:
            if (!WORDS.includes(guessString)) {
                toastr.error("Word not in list!")
                return
            }
            break;
        case 6:
            if (!WORDS_6.includes(guessString)) {
                toastr.error("Word not in list!")
                return;
            }
            break;
    }


    // color for green-purple: linear-gradient(180deg in oklab, var(--yellow-green) 45%, var(--aero) 115%)
    // color for yellow-purple: linear-gradient(180deg in oklab, var(--maize) 45%, var(--aero) 115%)

    for (let i = 0; i < currentGameWordLength; i++) {
        let letterColor = "";
        let box = row.children[i];
        let letter = currentGuess[i]

        let letterPosition = rightGuess.indexOf(currentGuess[i])
        let occurences = indexesOfOccurense(rightGuess, currentGuess[i])
        if (occurences.length === 0) {
            letterColor = colors['vanish-gray']
        } else {

            if (occurences.includes(i)) {
                if (occurences.length === 1) letterColor = boardColors.right
                else {
                    let allFound = true;
                    occurences.forEach(index => {
                        if(currentGuess[index] !== rightGuess[index]) allFound = false
                    })

                    if (allFound) letterColor = boardColors.right
                    else letterColor = boardColors.rightMultiple
                }
            } else {
                if (occurences.length === 1) {
                    letterColor = boardColors.rightLetter
                }
                else letterColor = boardColors.rightLetterMultiple
            }


            // if (currentGuess[i] === rightGuess[i]) {
            //     letterColor = colors['yellow-green']
            // } else {
            //     letterColor = colors['maize']
            // }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i;
        setTimeout(() => {
            animateCSS(box, 'flipInX')
            box.style.background = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You Guessed right! Game over!")
        guessesRemaining = 0;

        setTimeout(() => modal.dataset.active = "true", 2500)

        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: ${rightGuessString}`)
        
            setTimeout(() => modal.dataset.active = "true", 2500)
        }
    }
}

const shadeKeyBoard = (letter, color) => {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.background
            if (oldColor === boardColors.right) return;
            if (oldColor === boardColors.rightMultiple && color !== boardColors.right) return;
            if (oldColor === boardColors.rightLetterMultiple && !(color === boardColors.right || color == boardColors.rightMultiple)) return;

            elem.style.background = color;
            break;
        }
    }
}

const resetKeyBoard = () => {
    for (const elem of document.getElementsByClassName('keyboard-button')) {
        elem.style.background = 'none';
    }
}

const resetLetterBoxes = () => {
    for (const box of document.getElementsByClassName('letter-box')) {
        box.textContent = "";
        box.style.background = "none"
        box.classList.remove('filled-box')
    }
}

const resetGame = () => {
    currentGuess = []
    nextLetter = 0;
    
    //rightGuessString = DEBUG ? "poses" : WORDS[Math.floor(Math.random() * WORDS.length)]
    
    if (DEBUG) {
        setBoard(5)
        rightGuessString = "poses";
    } else {
        switch(currentGameWordLength) {
            case 5:
                rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
                break;
            case 6:
                rightGuessString = WORDS_6[Math.floor(Math.random() * WORDS_6.length)]
                break;
        }
        
    }
    
    guessesRemaining = NUMBER_OF_GUESSES(currentGameWordLength)
    console.log(rightGuessString)
    resetLetterBoxes()
    resetKeyBoard();
}

/**
 * 
 * @param {number} wordLength 
 */
const setBoard = (wordLength) => {
    if (currentGameWordLength !== wordLength) {
        currentGameWordLength = wordLength;
        initBoard(currentGameWordLength)
    }
}


document.addEventListener("keyup", (e) => {
    
    if (guessesRemaining === 0) return;
    
    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return;
    }
    
    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }
    
    let found = pressedKey.match(/^[a-z]$/gi)
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey)
    }
})

document.getElementById('keyboard-cont').addEventListener("click", (e) => {
    const target = e.target
    
    
    if (!target.classList.contains("keyboard-button")) return;
    
    let key = target.textContent;
    if (key === "Del") key = "Backspace";
    
    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

document.addEventListener('click', (e) => {
    const target = e.target;
    
    if(!target.closest('#modal-overlay') && modal.dataset.active === "true") {
        modal.dataset.active = "false"
    }
})

document.getElementById('new-game').addEventListener('click', () => {
    toastr.info("New Game")
    resetGame()
})

document.getElementById('new-game').addEventListener('keydown', (e) => {
    e.preventDefault();
})

newGame5.addEventListener('click', () => {
    setBoard(5)
    resetGame()
    if (modal.dataset.active === "true") modal.dataset.active = "false"
})

newGame6.addEventListener('click', () => {
    setBoard(6)
    resetGame()
    if (modal.dataset.active === "true") modal.dataset.active = "false"
})



resetGame();

toastr.options = {
    "positionClass": "toast-top-center",
    timeOut: "1000"
}