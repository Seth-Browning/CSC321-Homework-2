import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;

let guessesRemaining;
let currentGuess;
let nextLetter;
let rightGuessString;

const colors = {
    aero: '#5BC0EB',
    maize: '#FDE74C',
    'yellow-green': '#b0e242',
    'persian-red': '#e64c49',
    'raisin-black': '#211A1E',
    'vanish-gray': '#bbbbbb'
}


const initBoard = () => {
    let board = document.getElementById('game-board')

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for(let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard();


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
 * @param {string} pressedKey 
 */
const insertLetter = (pressedKey) => {
    if (nextLetter === 5) return;

    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, 'pulse')
    box.textContent = pressedKey;
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

const deleteLetter = () => {
    let row = document.getElementsByClassName('letter-row')[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

const checkGuess = () => {
    let row = document.getElementsByClassName('letter-row')[6 - guessesRemaining]
    let guessString = ""
    let rightGuess = Array.from(rightGuessString)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length !== 5) {
        toastr.error("Not enough letters!")
        return;
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not in list!")
        return
    }

    for (let i = 0; i < 5; i++) {
        let letterColor = "";
        let box = row.children[i];
        let letter = currentGuess[i]

        let letterPosition = rightGuess.indexOf(currentGuess[i])
        if (letterPosition === -1) {
            letterColor = colors['vanish-gray']
        } else {
            if (currentGuess[i] === rightGuess[i]) {
                letterColor = colors['yellow-green']
            } else {
                letterColor = colors['maize']
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i;
        setTimeout(() => {
            animateCSS(box, 'flipInX')
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You Guessed right! Game over!")
        guessesRemaining = 0;
        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: ${rightGuessString}`)
        }
    }
}

const shadeKeyBoard = (letter, color) => {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === colors['yellow-green']) return;
            if (oldColor === colors['maize'] && color !== colors['yellow-green']) return;

            elem.style.backgroundColor = color;
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
        box.style.backgroundColor = "white"
        box.classList.remove('filled-box')
    }
}

const resetGame = () => {
    guessesRemaining = NUMBER_OF_GUESSES
    currentGuess = []
    nextLetter = 0;
    rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
    console.log(rightGuessString)
    resetLetterBoxes()
    resetKeyBoard();
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

    let found = pressedKey.match(/[a-z]/gi)
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

document.getElementById('new-game').addEventListener('click', () => {
    resetGame()
})


resetGame();