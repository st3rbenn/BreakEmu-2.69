class AsyncRandom {
	private static incrementer: number = 0

	constructor(seed?: number) {
		// En JavaScript/TypeScript, il n'y a pas de moyen direct de paramétrer le générateur de nombres aléatoires global avec une graine (seed).
		// Cette implémentation est donc une approximation.
		AsyncRandom.incrementer++
	}

	private random(): number {
		// JavaScript utilise Math.random() pour générer un nombre aléatoire entre 0 (inclus) et 1 (exclus).
		return Math.random()
	}

	public nextDouble(min: number, max: number): number {
		return this.random() * (max - min) + min
	}

	public next(min: number, max: number): number {
		// Génère un nombre aléatoire entre min (inclus) et max (exclus).
		return Math.floor(this.random() * (max - min) + min)
	}
}

export default AsyncRandom
