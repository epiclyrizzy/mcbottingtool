const mineflayer = require('mineflayer');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getUserInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function generateRandomUsername() {
    return Math.random().toString(36).substring(2, 17);
}

async function createBots() {
    const host = await getUserInput('Enter the host: ');
    const port = parseInt(await getUserInput('Enter the port: '), 10);
    const numBots = parseInt(await getUserInput('Enter the number of bots: '), 10);
    const useCustomUsername = (await getUserInput('Do you want to use a custom username? (yes/no): ')).toLowerCase() === 'yes';
    let username;

    if (useCustomUsername) {
        const customUsername = await getUserInput('Enter the custom username: ');
        username = customUsername + '1'; // Add a '1' to the custom username
    } else {
        username = await generateRandomUsername();
    }

    const delay = parseInt(await getUserInput('Enter the delay between bots in milliseconds: '), 10);

    const bots = [];

    for (let i = 0; i < numBots; i++) {
        try {
            const bot = mineflayer.createBot({
                host: host,
                port: port,
                username: username,
            });

            bot.once('kicked', (reason) => {
                console.log(`Bot ${i + 1} was kicked, reason: ${reason}\nTrying to reconnect`);
            });

            bots.push(bot);

            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            console.error(`Error creating bot ${i + 1}:`, error.message);
        }

        if (useCustomUsername) {
            const usernameParts = username.split(/(\d+)/);
            const currentNumber = parseInt(usernameParts[1], 10);
            const nextUsername = usernameParts[0] + (currentNumber + 1);
            username = nextUsername;
        } else {
            username = await generateRandomUsername();
        }
    }
    rl.on('line', async (input) => {
        const [command, ...args] = input.split(' ');
        switch (command.toLowerCase()) {
            case 'help':
                console.log('Available commands:');
                console.log('help - Display this help message');
                console.log('click <amount> - Make the bots click the specified amount of times');
                console.log('walk <seconds> - Make the bots walk for the specified number of seconds');
                console.log('chat <message> - Make the bots chat the specified message');
                console.log('facing <direction> - Make the bots look in the specified direction (left, right, forward, backward, up, down)');
                break;
            case 'click':
                const clickAmount = parseInt(args[0], 10);
                if (!isNaN(clickAmount)) {
                    bots.forEach(async (bot) => {
                        for (let j = 0; j < clickAmount; j++) {
                            await swingArmWithDelay(bot, 500);
                        }
                    });
                } else {
                    console.log('Invalid amount. Usage: click <amount>');
                }
                break;
            case 'walk':
                const walkSeconds = parseFloat(args[0]);
                if (!isNaN(walkSeconds)) {
                    bots.forEach(bot => {
                        bot.setControlState('forward', true);
                        setTimeout(() => {
                            bot.setControlState('forward', false);
                        }, walkSeconds * 1000);
                    });
                } else {
                    console.log('Invalid seconds. Usage: walk <seconds>');
                }
                break;
            case 'chat':
                const message = args.join(' ');
                bots.forEach(bot => {
                    bot.chat(message);
                });
                break;
            case 'facing':
                const direction = args[0];
                if (direction) {
                    bots.forEach(bot => {
                        switch (direction.toLowerCase()) {
                            case 'left':
                                bot.look(Math.PI, 0);
                                break;
                            case 'right':
                                bot.look(0, 0);
                                break;
                            case 'forward':
                                bot.look(0, 0);
                                break;
                            case 'backward':
                                bot.look(Math.PI, 0);
                                break;
                                case 'up':
                                    bot.look(0, Math.PI / 2);
                                    break;
                                case 'down':
                                    bot.look(0, -Math.PI / 2);
                                    break;
                                default:
                                    console.log('Invalid direction. Available directions: left, right, forward, backward, up, down');
                                    break;
                        }
                    });
                } else {
                    console.log('Missing direction. Usage: facing <direction>');
                }
                break;
            default:
                console.log('Unknown command. Type "help" for a list of commands.');
                break;
        }
    });
}

async function swingArmWithDelay(bot, delay) {
    return new Promise(resolve => {
        bot.swingArm();
        setTimeout(resolve, delay);
    });
}

createBots();
