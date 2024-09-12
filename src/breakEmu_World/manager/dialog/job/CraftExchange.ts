import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import Character from "@breakEmu_API/model/character.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import Item from "@breakEmu_API/model/item.model"
import Recipe from "@breakEmu_API/model/recipe.model"
import Skill from "@breakEmu_API/model/skill.model"
import Logger from "@breakEmu_Core/Logger"
import {
	CharacterInventoryPositionEnum,
	CraftResultEnum,
	DialogTypeEnum,
	ExchangeCraftCountModifiedMessage,
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
			if (this.character.isCraftDialog) {
				this.character.removeDialog()
				await this.jobInventory.clear(this)
				await DialogHandler.leaveDialogMessage(
					this.character.client as WorldClient,
					DialogTypeEnum.DIALOG_EXCHANGE
				)
				await this.character.inventory.refresh()
			}
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
					await this.performCraft(recipe)
				} else {
					await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
				}
			} else {
				await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
			}
		}
	}

	public getCurrentRecipe(): Recipe | undefined {
		return Recipe.getRecipeByResultId(this.lastRecipeId)
	}

	public async setRecipe(recipeId: number): Promise<void> {
		const recipe = Recipe.getRecipeByResultId(recipeId)

		if (this.jobInventory.items.size > 0) {
			await this.jobInventory.clear(this)
		}

		if (recipe) {
			try {
				console.log(`Setting recipe ${recipeId}`)
				this.lastRecipeId = recipeId

				for (const ingredient of recipe.ingredients) {
					const characterItem = await this.character.inventory.getItemByGid(
						ingredient.id
					)

					if (characterItem) {
						await this.jobInventory.addItem(
							characterItem,
							ingredient.quantity
						)
					}
				}
			} catch (error) {
				console.log(error)
			}
		}
	}

	public async performCraft(recipe: Recipe): Promise<void> {
		try {
			if (!this.jobInventory.isJobInventoryEqualsToRecipeIngredients(recipe))
				return

			const itemAndQuantityToModify = new Map<CharacterItem, number>()
			const itemCraftedToAdd = new Map<Item, number>()
			const ingredients = recipe.ingredients.reduce((map, ingredient) => {
				const item = Item.getItem(ingredient.id)
				if (item) map.set(item, ingredient.quantity)
				return map
			}, new Map<Item, number>())
			const resultCraft = Item.getItem(recipe.resultId)

			for (let i = 0; i < this.count; i++) {
				for (const [ingredient, quantity] of ingredients) {
					const itemInJobInventory = await this.jobInventory.getItemByGid(
						ingredient.id
					)
					if (itemInJobInventory && itemInJobInventory.quantity >= quantity) {
						itemAndQuantityToModify.set(
							itemInJobInventory,
							(itemAndQuantityToModify.get(itemInJobInventory) || 0) + quantity
						)
					}
				}
				itemCraftedToAdd.set(
					resultCraft,
					(itemCraftedToAdd.get(resultCraft) || 0) + 1
				)
			}

			const ItemFromPlayerInventoryToSave = await Promise.all(
				Array.from(itemAndQuantityToModify).map(async ([item, quantity]) => {
					item.quantity -= quantity
					return this.character.inventory.getItemByGid(item.gId)
				})
			)

			const craftResult = (
				await Promise.all(
					Array.from(itemCraftedToAdd).map(([item, quantity]) =>
						this.character.inventory.addNewItem(item.id, quantity)
					)
				)
			)
				.filter(Boolean)
				.pop()

			await Promise.all(
				ItemFromPlayerInventoryToSave.filter(Boolean).map((item) =>
					this.character.inventory.updateItem(item as CharacterItem)
				)
			)

			await this.handleCraftResult(recipe, craftResult as CharacterItem)
			await this.addExperience(recipe)

			await this.jobInventory.clear(this)
		} catch (error) {
			console.error("Error during crafting:", error)
			await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
		}
	}

	private async handleCraftResult(
		recipe: Recipe,
		resultItem: CharacterItem | undefined
	): Promise<void> {
		console.log("handleCraftResult")

		try {
			if (resultItem) {
				if (resultItem.quantity > 1) {
					const obj = new ObjectItemNotInContainer(
						resultItem.gId,
						resultItem.effects.getObjectEffects(),
						0,
						resultItem.quantity
					)
					await this.onCraftResult(CraftResultEnum.CRAFT_SUCCESS, obj)
				} else {
					const obj = await resultItem.getObjectItemNotInContainer()
					await this.onCraftResult(CraftResultEnum.CRAFT_SUCCESS, obj)
				}
			}
		} catch (error) {
			console.error("Error handling craft result:", error)
			await this.onCraftResult(CraftResultEnum.CRAFT_FAILED)
		}
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

	private async addExperience(recipe: Recipe): Promise<void> {
		const craftXpRatio = recipe.resultItem.craftXpRatio
		const exp = this.container
			.get(JobFormulas)
			.getCraftExperience(
				recipe.resultItem.level,
				this.characterJob.level,
				craftXpRatio
			)

		await this.character.addJobExperience(
			this.characterJob.jobId,
			exp * this.count
		)
	}

	public async onJobInventoryCleared(): Promise<void> {
		this.resetCount()
	}

	public modifyItemPriced(
		objectUID: number,
		quantity: number,
		price: number
	): void {
		throw new Error("Method not implemented.")
	}

	public moveKamas(quantity: number): void {
		throw new Error("Method not implemented.")
	}
}

export default CraftExchange
