const archive = {}

const archiveMessage = (chatId, data) => {
	if (!archive[chatId]) {
		archive[chatId] = []
	}
	archive[chatId].push(data)
}

const getArchivedData = (chatId) => {
	return archive[chatId] ? archive[chatId].join('\n') : null
}
