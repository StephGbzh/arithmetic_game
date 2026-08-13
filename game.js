function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function optimizedDivisors(n) {
    let result = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i == 0) {
            result.push(i);
            if (i !== n / i) {
                result.push(n / i);
            }
        }
    }
    return result.filter((e, idx) => idx > 0 && e < n).sort((a, b) => a - b);
}

const removeElementFromArray = (arr, element) => arr.splice(arr.indexOf(element), 1)

// 1 2 3 4 5 6 7 8 9 10
const pickRandomNumber = () => Math.ceil(Math.random() * 10);

// + - * /
const operators = ['+', '-', 'x', '/']

// choose randomly from the first 'max' elements of array 'arr'
// return the index
const pickRandomElementIndexFromArray = (arr, max = arr.length) => Math.floor(Math.random() * Math.min(arr.length, max))

const pickRandomElementFromArray = (arr, max = arr.length) => arr[Math.floor(Math.random() * Math.min(arr.length, max))]

const pickRandomOperator = (max) => operators[pickRandomElementFromArray(operators, max)]

const forbiddenNumbers = []
const forbiddenOperators = []

const removeArray2FromArray1 = (arr, arrToRemove) => arr.filter((e) => !arrToRemove.includes(e))

const findNextOperation = (startNumber = 0) => {
    const possibleOperators = removeArray2FromArray1(operators, forbiddenOperators)
    const operator = pickRandomElementFromArray(possibleOperators)

    switch (operator) {
        case '+': {
            // 1, ..., 10
            let candidates = Array.from({ length: 10 }, (_, i) => i + 1)
            candidates = removeArray2FromArray1(candidates, forbiddenNumbers)
            const a = startNumber > 0 ? startNumber : pickRandomElementFromArray(candidates)
            const b = pickRandomElementFromArray(candidates)
            const result = a + b
            forbiddenNumbers.push(a)
            forbiddenNumbers.push(b)
            forbiddenNumbers.push(result)
            return { a, operator, b, result }
        }
        case '-': {
            // only one reduction allowed
            forbiddenOperators.push('-')
            forbiddenOperators.push('/')
            // 2 to 10
            let candidates = Array.from({ length: 9 }, (_, i) => i + 2)
            candidates = removeArray2FromArray1(candidates, forbiddenNumbers)
            let a = startNumber > 0 ? startNumber : pickRandomElementFromArray(candidates)
            candidates = Array.from({ length: 10 }, (_, i) => i + 1).filter(e => e < a)
            candidates = removeArray2FromArray1(candidates, forbiddenNumbers)
            let b = pickRandomElementFromArray(candidates)
            const result = a - b
            forbiddenNumbers.push(a)
            forbiddenNumbers.push(b)
            forbiddenNumbers.push(result)
            return { a, operator, b, result }
        }
        case 'x': {
            // only one multiplication allowed
            forbiddenOperators.push('*')
            // 2 to 10
            let candidates = Array.from({ length: 9 }, (_, i) => i + 2)
            candidates = removeArray2FromArray1(candidates, forbiddenNumbers)
            let a = startNumber > 0 ? startNumber : pickRandomElementFromArray(candidates)
            let b = pickRandomElementFromArray(candidates)
            const result = a * b
            forbiddenNumbers.push(a)
            forbiddenNumbers.push(b)
            forbiddenNumbers.push(result)
            return { a, operator, b, result }
        }
        case '/': {
            // only one reduction allowed
            forbiddenOperators.push('-')
            forbiddenOperators.push('/')
            if (startNumber > 0) {
                const divisors = optimizedDivisors(startNumber)
                let candidates = removeArray2FromArray1(divisors, forbiddenNumbers)
                if (candidates.length > 0) {
                    const a = startNumber
                    const b = pickRandomElementFromArray(candidates)
                    const result = a / b
                    forbiddenNumbers.push(a)
                    forbiddenNumbers.push(b)
                    forbiddenNumbers.push(result)
                    return { a, operator, b, result }
                }
                return findNextOperation(startNumber)
            } else {
                // Only valid choices: 8 4, 8 2, 6 3, 6 2
                let candidates = []
                for (let couple of [[8, 4], [8, 2], [6, 3], [6, 2]]) {
                    const rrr = removeArray2FromArray1(couple, forbiddenNumbers)
                    if (rrr.length == 2) {
                        candidates.push(couple)
                    }
                }
                if (candidates.length > 0) {
                    const [a, b] = pickRandomElementFromArray(candidates)
                    const result = a / b
                    forbiddenNumbers.push(a)
                    forbiddenNumbers.push(b)
                    forbiddenNumbers.push(result)
                    return { a, operator, b, result }
                }
                return findNextOperation()
            }
        }
    }
    return { a: 0, operator: '+', b: 0, result: 0 }
}

