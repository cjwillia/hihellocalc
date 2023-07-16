import inquirer from 'inquirer'


inquirer.prompt([
    {
        type: 'input',
        name: 'echo',
        message: 'say hello >'
    }
]).then(response => {
    console.log(response['echo'])
})