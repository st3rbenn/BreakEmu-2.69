class MarkovChain {
	private model: Map<string, string[]> = new Map()

	constructor(words: string[]) {
		this.buildModel(words)
	}

	private buildModel(words: string[]) {
		for (const word of words) {
      word.toLowerCase()
			// Assurez-vous d'inclure des états initiaux et finaux pour gérer le début et la fin des mots
			const chars = ["^", ...word.split(""), "$"] // Utilisez ^ pour le début et $ pour la fin
			for (let i = 0; i < chars.length - 1; i++) {
				const current = chars[i]
				const next = chars[i + 1]
				if (!this.model.has(current)) {
					this.model.set(current, [])
				}
				this.model.get(current)?.push(next)
			}
		}
	}

	generateWord(minLength: number, maxLength: number): string {
		let currentChar = "^"
		let word = ""

		// Garantit que le mot généré respecte la longueur minimale
		while (word.length < minLength || currentChar !== "$") {
			const nextChars = this.model.get(currentChar) || ["^"] // Retour au début si aucune option
			currentChar = nextChars[Math.floor(Math.random() * nextChars.length)]
			if (currentChar === "$") {
				if (word.length >= minLength) break
				// Fin si la longueur minimale est atteinte
				else currentChar = "^" // Sinon, redémarrez
			} else {
				word += currentChar
			}
			if (word.length >= maxLength) break // Termine si la longueur maximale est atteinte
		}

		return word
	}
}

export default MarkovChain
