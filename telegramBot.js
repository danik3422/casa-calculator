const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()
const { initializeMoneyHandler } = require('./moneyHandler')
const { getArchivedData } = require('./archiveHandler') // Assuming you have an archive handler file

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

let isBotActive = false // Set initial state to false
let chatContext = {}

const { moneyType, askForValues } = initializeMoneyHandler(bot, chatContext)

bot.on('message', (msg) => {
	if (isBotActive) {
		const chatId = msg.chat.id
		const message = msg.text.toString()
		const currentKey = chatContext[chatId]?.currentKey
		// Check if the message is a valid number
		const value = parseFloat(message)
		if (!isNaN(value) && currentKey !== undefined && value >= 0) {
			// Update moneyType object with the user's input
			moneyType[currentKey] = value
			const remainingKeys = chatContext[chatId]?.remainingKeys
			if (remainingKeys && remainingKeys.length > 0) {
				// Get the next key from the remaining keys
				const nextKey = remainingKeys.shift()
				// Update the context with the next key and remaining keys
				chatContext[chatId] = { currentKey: nextKey, remainingKeys }
				// Ask for the value of the next key
				askForValues(chatId)
			} else {
				// No remaining keys, all values have been set
				chatContext[chatId] = { currentKey: undefined, remainingKeys: [] }
				askForValues(chatId)
			}
		} else {
			bot.sendMessage(
				chatId,
				'Invalid input. Please enter a valid number for the value.'
			)
		}
	}
})

bot.on('callback_query', (query) => {
	if (query.data === 'start_bot') {
		const chatId = query.message.chat.id
		const keys = Object.keys(moneyType).sort((a, b) => b - a)

		// Initialize context with the first key and remaining keys
		chatContext[chatId] = { currentKey: keys.shift(), remainingKeys: keys }
		askForValues(chatId)
		isBotActive = true // Set the bot active flag to true when starting the bot
	}
})

bot.onText(/\/start/, (msg) => {
	const chatId = msg.chat.id
	bot.sendMessage(chatId, 'Click the button below to start the bot.', {
		reply_markup: {
			inline_keyboard: [[{ text: 'Start Bot', callback_data: 'start_bot' }]],
		},
	})
})

bot.onText(/\/stop/, (msg) => {
	const chatId = msg.chat.id
	bot.sendMessage(chatId, 'Bot stopped.')
	isBotActive = false // Set isBotActive to false when /stop command is received
})

bot.onText(/\/archive/, (msg) => {
	const chatId = msg.chat.id

	const archivedData = getArchivedData(chatId) // Assuming getArchivedData function is defined elsewhere
	if (archivedData) {
		bot.sendMessage(chatId, 'Archived Data:\n' + archivedData)
	} else {
		bot.sendMessage(chatId, 'No archived data available.')
	}
})

module.exports = { bot }
