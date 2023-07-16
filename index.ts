import inquirer from 'inquirer'

class Calculator {

}

class InputParser {
    operatorsRegExp = /[\+\-\*\/\!\%]/
    operandsRegExp = /[\d]+/
    parseInput(input: string) {
        const checkValidInput = input.match(/\d|[\+\-\*\/\!\%]/g) 
        if (!checkValidInput || checkValidInput.length != input.length) {
            return null
        }

        const operands = input.split(this.operatorsRegExp).filter(s => s.length)
        const operators = input.split(this.operandsRegExp).filter(s => s.length)
        return {operands, operators}
    }
}

const main = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'expression',
            message: 'parse input >'
        }
    ]).then(response => {
        const expression = response['expression']
        if (expression === 'q') {
            console.log('quitting...')
        } else {
            const parser = new InputParser()
            const parsedInput = parser.parseInput(expression)
            console.log(parsedInput !== null ? JSON.stringify(parsedInput) : 'invalid calculator input') 
            main()
        }
    })
}

main()
