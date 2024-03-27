const initializeMoneyHandler = (telegramBot, chatContext) => {
	const bot = telegramBot

	const moneyType = {
		500: 0,
		200: 0,
		100: 0,
		50: 0,
		20: 0,
		10: 0,
		5: 0,
		2: 0,
		1: 0,
		0.5: 0,
		0.2: 0,
		0.1: 0,
		0.05: 0,
		0.02: 0,
		0.01: 0,
	}

	const askForValues = (chatId) => {
		const currentKey = chatContext[chatId]?.currentKey
		const remainingKeys = chatContext[chatId]?.remainingKeys

		if (currentKey !== undefined) {
			bot
				.sendMessage(chatId, 'Enter the value for ' + currentKey + ':')
				.then(() => {
					// Store the current key and remaining keys in the chat's context
					chatContext[chatId] = { currentKey, remainingKeys }
				})
				.catch((error) => {
					console.error('Error sending message:', error)
				})
		} else {
			// All values have been set, show result to the user
			const result = Object.entries(moneyType)
				.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
				.map(([key, value]) => `${key}: ${value}`)
				.join('\n')

			const totalMoney = sumDenominations(moneyType)
			const moneyInCasa = sumSmallDenominations(moneyType)

			const message = `🕗 ${
				new Date().toISOString().split('T')[0]
			}\n\n${result}\n\nAll money: ${totalMoney} PLN\nMoney in casa: ${moneyInCasa} PLN`

			bot.sendMessage(chatId, message)
		}
	}

	const sumDenominations = (obj) => {
		let resultSum = 0

		for (let key in obj) {
			const multiplier = obj[key]
			const multipliedValue = key * multiplier
			resultSum += multipliedValue
		}
		return resultSum.toFixed(2)
	}

	const sumSmallDenominations = (obj) => {
		let resultSmall = 0

		for (let key in obj) {
			if (![500, 200, 100, 50, 20, 10].includes(Number(key))) {
				const multiplier = obj[key]
				const multipliedValue = key * multiplier
				resultSmall += multipliedValue
			}
		}
		return resultSmall.toFixed(2)
	}

	// Return necessary functions or variables
	return { askForValues, sumDenominations, sumSmallDenominations, moneyType }
}

module.exports = { initializeMoneyHandler }
