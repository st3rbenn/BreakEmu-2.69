import InteractiveElementModel from "../../../../breakEmu_API/model/InteractiveElement.model"
import InteractiveSkill from "../../../../breakEmu_API/model/InteractiveSkill.model"
import Character from "../../../../breakEmu_API/model/character.model"
import Job from "../../../../breakEmu_API/model/job.model"
import Skill from "../../../../breakEmu_API/model/skill.model"
import BonusTask from "../../../../breakEmu_Core/bull/tasks/BonusTask"
import ConfigurationManager from "../../../../breakEmu_Core/configuration/ConfigurationManager"
import ActionTimer from "../../../../breakEmu_Core/timer/ActionTimer"
import {
	InteractiveUseEndedMessage,
	ObtainedItemMessage,
	StatedElement,
	StatedElementState,
	StatedElementUpdatedMessage,
} from "../../../../breakEmu_Server/IO"
import JobFormulas from "../../../../breakEmu_World/manager/formulas/JobFormulas"
import SkillManager from "../../../../breakEmu_World/manager/skills/SkillManager"
import MapInstance from "../MapInstance"
import MapInteractiveElement from "./MapInteractiveElement"

class MapStatedElement extends MapInteractiveElement {
	private _GROW_INTERVAL: number = 120 * 1000

	private character: Character | null = null
	private currentBonus: number = 0

	private state: StatedElementState
	private onUsedCallback: ActionTimer
	private growCallback: ActionTimer

	constructor(record: InteractiveElementModel, mapInstance: MapInstance) {
		super(record, mapInstance)
		this.state = StatedElementState.Active
	}

	public getStatedElement(): StatedElement {
		return new StatedElement(
			this.record.elementId,
			this.record.cellId,
			this.state,
			true
		)
	}

	private async updateState(state: StatedElementState) {
		try {
			// console.log(
			// 	`Updating element ${this.record.elementId} state to ${state}, with age bonus ${this.record.ageBonus}`
			// )
			this.state = state
			await this.mapInstance.send(
				new StatedElementUpdatedMessage(this.getStatedElement())
			)
		} catch (error) {
			console.error(error)
		}
	}

	public async use(character: Character) {
		try {
			this.character = character
			this.currentBonus = this.record.ageBonus
			this.record.ageBonus = 0

			const skill = Skill.getSkill(this.skill.skillId as number)

			if (skill === undefined) {
				console.log(`Skill ${this.skill.skillId} not found`)
				return
			}

			const job = this.character.jobs.get(skill.parentJobId as number)

			if (job === undefined) {
				console.log(
					`Character ${character.name} doesn't have the job ${this.skill.record.parentJobId} required to use the element ${this.record.elementId}`
				)
				return
			}

			if (this.state == StatedElementState.Active) {
				this.character.collecting = true
				await this.updateState(StatedElementState.Used)
				this.growCallback = new ActionTimer(
					this._GROW_INTERVAL,
					async () => await this.grow(),
					false
				)
				this.onUsedCallback = new ActionTimer(
					character.godMode ? 0 : SkillManager.SKILL_DURATION * 100,
					async () => await this.onUsed(job, skill),
					false
				)
				this.onUsedCallback.start()
			}
		} catch (error) {
			console.error(error)
		}
	}

	public async grow() {
		try {
			if (this.state == StatedElementState.Unactive) {
				this.record.harvestable = true
				await this.updateState(StatedElementState.Active)
				await this.mapInstance.refresh(
					this.getInteractiveElement(this.character!)
				)
				this.currentBonus = 0
				this.character = null
			}
		} catch (error) {
			console.error(error)
		}
	}

	public async onUsed(job: Job, skill: Skill = this.skill.record) {
		try {
			this.growCallback.dispose()
			this.record.harvestable = false
			await this.character?.client?.Send(
				new InteractiveUseEndedMessage(this.record.elementId, skill.id)
			)
			await this.collect(job, skill)
			await this.updateState(StatedElementState.Unactive)
			this.growCallback.start()
		} catch (error) {
			console.error(error)
		}
	}

	public async collect(job: Job, skill: Skill = this.skill.record) {
		try {
			if (this.state == StatedElementState.Used) {
				await this.mapInstance.refresh(
					this.getInteractiveElement(this.character!)
				)

				const itemQuantity = JobFormulas.getInstance().getCollectedItemQuantity(
					job !== undefined ? job.level : 1,
					skill
				)
				const quantity = this.calculateBonus(itemQuantity, this.currentBonus)

				console.log("QUANTITY: ", quantity)

				await this.character?.inventory.addNewItem(
					skill.gatheredRessourceItem,
					quantity
				)
				await this.character?.client?.Send(
					new ObtainedItemMessage(skill.gatheredRessourceItem, quantity)
				)

				//TODO: add job experience

				if (job !== undefined) {
					this.character?.addJobExperience(
						job.jobId,
						this.calculateBonus(
							5 * skill.levelMin * ConfigurationManager.getInstance().jobXpRate,
							this.currentBonus
						)
					)
				}
				this.character!.collecting = false
			}
		} catch (error) {
			console.error(error)
		}
	}

	private calculateBonus(base: number, bonus: number): number {
		const bonusPercent = (bonus / BonusTask.AGE_BONUS_MAX) * 100
		const bonusResult = (base * bonusPercent) / 100
		const total = base + bonusResult
		return Math.round(total)
	}

	public caneUse(character: Character): boolean {
		return super.caneUse(character) && this.state == StatedElementState.Active
	}

	get skill(): InteractiveSkill {
		return this.record.skill
	}
}

export default MapStatedElement
