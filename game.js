function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1 2 3 4 5 6 7 8 9 10
const pickNumber = () => Math.ceil(Math.random() * 10);

// + - * /
// TODO handle '/'
const operators = ['+', '-', 'x'/*, '/'*/]

const pickOperator = (max) => operators[Math.floor(Math.random() * max)];

// choose 6 numbers and 3 symbols to fill the 3x3 grid
const pickSymbols = () => {
    const numbers = []
    for (let i = 0; i < 6; i++) {
        numbers.push(pickNumber())
    }
    // 3 operators:
    // at least one +
    // at least one [+ or -]
    // then one random
    const operators = []
    operators.push('+')
    operators.push(pickOperator(2))
    // TODO set this to 4 when reinstating '/'
    operators.push(pickOperator(3))
    return { numbers, operators }
}

const computeOperation = (a, b, o) => {
    console.log({ a, b, o })
    switch (o) {
        case '+': return parseInt(a) + parseInt(b);
        case '-': return Math.abs(parseInt(a) - parseInt(b));
        // TODO avoid multiplication by 1
        // TODO avoid multiplication by the same number as a previous division
        case 'x': return parseInt(a) * parseInt(b);
        // TODO avoid division by the same number as a previous multiplication
        // TODO avoid division that dos not return an integer 
        // case '/': {
        //     if (a%b == 0) {
        //         return a/b
        //     }
        // }
    }
}

let chosen9Symbols
let level = Number(localStorage.getItem('level')) || 1;

const generateOperation = () => {
    const symbols = pickSymbols()
    console.log(symbols)
    chosen9Symbols = structuredClone(symbols);
    let result;
    const solution = []

    for (let i = 0; i < 3; i++) {
        const a = symbols.numbers.shift()
        const b = symbols.numbers.shift()
        const o = symbols.operators.shift()

        result = computeOperation(a, b, o)
        console.log({ result })
        solution.push(`${a} ${o} ${b} = ${result}`)
        symbols.numbers.unshift(result)
    }
    console.log(symbols)
    // reroll when result is not nice
    if (symbols.numbers[0] <= 10 || symbols.numbers[0] > 100) {
        return generateOperation()
    }
    return { symbols: chosen9Symbols, result, solution }
}

// Source - https://stackoverflow.com/a/12646864
// Posted by Laurens Holst, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-06, License - CC BY-SA 4.0

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const pressedButtons = []
let pressableButtons

const initGridListeners = () => {
    document.querySelector(`button.btn#restartLevel`).addEventListener("click", initGridValues)

    document.querySelector(`button.btn#viewSolution`).addEventListener("click", function () {
        if (this.textContent == "👁️") {
            document.querySelector("div#result").textContent = operation.solution.join("\n")
            document.querySelector("div#result").style.fontSize = "1.5rem"
            document.getElementById('grid').classList.toggle("disabled")
            document.querySelector(`button.btn#restartLevel`).classList.toggle("disabled")
            this.textContent = "⏭️"
        } else {
            document.querySelector("div#result").style.fontSize = null
            document.getElementById('grid').classList.toggle("disabled")
            document.querySelector(`button.btn#restartLevel`).classList.toggle("disabled")
            this.textContent = "👁️"
            newGame()
        }
    })

    for (let i = 1; i < 10; i++) {
        const btn = document.querySelector(`button.btn#a${i}`)

        btn.addEventListener("click", async function () {
            const btn = this
            console.log("click received " + btn.id)

            if (!pressableButtons.includes(btn.id)) {
                if (pressedButtons[pressedButtons.length - 1].id == btn.id) {
                    pressedButtons.pop()
                    pressableButtons.push(btn.id)
                    btn.style.background = null
                } else {
                    console.log(`${btn.id} is not pressable anymore`)
                }
                return
            }

            // only allow pressing 3 buttons in this order: number then operator then number
            if ((!isNaN(btn.textContent) && (pressedButtons.length == 0 || pressedButtons.length == 2))
                || (isNaN(btn.textContent) && pressedButtons.length == 1)) {
                pressedButtons.push({ id: btn.id, value: btn.textContent })
                btn.style.background = "red"
                pressableButtons.splice(pressableButtons.indexOf(btn.id), 1)
            }

            if (pressedButtons.length == 3) {
                const btn1 = document.querySelector(`button.btn#${pressedButtons[0].id}`)
                btn1.textContent = ""
                btn1.style.background = "grey"

                const btn2 = document.querySelector(`button.btn#${pressedButtons[1].id}`)
                btn2.textContent = ""
                btn2.style.background = "grey"

                const operationResult = computeOperation(pressedButtons[0].value, pressedButtons[2].value, pressedButtons[1].value)
                console.log({ operationResult })
                btn.textContent = operationResult
                btn.style.background = null

                pressedButtons.length = 0
                pressedButtons.push({ id: btn.id, value: btn.textContent })
                btn.style.background = "red"

                // VICTORY
                if (operationResult == operation.result) {
                    document.querySelector("div#result").textContent = "BRAVO !"

                    document.getElementById('grid').style.display = "none"
                    document.getElementById('action-row').style.display = "none"

                    await sleep(2000)
                    level++
                    localStorage.setItem("level", level)
                    document.querySelector(".level").textContent = `Niveau ${level}`
                    document.getElementById('grid').style.display = "grid"
                    document.getElementById('action-row').style.display = "flex"
                    newGame()
                }
            }
        })
    }
}

const initGridValues = () => {
    pressedButtons.length = 0
    pressableButtons = Array.from({ length: 9 }, (_, i) => `a${i + 1}`)
    document.querySelector("div#result").textContent = operation.result
    for (let i = 1; i < 10; i++) {
        const btn = document.querySelector(`button.btn#a${i}`)
        btn.textContent = gridItems[i - 1]
        btn.style.background = null
    }
}

let operation
let gridItems

const newGame = () => {
    document.querySelector(".level").textContent = `Niveau ${level}`

    operation = generateOperation()
    console.log("operation", operation)
    // 9 items to put in the 3x3 grid of buttons
    gridItems = operation.symbols.numbers.concat(operation.symbols.operators)
    shuffleArray(gridItems)
    console.log("items", gridItems)

    initGridValues()
}




// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initGridListeners()
    newGame()
});
