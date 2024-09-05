import InteractiveElementModel from "@breakEmu_API/model/InteractiveElement.model"
import InteractiveSkill from "@breakEmu_API/model/InteractiveSkill.model"
import Character from "@breakEmu_API/model/character.model"
import Job from "@breakEmu_API/model/job.model"
import Skill from "@breakEmu_API/model/skill.model"
import BonusTask from "@breakEmu_Core/bull/tasks/BonusTask"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import ActionTimer from "@breakEmu_Core/timer/ActionTimer"
import {
	InteractiveUseEndedMessage,
	ObtainedItemMessage,
	StatedElement,
	StatedElementState,
	StatedElementUpdatedMessage,
} from "@breakEmu_Protocol/IO"
import JobFormulas from "@breakEmu_World/manager/formulas/JobFormulas"
import SkillManager from "@breakEmu_World/manager/skills/SkillManager"
import MapInstance from "../MapInstance"
import MapInteractiveElement from "./MapInteractiveElement"

class MapStatedElement extends MapInteractiveElement {
	private _GROW_INTERVAL: number = 120 * 1000

	private character: Character
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
			this.state = state
			await this.mapInstance.send(
				new StatedElementUpdatedMessage(this.getStatedElement())
			)
		} catch (error) {
			console.error(error)
		}
	}

	public async use(character: Character) {
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
				`Character ${character.name} doesn't have the job ${
					(this.skill.record as Skill).parentJobId
				} required to use the element ${this.record.elementId}`
			)
			return
		}

		try {
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
					this.getInteractiveElement(this.character)
				)
				this.currentBonus = 0
			}
		} catch (error) {
			console.error(error)
		}
	}

	public async onUsed(job: Job, skill: Skill | undefined = this.skill.record) {
		this.growCallback.dispose()
		this.record.harvestable = false
		try {
			await this.character?.client?.Send(
				new InteractiveUseEndedMessage(this.record.elementId, skill?.id)
			)
			await this.collect(job, skill)
			await this.updateState(StatedElementState.Unactive)
		} catch (error) {
			console.error(error)
		}
		this.growCallback.start()
	}

	public async collect(job: Job, skill: Skill | undefined = this.skill.record) {
		try {
			if (this.state == StatedElementState.Used) {
				await this.mapInstance.refresh(
					this.getInteractiveElement(this.character!)
				)

				if (skill) {
					const itemQuantity = this.container.get(JobFormulas).getCollectedItemQuantity(
						job !== undefined ? job.level : 1,
						skill
					)
					const quantity = this.calculateBonus(itemQuantity, this.currentBonus)

					await this.character?.inventory.addNewItem(
						skill.gatheredRessourceItem,
						quantity
					)
					await this.character?.client?.Send(
						new ObtainedItemMessage(skill.gatheredRessourceItem, quantity)
					)
					await this.character?.inventory.refresh()

					if (job !== undefined) {
						this.character?.addJobExperience(
							job.jobId,
							this.calculateBonus(
								5 *
									skill.levelMin *
									this.container.get(ConfigurationManager).jobXpRate,
								this.currentBonus
							)
						)
					}
					this.character!.collecting = false
				}
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

	public override canUse(character: Character): boolean {
		return super.canUse(character) && this.state == StatedElementState.Active
	}

	get skill(): InteractiveSkill {
		return this.record.skill
	}
}

export default MapStatedElement
