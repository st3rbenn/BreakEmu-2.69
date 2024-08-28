import Character from "@breakEmu_API/model/character.model"
import Job from "@breakEmu_API/model/job.model"
import Skill from "@breakEmu_API/model/skill.model"
import {
	DialogTypeEnum,
	ExchangeCraftCountModifiedMessage,
	ExchangeLeaveMessage,
	ExchangeTypeEnum,
} from "@breakEmu_Protocol/IO"
import Exchange from "../../exchange/Exchange"
import JobItemCollection from "../../items/collections/JobItemCollection"

abstract class JobExchange extends Exchange {
	public EchangeType: ExchangeTypeEnum = ExchangeTypeEnum.CRAFT

	static readonly COUNT_DEFAULT: number = 1
	static readonly COUNT_LIMIT: number = 5000

	public count: number
	public skill: Skill
	public characterJob: Job

	public jobInventory: JobItemCollection

	constructor(character: Character, skill: Skill) {
		super(character)
		this.skill = skill

		if (skill) {
			const job = character.jobs.get(skill.parentJobId)
			if (job) {
				this.characterJob = job
			}
		}
		this.jobInventory = new JobItemCollection(character)
		this.count = JobExchange.COUNT_DEFAULT
	}

	public abstract setCount(count: number): void

	public resetCount(): void {
		this.count = JobExchange.COUNT_DEFAULT
		this.character.client.Send(
			new ExchangeCraftCountModifiedMessage(this.count)
		)
	}

	public async moveItem(uid: string, quantity: number): Promise<void> {
		const item = this.character.inventory.items.get(uid)

		if (item) {
			console.log(`Item found ${item.record.name} - Q: ${quantity}`)

			await this.jobInventory.moveItem(item, quantity)
		} else {
			console.log(`Item not found`)
		}
	}

	public moveItemPriced(
		objectUID: number,
		quantity: number,
		price: number
	): void {
		throw new Error("Method not implemented.")
	}
}

export default JobExchange
