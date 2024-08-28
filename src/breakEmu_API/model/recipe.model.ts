import Item from "./item.model"
import Job from "./job.model"
import Skill from "./skill.model"

class Recipe {
	id: number
	resultId: number
	resultName: string
	resultType: number
	resultLevel: number
	ingredients: Array<{
		id: number
		quantity: number
	}>
	job: number
	skill: number

  resultItem: Item

	public static recipes: Map<number, Recipe> = new Map<number, Recipe>()

	constructor(
		id: number,
		resultId: number,
		resultName: string,
		resultType: number,
		resultLevel: number,
		ingredients: Array<{
			id: number
			quantity: number
		}>,
		jobId: number,
		skillId: number
	) {
		this.id = id
		this.resultId = resultId
		this.resultName = resultName
		this.resultType = resultType
		this.resultLevel = resultLevel
		this.ingredients = ingredients
		this.job = jobId
		this.skill = skillId
	}

	public static getRecipeByResultId(resultId: number): Recipe | undefined {
		return Array.from(this.recipes.values()).find(
			(r) => r.resultId === resultId
		)
	}
}

export default Recipe