const computeOperation = (a, b, o) => {
    console.log({ a, b, o })
    a = parseInt(a)
    b = parseInt(b)
    let result = {}
    switch (o) {
        case '+':
            result.value = a + b;
            result.valid = true
            break;
        case '-':
            result.value = a - b;
            result.valid = a >= b
            break;
        // TODO avoid multiplication by 1
        // TODO avoid multiplication by the same number as a previous division
        case 'x':
            result.value = a * b;
            result.valid = true
            break;
        // TODO avoid division by the same number as a previous multiplication
        case '/':
            result.value = a / b
            result.valid = a % b == 0
            break;
    }
    return result
}

let level = Number(localStorage.getItem('level')) || 1;

const generateOperation = () => {
    const solution = []
    const symbols = [];
    forbiddenNumbers.length = 0
    forbiddenOperators.length = 0;

    ({ a, operator, b, result } = findNextOperation())
    symbols.push(...[a, operator, b])
    solution.push(`${a} ${operator} ${b} = ${result}`);

    ({ a, operator, b, result } = findNextOperation(result))
    symbols.push(...[operator, b])
    solution.push(`${a} ${operator} ${b} = ${result}`);

    ({ a, operator, b, result } = findNextOperation(result))
    symbols.push(...[operator, b])
    solution.push(`${a} ${operator} ${b} = ${result}`)

    console.log(symbols)
    console.log(solution)
    
    // reroll when result is not nice
    if (result <= 10) {
        generations++
        return generateOperation()
    }
    if (level <= 10 && result > 100) {
        generations++
        return generateOperation()
    }
    if (level > 10 && Math.abs(level - result) > level/15) {
        generations++
        return generateOperation()
    }
    let candidates = Array.from({ length: 10 }, (_, i) => i + 1)
    candidates = removeArray2FromArray1(candidates, forbiddenNumbers)
    const c = pickRandomElementFromArray(candidates)
    const d = pickRandomElementFromArray(candidates)
    symbols.push(c)
    symbols.push(d)
    return { symbols, result, solution }
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
                pressedButtons.push(btn)
                btn.style.background = "red"
                removeElementFromArray(pressableButtons, btn.id)
            }

            if (pressedButtons.length == 3) {
                const operationResult = computeOperation(pressedButtons[0].textContent, pressedButtons[2].textContent, pressedButtons[1].textContent)
                console.log({ operationResult })
                if (!operationResult.valid) {
                    pressedButtons.forEach(b => {
                        b.style.background = null
                        pressableButtons.push(b.id)
                    })
                    pressedButtons.length = 0
                    return
                }

                const btn1 = document.querySelector(`button.btn#${pressedButtons[0].id}`)
                btn1.textContent = ""
                btn1.style.background = "grey"

                const btn2 = document.querySelector(`button.btn#${pressedButtons[1].id}`)
                btn2.textContent = ""
                btn2.style.background = "grey"

                btn.textContent = operationResult.value
                btn.style.background = null

                pressedButtons.length = 0
                pressedButtons.push(btn)
                btn.style.background = "red"

                // VICTORY
                if (operationResult.value == operation.result) {
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

let generations
const newGame = () => {
    document.querySelector(".level").textContent = `Niveau ${level}`

    generations = 0
    operation = generateOperation()
    console.log("operation", operation)
    console.log("generations", generations)
    // 9 items to put in the 3x3 grid of buttons
    gridItems = operation.symbols
    shuffleArray(gridItems)
    console.log("items", gridItems)

    initGridValues()
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initGridListeners()
    newGame()
});
