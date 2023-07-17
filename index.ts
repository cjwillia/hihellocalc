import inquirer from 'inquirer'

class Calculator {
    previousValue: number
    display: number
    previousOperator: string | null
    parser: InputParser

    constructor() {
        this.previousValue = 0
        this.display = 0
        this.previousOperator = null
        this.parser = new InputParser()
    }

    calc(input: string) {
        const parsedInput = this.parser.parseInput(input);

        if (!parsedInput) return 'invalid calculator input'

        let currentValue = this.previousValue
        let nextOperandIndex = 0
        let nextOperatorIndex = 0

        let currentlyMidCombination = false
        // check previous operator for combining operation
        if (this.previousOperator !== null) {
            if (this.parser.isCombiningOperation(this.previousOperator)) {
                parsedInput.operators.unshift(this.previousOperator)
                currentlyMidCombination = true
            }
            this.previousOperator = null
        }

        // if we are starting with an operand and not currently in a combining operation, start fresh with first operand
        if (parsedInput.startsWithOperand && !currentlyMidCombination) {
            currentValue = parsedInput.operands[0]
            nextOperandIndex = 1
            this.display = currentValue
        }

        while (nextOperandIndex < parsedInput.operands.length
            || nextOperatorIndex < parsedInput.operators.length) {
            const nextOperand = parsedInput.operands[nextOperandIndex]
            const nextOperator = parsedInput.operators[nextOperatorIndex]

            if (!this.parser.isCombiningOperation(nextOperator)) {
                currentValue = this.performInPlaceOperation(currentValue, nextOperator)
                nextOperatorIndex++
            } else if (this.parser.isCombiningOperation(nextOperator) && nextOperand !== undefined) {
                this.display = nextOperand
                currentValue = this.performCombiningOperation(currentValue, nextOperator, nextOperand)
                nextOperandIndex++
                nextOperatorIndex++
            } else {
                // if we are not doing an in-place operation and we do not have an operand for the next operation, we break out of the loop and continue
                break
            }
        }

        if (!parsedInput.endsWithOperand && parsedInput.operators.length) {
            const lastOperator = parsedInput.operators[parsedInput.operators.length - 1]
            this.previousOperator = lastOperator
            this.display = currentValue
        }

        this.previousValue = currentValue

        return this.display
    }

    performCombiningOperation(currentValue: number, operator: string, operand: number) {
        switch(operator) {
            case '+':
                return currentValue + operand
            case '-':
                return currentValue - operand
            case '*':
                return currentValue * operand
            case '/':
                return currentValue / operand
            default:
                return currentValue
        }
    }

    performInPlaceOperation(currentValue: number, operator: string) {
        switch(operator) {
            case '=':
                this.display = currentValue
                return currentValue
            case '!':
                return -currentValue
            case 'c':
                this.display = 0
                return 0
            default:
                return currentValue
        }
    }
}

class InputParser {
    operatorsRegExp: RegExp
    operandsRegExp: RegExp

    constructor() {
        this.operatorsRegExp = /[\+\-\*\/\!\%\=\c]/
        this.operandsRegExp = /[\d]+/
    }

    parseInput(input: string) {
        input = input.replace(/\s/g, "")
        const checkValidInput = input.match(/\d|[\+\-\*\/\!\%\=\c]/g) 
        if (!checkValidInput || checkValidInput.length != input.length)
            return null

        const operands = input.split(this.operatorsRegExp).filter(s => s && s.length).map(s => Number(s))
        const operators = this.flattenOperators(input.split(this.operandsRegExp).filter(s => s && s.length))
        
        const startsWithOperand = input[0].match(/\d/g) !== null
        const endsWithOperand = input[input.length - 1].match(/\d/g) !== null

        return {operands, operators, startsWithOperand, endsWithOperand}
    }

    isCombiningOperation(operator: string) {
        return ['+', '-', '*', '/'].indexOf(operator) !== -1
    }

    flattenOperators(operators: string[]) {
        return operators.map(operatorEntry => {
            if (operatorEntry.length > 1) {
                let newOperatorSet = []
                let i = 0
                while (i < operatorEntry.length) {
                    // if this is an in-place operation, the last operation, or the next operation is in-place, add to set
                    if (!this.isCombiningOperation(operatorEntry[i])
                        || i + 1 === operatorEntry.length
                        || (operatorEntry[i + 1] !== undefined && !this.isCombiningOperation(operatorEntry[i + 1]))) {
                        newOperatorSet.push(operatorEntry[i])
                    }
                    i++
                }
                return newOperatorSet
            }
            return operatorEntry
        }).flat()
    }
}

const calculator = new Calculator()

const main = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'expression',
            message: 'calc >'
        }
    ]).then(response => {
        const expression = response['expression']
        if (expression === 'q') {
            console.log('quitting...')
        } else {
            let val = calculator.calc(expression)
            console.log(val)
            main()
        }
    })
}

console.log(0)
main()
