import inquirer from 'inquirer'

type ParsedInput = {
    operands: number[];
    operators: string[];
    startsWithOperand: boolean;
    endsWithOperand: boolean;
}

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

        let currentValue = this.iterateOperations(parsedInput);

        if (!parsedInput.endsWithOperand && parsedInput.operators.length) {
            const lastOperator = parsedInput.operators[parsedInput.operators.length - 1]
            this.previousOperator = lastOperator
            this.display = currentValue
        }

        this.previousValue = currentValue

        return this.display
    }

    private iterateOperations(parsedInput: ParsedInput) {
        let currentValue = this.previousValue
        let nextOperandIndex = 0
        let nextOperatorIndex = 0

        let currentlyMidCombination = this.checkIfCurrentlyInCombiningOperation(parsedInput)

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
                // if we are not doing an in-place operation and we do not have an operand to perform a combining operation, we break out of the loop and continue
                break;
            }
        }
        return currentValue;
    }

    private performCombiningOperation(currentValue: number, operator: string, operand: number) {
        switch(operator) {
            case '+':
                return currentValue + operand
            case '-':
                return currentValue - operand
            case '*':
                return currentValue * operand
            case '/':
                return currentValue / operand
            case '%':
                // not implemented. there are multiple different calculator behaviors for this operator
                // for the more complex solutions, we would likely want to keep a longer history of values
                // rather than current and previous, as the % operator can refer to two values prior
            default:
                return currentValue
        }
    }

    private performInPlaceOperation(currentValue: number, operator: string) {
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

    private checkIfCurrentlyInCombiningOperation(parsedInput: ParsedInput) {
        let currentlyMidCombination: boolean = false
        if (this.previousOperator !== null) {
            if (this.parser.isCombiningOperation(this.previousOperator)) {
                parsedInput.operators.unshift(this.previousOperator)
                currentlyMidCombination = true
            }
            this.previousOperator = null
        }
        return currentlyMidCombination
    }
}

class InputParser {
    static readonly operatorsRegExp: RegExp = /[\+\-\*\/\!\%\=\c]/
    static readonly operandsRegExp: RegExp = /[\d]+/

    parseInput(input: string): ParsedInput | null {
        input = input.replace(/\s/g, "")
        const checkValidInput = input.match(/\d|[\+\-\*\/\!\%\=\c]/g) 
        if (!checkValidInput || checkValidInput.length != input.length)
            return null

        const operands = input.split(InputParser.operatorsRegExp).filter(s => s && s.length).map(s => Number(s))
        const rawOperators = input.split(InputParser.operandsRegExp).filter(s => s && s.length)
        
        const operators = this.flattenOperators(rawOperators)
        const startsWithOperand = input[0].match(/\d/g) !== null
        const endsWithOperand = input[input.length - 1].match(/\d/g) !== null

        return {operands, operators, startsWithOperand, endsWithOperand}
    }

    isCombiningOperation(operator: string) {
        return ['+', '-', '*', '/'].indexOf(operator) !== -1
    }

    // Separate out stacked operators and remove unused commands
    // Turns ["+", "+!/+-c*", "+"] into ["+", "!", "c", "+"]
    private flattenOperators(operators: string[]) {
        return operators.map(operatorEntry => {
            if (operatorEntry.length > 1) {
                let newOperatorSet = []
                let i = operatorEntry.length
                let lastCombiningOperation
                while (i >= 0) {
                    const operation = operatorEntry[i]
                    if (!this.isCombiningOperation(operation))
                        newOperatorSet.unshift(operation)
                    else if (!lastCombiningOperation) {
                        lastCombiningOperation = operation
                        newOperatorSet.unshift(operation)
                    }
                    i--
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
