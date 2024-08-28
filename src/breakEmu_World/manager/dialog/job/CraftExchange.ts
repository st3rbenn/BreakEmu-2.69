import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Character from "@breakEmu_API/model/character.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import Item from "@breakEmu_API/model/item.model"
import Recipe from "@breakEmu_API/model/recipe.model"
import Skill from "@breakEmu_API/model/skill.model"
import Logger from "@breakEmu_Core/Logger"
import {
  CraftResultEnum,
  DialogTypeEnum,
  ExchangeCraftResultMessage,
  ExchangeCraftResultWithObjectDescMessage,
  ExchangeStartOkCraftWithInformationMessage,
  ObjectItemNotInContainer,
} from "@breakEmu_Protocol/IO"
import DialogHandler from "@breakEmu_World/handlers/dialog/DialogHandler"
import JobFormulas from "@breakEmu_World/manager/formulas/JobFormulas"
import WorldClient from "@breakEmu_World/WorldClient"
import JobExchange from "./JobExchange"

class CraftExchange extends JobExchange {
	logger: Logger = new Logger("CraftExchange")

	lastRecipeId: number = 0

	private result: Map<number, CharacterItem> = new Map()
	private removed: Map<number, number> = new Map()

	constructor(character: Character, skill: Skill) {
		super(character, skill)
	}

