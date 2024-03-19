import MarkovChain from "../../../breakEmu_Core/MarkovChain"
import { CharacterNameSuggestionSuccessMessage } from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

// class RandomCharacterNameHandler {
// 	private static syllables: string[] = [
// 		"ra",
// 		"mi",
// 		"fa",
// 		"so",
// 		"la",
// 		"ti",
// 		"do",
// 		"ku",
// 		"na",
// 		"te",
// 		"shi",
// 		"ru",
// 	]

// 	private static capitalizeFirstLetter(word: string): string {
// 		return word.charAt(0).toUpperCase() + word.slice(1)
// 	}

// 	private static generatePseudoPart(minLength: number, maxLength: number): string {
// 		let pseudoPart = ""
// 		const length =
// 			Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

// 		for (let i = 0; i < length; i++) {
// 			pseudoPart += this.syllables[
// 				Math.floor(Math.random() * this.syllables.length)
// 			]
// 		}

// 		return this.capitalizeFirstLetter(pseudoPart)
// 	}

// 	public static async handleCharacterNameSuggestionRequestMessage(
// 		client: WorldClient
// 	) {
// 		const firstPartLength = Math.floor(Math.random() * 7) + 3 // Longueur de 3 à 9
// 		const firstPart = this.generatePseudoPart(2, firstPartLength - 1) // -1 pour la lettre majuscule

// 		let suggestedName = firstPart

// 		// Décider aléatoirement si on ajoute un deuxième segment après un tiret
// 		if (Math.random() < 0.5) {
// 			const secondPartLength = Math.floor(Math.random() * 7) + 3 // Longueur de 3 à 9
// 			const secondPart = this.generatePseudoPart(2, secondPartLength - 1) // -1 pour la lettre majuscule ou minuscule
// 			suggestedName += "-" + secondPart
// 		}

// 		// Utilisez ici suggestedName pour votre logique supplémentaire
// 		await client.Send(
// 			client.serialize(new CharacterNameSuggestionSuccessMessage(suggestedName))
// 		)
// 	}
// }

class RandomCharacterNameHandler {
	private static syllables: string[] = [
		"ra",
		"mi",
		"fa",
		"so",
		"la",
		"ti",
		"do",
		"ku",
		"na",
		"te",
		"shi",
		"ru",
	]
	private static names: string[] = [
		"Lara",
		"Jonas",
		"Mirabel",
		"Theodore",
		"Cassandra",
		"Raphael",
		"Morgane",
		"Lancelot",
		"Guenievre",
		"Arthur",
		"Merlin",
		"Morgause",
		"Perceval",
		"Galahad",
		"Leodagan",
		"Seli",
		"Bohort",
		"Karadoc",
		"Dagonet",
		"Yvain",
		"Gauvain",
		"Lionel",
		"Bors",
		"Lamorak",
		"Agloval",
	]
	// Initialisez MarkovChain avec null et vérifiez avant utilisation
	private static markovChain: MarkovChain | null = null

	public static async handleCharacterNameSuggestionRequestMessage(
		client: WorldClient
	) {
		if (!this.markovChain) {
			this.markovChain = new MarkovChain([...this.names, ...this.syllables])
		}

		// Génère le premier segment et capitalise la première lettre
		let suggestedName = this.capitalizeFirstLetter(
			this.markovChain.generateWord(3, 5).toLowerCase()
		)

		// Décider aléatoirement si on ajoute un deuxième segment après un tiret
		if (Math.random() < 0.5) {
			// Génère le deuxième segment, le convertit en minuscules, et capitalise la première lettre
			suggestedName +=
				"-" +
				this.capitalizeFirstLetter(
					this.markovChain.generateWord(3, 5).toLowerCase()
				)
		}

		// Utilisez ici suggestedName pour votre logique supplémentaire
		await client.Send(
			new CharacterNameSuggestionSuccessMessage(suggestedName)
		)
	}

	private static capitalizeFirstLetter(word: string): string {
		return word.charAt(0).toUpperCase() + word.slice(1)
	}

	public static setMarkovChain(chain: MarkovChain) {
		this.markovChain = chain
	}
}

export default RandomCharacterNameHandler
