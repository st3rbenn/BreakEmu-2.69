import { CharacterNameSuggestionSuccessMessage } from "../../../breakEmu_Server/IO"
import WorldClient from "../../../breakEmu_World/WorldClient"

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

	private static capitalizeFirstLetter(word: string): string {
		return word.charAt(0).toUpperCase() + word.slice(1)
	}

	private static generatePseudoPart(minLength: number, maxLength: number): string {
		let pseudoPart = ""
		const length =
			Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

		for (let i = 0; i < length; i++) {
			pseudoPart += this.syllables[
				Math.floor(Math.random() * this.syllables.length)
			]
		}

		return this.capitalizeFirstLetter(pseudoPart)
	}

	public static async handleCharacterNameSuggestionRequestMessage(
		client: WorldClient
	) {
		const firstPartLength = Math.floor(Math.random() * 7) + 3 // Longueur de 3 à 9
		const firstPart = this.generatePseudoPart(2, firstPartLength - 1) // -1 pour la lettre majuscule

		let suggestedName = firstPart

		// Décider aléatoirement si on ajoute un deuxième segment après un tiret
		if (Math.random() < 0.5) {
			const secondPartLength = Math.floor(Math.random() * 7) + 3 // Longueur de 3 à 9
			const secondPart = this.generatePseudoPart(2, secondPartLength - 1) // -1 pour la lettre majuscule ou minuscule
			suggestedName += "-" + secondPart
		}

		// Utilisez ici suggestedName pour votre logique supplémentaire
		await client.Send(
			client.serialize(new CharacterNameSuggestionSuccessMessage(suggestedName))
		)
	}
}

export default RandomCharacterNameHandler