	public async open(): Promise<void> {
		try {
			this.character.isCraftDialog = true
			await this.character.client.Send(
				new ExchangeStartOkCraftWithInformationMessage(this.skill.id)
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	async close(): Promise<void> {
		try {
			await this.jobInventory.clear()
			this.character.removeDialog()
			this.character.isCraftDialog = false
			await DialogHandler.leaveDialogMessage(
				this.character.client as WorldClient,
				DialogTypeEnum.DIALOG_EXCHANGE
			)
		} catch (error) {
			this.logger.error(error as any)
		}
	}

	public setCount(count: number): void {
		if (count > 0 && count <= JobExchange.COUNT_LIMIT) {
			this.count = count
		} else {
			this.resetCount()
		}
	}

	public async ready(ready: boolean, step: number): Promise<void> {
		if (ready) {
			const recipe = this.getCurrentRecipe()

			if (
				recipe &&
				recipe.job === this.characterJob.jobId &&
				recipe.skill === this.skill.id
			) {
				const result = Item.getItem(recipe.resultId)

				if (result.level <= this.characterJob.level || !result) {
					console.log("Performing craft")
					await this.performCraft(recipe)
				} else {
					console.log("Craft failed because of level")
					await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
				}
			} else {
				console.log("Craft failed because of recipe")
				await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
			}
		}
	}

	public getCurrentRecipe(): Recipe | undefined {
		return Recipe.getRecipeByResultId(this.lastRecipeId)
	}

	public moveKamas(quantity: number): void {
		throw new Error("Method not implemented.")
	}

	public async setRecipe(recipeId: number): Promise<void> {
		const recipe = Recipe.getRecipeByResultId(recipeId)

		if (this.jobInventory.items.size > 0) {
			await this.jobInventory.clear()
		}

		if (recipe) {
			try {
				console.log(`Setting recipe ${recipeId}`)
				for (const ingredient of recipe.ingredients) {
					const characterItem = await this.character.inventory.getItemByGid(
						ingredient.id
					)

					if (characterItem !== null) {
						const itemRes = await CharacterItemController.getInstance().cutItem(
							characterItem,
							ingredient.quantity
						)
						await this.jobInventory.moveItem(itemRes, ingredient.quantity)
					}
				}

				this.lastRecipeId = recipeId
			} catch (error) {
				console.log(error)
			}
		}
	}

	// public async performCraft(recipe: Recipe): Promise<void> {
	// 	const result: Map<number, CharacterItem> = new Map()
	// 	const removed: Map<number, number> = new Map()

	//   const itemToDelete: CharacterItem[] = []

	// 	for (let i = 0; i < this.count; i++) {
	// 		for (const ingredient of this.jobInventory.items.values()) {
	// 			if (!removed.has(ingredient.gId)) {
	// 				removed.set(ingredient.gId, ingredient.quantity)
	// 			} else {
	// 				removed.set(
	// 					ingredient.gId,
	// 					removed.get(ingredient.gId)! + ingredient.quantity
	// 				)
	// 			}
	// 		}

	// 		try {
	// 			const item = await this.character.inventory.addNewItem(
	//         recipe.resultId,
	//         1
	//       )

	// 			if (item) {
	// 				result.set(recipe.resultId, item)
	// 			}
	// 		} catch (error) {
	// 			console.log(error)
	// 		}
	// 	}

	// 	for (const [gid, quantity] of removed) {
	// 		const item = await this.character.inventory.getItemByGid(gid)

	// 		if (item) {
	//       if (item.quantity < quantity) {
	//         itemToDelete.push(item)
	//       }
	//     }
	// 	}

	// 	if (result.size == 1) {
	// 		const obj = await result
	// 			.values()
	// 			.next()
	// 			.value?.getObjectItemNotInContainer()
	// 		await this.onCraftResult(CraftResultEnum.CRAFT_SUCCESS, obj)

	//     // await this.character.inventory.removeItems(itemToDelete)
	// 	} else {
	// 		await this.onCraftResult(
	// 			CraftResultEnum.CRAFT_SUCCESS,
	// 			new ObjectItemNotInContainer(
	// 				recipe.resultId,
	// 				recipe.resultItem.effects.getObjectEffects(),
	// 				0,
	// 				this.count
	// 			)
	// 		)
	// 	}

	// 	const craftXpRatio = recipe.resultItem.craftXpRatio
	// 	const exp = JobFormulas.getInstance().getCraftExperience(
	// 		recipe.resultItem.level,
	// 		this.characterJob.level,
	// 		craftXpRatio
	// 	)

	// 	await this.character.addJobExperience(
	// 		this.characterJob.jobId,
	// 		exp * this.count
	// 	)
	// 	await this.jobInventory.clear()
	//   await this.character.inventory.refresh()
	// 	this.resetCount()
	// }

	public async performCraft(recipe: Recipe): Promise<void> {
		const result: Map<number, CharacterItem> = new Map()
		const removed: Map<number, number> = new Map()
		const itemsToDelete: CharacterItem[] = []

		try {
			await this.processIngredients(recipe, removed)
			await this.createCraftedItems(recipe, result)
			await this.validateAndMarkItemsForDeletion(recipe, removed, itemsToDelete)
			await this.handleCraftResult(recipe, result)
			await this.addExperienceAndCleanup(recipe)
		} catch (error) {
			console.error("Error during crafting:", error)
			await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
		}
	}

	private async processIngredients(
		recipe: Recipe,
		removed: Map<number, number>
	): Promise<void> {
		for (let i = 0; i < this.count; i++) {
			for (const ingredient of this.jobInventory.items.values()) {
				const currentQuantity = removed.get(ingredient.gId) || 0
				removed.set(ingredient.gId, currentQuantity + ingredient.quantity)
			}
		}
	}

	private async createCraftedItems(
		recipe: Recipe,
		result: Map<number, CharacterItem>
	): Promise<void> {
		for (let i = 0; i < this.count; i++) {
			try {
				const item = await this.character.inventory.addNewItem(
					recipe.resultId,
					1
				)
				if (item) {
					result.set(recipe.resultId, item)
				}
			} catch (error) {
				console.error("Error adding new item:", error)
			}
		}
	}

	private async validateAndMarkItemsForDeletion(
		recipe: Recipe,
		removed: Map<number, number>,
		itemsToDelete: CharacterItem[]
	): Promise<void> {
		for (const [gid, quantity] of removed) {
			const item = await this.character.inventory.getItemByGid(gid)
			const ingredient = recipe.ingredients.find((i) => i.id === gid)
			console.log(`Checking item ${gid} - ${quantity}`)
			if (item) {
				if (item.quantity <= quantity) {
					console.log(
						`Marking item ${gid} for deletion because quantity is ${item.quantity} <= ${quantity}`
					)
					itemsToDelete.push(item)
				} else {
					item.quantity -=
						quantity - ((ingredient && ingredient?.quantity) || 0)
					console.log(`Reducing quantity of item ${gid} to ${item.quantity}`)

					await this.character.inventory.updateItem(item)
				}
			} else {
				console.error(`Item with gId ${gid} not found in inventory`)
			}
		}

		if (itemsToDelete.length > 0) {
			await this.character.inventory.removeItems(itemsToDelete)
		}
	}

	private async handleCraftResult(
		recipe: Recipe,
		result: Map<number, CharacterItem>
	): Promise<void> {
		if (result.size === 1) {
			const craftedItem = result.values().next().value
			const obj = await craftedItem?.getObjectItemNotInContainer()
			await this.onCraftResult(CraftResultEnum.CRAFT_SUCCESS, obj)
		} else {
			const obj = new ObjectItemNotInContainer(
				recipe.resultId,
				recipe.resultItem.effects.getObjectEffects(),
				0,
				this.count
			)
			await this.onCraftResult(CraftResultEnum.CRAFT_SUCCESS, obj)
		}
	}

	private async addExperienceAndCleanup(recipe: Recipe): Promise<void> {
		const craftXpRatio = recipe.resultItem.craftXpRatio
		const exp = JobFormulas.getInstance().getCraftExperience(
			recipe.resultItem.level,
			this.characterJob.level,
			craftXpRatio
		)

		await this.character.addJobExperience(
			this.characterJob.jobId,
			exp * this.count
		)
		await this.jobInventory.clear()
		// await this.character.inventory.refresh()
		this.resetCount()
	}

	public async onCraftResult(
		result: CraftResultEnum,
		obj?: ObjectItemNotInContainer
	): Promise<void> {
		if (!obj) {
			await this.character.client.Send(new ExchangeCraftResultMessage(result))
		} else {
			await this.character.client.Send(
				new ExchangeCraftResultWithObjectDescMessage(result, obj)
			)
		}
	}

	public modifyItemPriced(
		objectUID: number,
		quantity: number,
		price: number
	): void {
		throw new Error("Method not implemented.")
	}
}

export default CraftExchange
