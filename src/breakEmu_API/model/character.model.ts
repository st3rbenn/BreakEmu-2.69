import CharacterController from "@breakEmu_API/controller/character.controller"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import {
	ActorAlignmentInformations,
	ActorRestrictionsInformations,
	AlmanachCalendarDateMessage,
	BasicNoOperationMessage,
	BasicTimeMessage,
	CharacterBaseInformations,
	CharacterStatsListMessage,
	CharacteristicEnum,
	CurrentMapMessage,
	EmoteListMessage,
	EntityDispositionInformations,
	GameContextCreateMessage,
	GameContextEnum,
	GameMapMovementMessage,
	GameMapNoMovementMessage,
	GameRolePlayActorInformations,
	GameRolePlayCharacterInformations,
	HumanInformations,
	HumanOption,
	HumanOptionFollowers,
	HumanOptionOrnament,
	HumanOptionTitle,
	JobCrafterDirectorySettingsMessage,
	JobDescriptionMessage,
	JobExperienceMultiUpdateMessage,
	KnownZaapListMessage,
	PlayerStatusEnum,
	ServerExperienceModificatorMessage,
	ShortcutBarEnum,
	SpellItem,
	SpellListMessage,
	StatsUpgradeResultEnum,
	StatsUpgradeResultMessage,
	TextInformationMessage,
	TextInformationTypeEnum,
	TitlesAndOrnamentsListMessage,
} from "@breakEmu_Protocol/IO"
import WorldClient from "@breakEmu_World/WorldClient"
import ContextHandler from "@breakEmu_World/handlers/ContextHandler"
import AchievementHandler from "@breakEmu_World/handlers/achievement/AchievementHandler"
import CharacterHandler from "@breakEmu_World/handlers/character/CharacterHandler"
import TeleportHandler from "@breakEmu_World/handlers/map/teleport/TeleportHandler"
import AchievementManager from "@breakEmu_World/manager/achievement/AchievementManager"
import BreedManager from "@breakEmu_World/manager/breed/BreedManager"
import Dialog from "@breakEmu_World/manager/dialog/Dialog"
import ZaapDialog from "@breakEmu_World/manager/dialog/ZaapDialog"
import CraftExchange from "@breakEmu_World/manager/dialog/job/CraftExchange"
import Entity from "@breakEmu_World/manager/entities/Entity"
import ContextEntityLook from "@breakEmu_World/manager/entities/look/ContextEntityLook"
import Characteristic from "@breakEmu_World/manager/entities/stats/characteristic"
import EntityStats from "@breakEmu_World/manager/entities/stats/entityStats"
import BankDialog from "@breakEmu_World/manager/exchange/BankExchange"
import Bank from "@breakEmu_World/manager/items/Bank"
import Inventory from "@breakEmu_World/manager/items/Inventory"
import JobManager from "@breakEmu_World/manager/job/JobManager"
import MapPoint from "@breakEmu_World/manager/map/MapPoint"
import PathReader from "@breakEmu_World/manager/map/PathReader"
import GeneralShortcutBar from "@breakEmu_World/manager/shortcut/GeneralShortcutBar"
import SpellShortcutBar from "@breakEmu_World/manager/shortcut/SpellShortcutBar"
import CharacterShortcut from "@breakEmu_World/manager/shortcut/character/CharacterShortcut"
import CharacterItemShortcut from "@breakEmu_World/manager/shortcut/character/characterItemShortcut"
import CharacterSpellShortcut from "@breakEmu_World/manager/shortcut/character/characterSpellShortcut"
import SkillManager from "@breakEmu_World/manager/skills/SkillManager"
import CharacterSpell from "@breakEmu_World/manager/spell/CharacterSpell"
import Account from "./account.model"
import Achievement from "./achievement.model"
import Breed from "./breed.model"
import Experience from "./experience.model"
import Finishmoves from "./finishmoves.model"
import Job from "./job.model"
import GameMap from "./map.model"
import Skill from "./skill.model"
import Spell from "./spell.model"

class Character extends Entity {
	point: MapPoint
	id: number
	accountId: number
	breed: Breed
	sex: boolean
	cosmeticId: number
	name: string
	experience: number
	look: ContextEntityLook
	level: number
	mapId: number
	cellId: number
	direction: number
	kamas: number
	guildId: number | null = null

	inGame: boolean = false

	collecting: boolean = false

	dialog: Dialog | null = null

	isZaapDialog: boolean = false
	isBankDialog: boolean = false
	isCraftDialog: boolean = false

	status: PlayerStatusEnum = PlayerStatusEnum.PLAYER_STATUS_AVAILABLE

	stats: EntityStats
	statsPoints: number
	knownEmotes: number[] = []
	shortcuts: Map<number, CharacterShortcut | undefined> = new Map()
	knownOrnaments: number[] = []
	activeOrnament: number | null = null
	knownTitles: number[] = []
	activeTitle: number | null = null
	jobs: Map<number, Job>
	spells: Map<number, CharacterSpell> = new Map()
	spellShortcutBar: SpellShortcutBar
	generalShortcutBar: GeneralShortcutBar
	humanOptions: Map<number, HumanOption> = new Map()
	skillsAllowed: Map<number, Skill> = new Map()
	finishmoves: Map<number, Finishmoves> = new Map()

	knownZaaps: Map<number, GameMap> = new Map()

	finishedAchievements: number[] = []
	almostFinishedAchievements: number[] = []
	finishedAchievementObjectives: number[] = []
	untakenAchievementsReward: number[] = []

	context: GameContextEnum | undefined = undefined
	inventory: Inventory
	bank: Bank

	client: WorldClient

	changeMap: boolean = false
	isMoving: boolean = false
	busy: boolean = false
	movementKeys: number[] = []

	movedCell: number | undefined = undefined

	spawnMapId: number = 0
	spawnCellId: number = 0

	godMode: boolean = false

	account: Account | undefined = undefined

	constructor(
		id: number,
		accountId: number,
		breed: number,
		sex: boolean,
		cosmeticId: number,
		name: string,
		experience: number,
		look: ContextEntityLook,
		mapId: number,
		cellId: number,
		direction: number,
		kamas: number,
		statsPoints: number,
		knownEmotes: number[],
		shortcuts: Map<number, CharacterShortcut>,
		knownOrnaments: number[],
		knownTitles: number[],
		activeOrnament: number | null,
		activeTitle: number | null,
		jobs: Map<number, Job>,
		finishMoves: Map<number, Finishmoves>,
		map: GameMap,
		stats: EntityStats,
		finishedAchievements: number[],
		almostFinishedAchievements: number[],
		finishedAchievementObjectives: number[],
		untakenAchievementsReward: number[]
	) {
		super(map)
		this.id = id
		this.accountId = accountId
		this.breed = BreedManager.getInstance().getBreedById(breed)
		this.sex = sex
		this.cosmeticId = cosmeticId
		this.name = name
		this.experience = experience
		this.level = Experience.getCharacterLevel(this.experience)
		this.look = look
		this.mapId = mapId
		this.cellId = cellId
		this.direction = direction
		this.kamas = kamas
		this.stats = stats
		this.spells = new Map<number, CharacterSpell>()
		this.statsPoints = statsPoints
		this.knownEmotes = knownEmotes
		this.shortcuts = shortcuts
		this.spellShortcutBar = new SpellShortcutBar(this)
		this.generalShortcutBar = new GeneralShortcutBar(this)
		this.knownOrnaments = knownOrnaments
		this.activeOrnament = activeOrnament
		this.knownTitles = knownTitles
		this.activeTitle = activeTitle
		this.jobs = jobs
		this.finishmoves = finishMoves
		this.skillsAllowed = SkillManager.getInstance().getAllowedSkills(this)
		this.finishedAchievements = finishedAchievements.filter(
			(achiev) => achiev !== 0
		)
		this.almostFinishedAchievements = almostFinishedAchievements.filter(
			(achiev) => achiev !== 0
		)
		this.finishedAchievementObjectives = finishedAchievementObjectives.filter(
			(achiev) => achiev !== 0
		)
		this.untakenAchievementsReward = untakenAchievementsReward.filter(
			(achiev) => achiev !== 0
		)
	}

	static async create(
		id: number,
		accountId: number,
		breed: number,
		sex: boolean,
		cosmeticId: number,
		name: string,
		look: ContextEntityLook,
		mapId: number,
		cellId: number,
		direction: number,
		kamas: number,
		finishmoves: Map<number, Finishmoves>,
		experience: Experience,
		stats: EntityStats
	): Promise<Character> {
		const character = new Character(
			id,
			accountId,
			breed,
			sex,
			cosmeticId,
			name,
			experience.characterExp,
			look,
			mapId,
			cellId,
			direction,
			kamas,
			ConfigurationManager.getInstance().startStatsPoints,
			[1],
			new Map<number, CharacterShortcut>(),
			[],
			[],
			null,
			null,
			JobManager.new(),
			finishmoves,
			GameMap.getMapById(mapId) as GameMap,
			stats,
			[],
			[],
			[],
			[]
		)
		character.inventory = new Inventory(character)

		character.bank = new Bank(character, [])

		await BreedManager.getInstance().learnBreedSpells(character)

		return character
	}

	public testIfCharacterDataIsValid(): void {
		if (this.id === 0) {
			console.error("Character ID is 0")
		}
		if (this.accountId === 0) {
			console.error("Account ID is 0")
		}
		if (this.breed === null) {
			console.error("Breed is null")
		}
		if (this.name === "") {
			console.error("Name is empty")
		}
		if (this.look === null) {
			console.error("Look is null")
		}
		if (this.level === 0) {
			console.error("Level is 0")
		}
		if (this.mapId === 0) {
			console.error("Map ID is 0")
		}
		if (this.cellId === 0) {
			console.error("Cell ID is 0")
		}
		if (this.direction === 0) {
			console.error("Direction is 0")
		}
		if (this.kamas === 0) {
			console.error("Kamas is 0")
		}
		if (this.stats === null) {
			console.error("Stats is null")
		}
		if (this.finishmoves === null) {
			console.error("Finishmoves is null")
		}
		if (this.experience === 0) {
			console.error("Experience is 0")
		}

		if (this.skillsAllowed.size === 0) {
			console.error("SkillsAllowed is empty")
		}

		if (this.jobs.size === 0) {
			console.error("Jobs is empty")
		}

		if (this.spells.size === 0) {
			console.error("Spells is empty")
		}

		if (this.knownEmotes.length === 0) {
			console.error("KnownEmotes is empty")
		}

		if (this.shortcuts.size === 0) {
			console.error("Shortcuts is empty")
		}

		if (this.knownOrnaments.length === 0) {
			console.error("KnownOrnaments is empty")
		}

		if (this.knownTitles.length === 0) {
			console.error("KnownTitles is empty")
		}

		if (this.finishedAchievements.length === 0) {
			console.error("FinishedAchievements is empty")
		}

		if (this.almostFinishedAchievements.length === 0) {
			console.error("AlmostFinishedAchievements is empty")
		}

		if (this.finishedAchievementObjectives.length === 0) {
			console.error("FinishedAchievementObjectives is empty")
		}

		if (this.untakenAchievementsReward.length === 0) {
			console.error("UntakenAchievementsReward is empty")
		}

		if (this.map === null) {
			console.error("Map is null")
		}

		if (this.map && this.map.instance === null) {
			console.error("Map instance is null")
		}

		if (this.inventory === null) {
			console.error("Inventory is null")
		}

		if (this.bank === null) {
			console.error("Bank is null")
		}

		if (this.client === null) {
			console.error("Client is null")
		}

		if (this.context === null) {
			console.error("Context is null")
		}

		if (this.humanOptions.size === 0) {
			console.error("HumanOptions is empty")
		}

		if (this.generalShortcutBar === null) {
			console.error("GeneralShortcutBar is null")
		}

		if (this.spellShortcutBar === null) {
			console.error("SpellShortcutBar is null")
		}

		if (this.knownZaaps.size === 0) {
			console.error("KnownZaaps is empty")
		}
	}

	public getJobs(jobId: number): Job | undefined {
		return this.jobs.get(jobId)
	}

	public get mapPoint(): MapPoint | undefined {
		if (this.point === undefined) {
			this.point = new MapPoint(this.cellId)
		}
		return this.point
	}

	public set mapPoint(point: MapPoint) {
		this.point = point
	}

	public async addExperience(experience: number) {
		this.experience += experience
		const levelFloor = Experience.getCharacterExperienceLevelFloor(this.level)
		const nextLevelFloor = Experience.getCharacterExperienceNextLevelFloor(
			this.level
		)

		if (
			(this.experience >= nextLevelFloor &&
				this.level < Experience.maxCharacterLevel) ||
			(experience < levelFloor && this.level > 1)
		) {
			const current = this.level
			this.level = Experience.getCharacterLevel(this.experience)
			const difference = this.level - current
			await this.OnLevelChanged(current, difference)
		}

		await this.refreshStats()
	}

	public async addExperienceToJob(jobId: number, experience: number) {
		const job = this.getJobs(jobId)

		if (job) {
			JobManager.getInstance().setExperience(experience, this, job)
		}
	}

	public async setDialog(dialog: Dialog) {
		if (this.dialog) {
			console.log(`Closing dialog ${this.dialog}`)
			await this.dialog.close()
		}

		this.dialog = dialog
		await this.dialog.open()
	}

	public removeDialog() {
		this.dialog = null
	}

	public async leaveDialog() {
		console.log("leaving dialog", this.whatDialog())
		try {
			if (this.dialog) {
				await this.dialog.close()
			}
			//  else {
			// 	await this.client?.Send(new BasicNoOperationMessage())
			// }
		} catch (error) {
			console.log(error)
		}
	}

	private whatDialog() {
		return {
			isZaapDialog: this.dialog instanceof ZaapDialog,
			isBankDialog: this.dialog instanceof BankDialog,
			isCraftDialog: this.dialog instanceof CraftExchange,
		}
	}

	public toCharacterBaseInformations(): CharacterBaseInformations {
		return new CharacterBaseInformations(
			this.id,
			this.name,
			this.level,
			this.look.toEntityLook(),
			this.breed.id,
			this.sex
		)
	}

	public getActorInformations(): GameRolePlayActorInformations {
		const entityDisposition = new EntityDispositionInformations(
			this.cellId,
			this.direction
		)

		const humanInfo = new HumanInformations(
			this.getActorRestrictions(),
			this.sex,
			Array.from(this.humanOptions.values())
		)

		return new GameRolePlayCharacterInformations(
			this.id,
			entityDisposition,
			this.look.toEntityLook(),
			this.name,
			humanInfo,
			this.accountId,
			this.getActorAlignementInformations()
		)
	}

	public getActorRestrictions() {
		return new ActorRestrictionsInformations(
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		)
	}

	public getActorAlignementInformations() {
		return new ActorAlignmentInformations(0, 0, 0, 0)
	}

	public async resendUnTakenRewardAchievements() {
		try {
			if (this.untakenAchievementsReward.length === 0) return
			for (const achiev of this.untakenAchievementsReward) {
				if (achiev === 0) continue
				const achievement = AchievementManager.getInstance().getAchievementById(
					achiev
				)
				if (achievement) {
					console.log("Resending untaken reward achievement", achievement)
					await AchievementHandler.handleSendAchievementFinishedMessage(
						this,
						achievement
					)
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	public getFinishedAchievementsByCategory(categoryId: number): Achievement[] {
		let achievements: Achievement[] = []
		this.finishedAchievements.filter((achievement) => {
			const ach = AchievementManager.getInstance().getAchievementById(
				achievement
			)
			if (ach) {
				if (ach.categoryId === categoryId) {
					achievements.push(ach)
				}
			}
		})

		return achievements
	}

	public createHumanOptions() {
		this.humanOptions.set(1, new HumanOptionFollowers([]))

		if (this.activeOrnament != null) {
			this.humanOptions.set(
				2,
				new HumanOptionOrnament(this.activeOrnament, this.level, 0, 0)
			)
		}
		if (this.activeTitle != null) {
			this.humanOptions.set(
				3,
				new HumanOptionTitle(this.activeTitle, "MODERATOR")
			)
		} else {
			this.humanOptions.set(3, new HumanOptionTitle(0, "MODERATOR"))
		}

		if (this.guildId !== null) {
			// this.humanOptions.set(3, new HumanOptionGuild(this.activeTitle, ""))
		}
	}

	public async refreshJobs() {
		try {
			let directorySettings = []
			let jobDescription = []
			let jobExperience = []

			for (const job of this.jobs.values()) {
				directorySettings.push(job.getDirectorySettings())
			}

			for (const job of this.jobs.values()) {
				jobDescription.push(job.getJobDescription())
			}

			for (const job of this.jobs.values()) {
				jobExperience.push(job.getJobExperience())
			}

			await this?.client?.Send(
				new JobCrafterDirectorySettingsMessage(directorySettings)
			)
			await this?.client?.Send(new JobDescriptionMessage(jobDescription))
			await this?.client?.Send(
				new JobExperienceMultiUpdateMessage(jobExperience)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshSpells() {
		try {
			const spellItems: SpellItem[] = []

			for (const spell of this.spells.values()) {
				spellItems.push(spell.getSpellItem())
			}

			await this?.client?.Send(new SpellListMessage(false, spellItems))
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshGuild() {
		if (this.guildId === 0) return
		// TODO: Send guild info
	}

	public async refreshZaaps() {
		try {
			const knownZaapMsg = new KnownZaapListMessage(
				Array.from(this.knownZaaps.keys())
			)

			await this?.client?.Send(knownZaapMsg)
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshInventory() {
		try {
			await this.inventory.refresh()
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshEmotes() {
		try {
			await this?.client?.Send(new EmoteListMessage(this.knownEmotes))
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshTitleAndOrnament() {
		try {
			await this?.client?.Send(
				new TitlesAndOrnamentsListMessage(
					this.knownTitles,
					this.knownOrnaments,
					this.activeTitle || 0,
					this.activeOrnament || 0
				)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshStats() {
		try {
			await this.client?.Send(
				new CharacterStatsListMessage(
					this.stats.getCharacterCharacteristicInformations(this)
				)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshShortcuts() {
		try {
			await this.spellShortcutBar.refresh()
			await this.generalShortcutBar.refresh()
		} catch (error) {
			console.log(error)
		}
	}

	public async refreshAll() {
		try {
			Promise.all([
				this.refreshJobs(),
				this.refreshSpells(),
				this.refreshGuild(),
				this.refreshZaaps(),
				this.refreshInventory(),
				this.refreshShortcuts(),
				this.sendServerExperienceModificator(),
			])

			this.createHumanOptions()
			await this.onCharacterLoadingComplete()
		} catch (error) {
			console.log(error)
		}
	}

	public async whatPlayerDoing() {
		if (this.busy) {
			this.reply("Player is busy")
		}

		if (this.isMoving) {
			this.reply("Player is moving")
		}

		if (this.dialog) {
			this.reply("Player is in dialog")
		}
	}

	public async move(keys: number[]) {
		try {
			if (!this.busy) {
				const clientCellId = PathReader.readCell(keys[0] as number)

				if (clientCellId === this.cellId) {
					this.direction = PathReader.readDirection(
						keys[keys.length - 1] as number
					)
					this.movedCell = PathReader.readCell(keys[keys.length - 1] as number)
					this.isMoving = true
					this.movementKeys = keys
					await this.sendMap(new GameMapMovementMessage(keys, 0, this.id))
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async stopMove() {
		this.cellId = this.movedCell as number
		this.movedCell = 0
		this.isMoving = false
		this.movementKeys = []
	}

	public async noMove() {
		try {
			this.isMoving = false
			this.movementKeys = []
			this.movedCell = 0
			await this.client?.Send(
				new GameMapNoMovementMessage(
					this.mapPoint?.x as number,
					this.mapPoint?.y as number
				)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async cancelMove(cellId: number) {
		try {
			this.isMoving = false
			this.movementKeys = []
			this.movedCell = 0
			this.cellId = cellId
			// await this.client?.Send(new BasicNoOperationMessage())
		} catch (error) {
			console.log(error)
		}
	}

	public async teleport(mapId: number, cellId: number | null = null) {
		const gameMap = GameMap.getMapById(mapId)
		try {
			if (gameMap) {
				await this.teleportPlayer(gameMap as GameMap, cellId)
			}
			await this.refreshStats()
		} catch (error) {
			console.log(error)
		}
	}

	public async teleportPlayer(
		teleportMap: GameMap,
		cellId: number | null = null
	) {
		try {
			if (this.busy) return

			this.changeMap = true

			if (cellId === null) {
				cellId = teleportMap.getNearestCellId(this.cellId)
			}

			this.cellId = cellId
			this.mapId = teleportMap.id
			if (this.map !== null && this.map.instance) {
				await this.map.instance().removeEntity(this)
			} else {
				this.map = teleportMap
			}

			this.map = teleportMap
			this.mapPoint = new MapPoint(cellId)

			await this.currentMapMessage(this.mapId)

			if (this.dialog) {
				await this.dialog.close()
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async setSpawnPoint() {
		this.spawnMapId = this.mapId

		await this.textInformation(
			TextInformationTypeEnum.TEXT_INFORMATION_MESSAGE,
			6,
			[this.mapId.toString()]
		)

		await TeleportHandler.handleSetSpawnPoint(
			this.client as WorldClient,
			this.mapId
		)
	}

	public async currentMapMessage(mapId: number) {
		try {
			this.changeMap = false
			await this?.client?.Send(new CurrentMapMessage(mapId))
		} catch (error) {
			console.log(error)
		}
	}

	public async onEnterMap() {
		try {
			this.changeMap = false

			await this.map?.instance().addEntity(this)

			await this.map?.instance().sendMapComplementaryInformations(this.client)
			await this.map?.instance().sendMapFightCount(this.client, 0)

			const mapCharacters = this.map
				?.instance()
				.getEntities<Character>(Character)

			for (const player of mapCharacters as Character[]) {
				if (player.isMoving) {
					await this.client?.Send(
						new GameMapMovementMessage(player.movementKeys, 0, player.id)
					)
					await this.client?.Send(new BasicNoOperationMessage())
				}
			}

			if (this.map?.hasZaap && !this.knownZaaps.has(this.map.id)) {
				await this.discoverZaap(this.mapId)
			}

			await AchievementManager.getInstance().checkIsInMapAchievements(this)

			const date = new Date()
			const unixTime = Math.round(date.getTime() / 1000)
			await this.client?.Send(new BasicTimeMessage(unixTime, 1))
		} catch (error) {
			console.log(error)
		}
	}

	public async discoverZaap(mapId: number) {
		try {
			if (this.knownZaaps.has(mapId)) return

			this.knownZaaps.set(mapId, GameMap.getMapById(mapId) as GameMap)
			await this.refreshZaaps()
			await this.textInformation(
				TextInformationTypeEnum.TEXT_INFORMATION_MESSAGE,
				24,
				[mapId.toString()]
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async createContext(context: number) {
		try {
			this.context = context
			await this.client.Send(new GameContextCreateMessage(context))
		} catch (error) {
			console.log(error)
		}
	}

	public async onCharacterLoadingComplete() {
		try {
			await this.onConnected()
			await this.reply("Bienvenue sur BreakEmu !", "38a3d9", true, true)
		} catch (error) {
			console.log(error)
		}
	}

	public async onConnected() {
		try {
			await this.textInformation(
				TextInformationTypeEnum.TEXT_INFORMATION_ERROR,
				89,
				[]
			)
			await this?.client?.Send(new AlmanachCalendarDateMessage(1))
		} catch (error) {
			console.log(error)
		}
	}

	public async destroyContext() {
		try {
			await Promise.all([
				CharacterController.getInstance().updateCharacter(this),
				this.map?.instance().removeEntity(this),
			])
		} catch (error) {
			console.log(error)
		}
	}

	public async sendServerExperienceModificator() {
		try {
			await this.client?.Send(
				new ServerExperienceModificatorMessage(
					ConfigurationManager.getInstance().XpRate * 100
				)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public applyPolice(value: any, bold: boolean, underline: boolean): string {
		if (bold) {
			value = `<b>${value}</b>`
		}
		if (underline) {
			value = `<u>${value}</u>`
		}
		return value
	}

	public async replyWarning(value: any): Promise<void> {
		await this.reply(`<br>${value}`, "ED7F10", false, false)
	}

	public async replyError(value: any): Promise<void> {
		try {
			await this.reply(value, "FF0000", true, false)
		} catch (error) {
			console.log(error)
		}
	}

	public async reply(
		value: any,
		color: string = "38a3d9",
		bold: boolean = false,
		underline: boolean = false,
		size: number = 14
	): Promise<void> {
		try {
			value = this.applyPolice(value, bold, underline)

			await this.client?.Send(
				new TextInformationMessage(0, 0, [
					`<font color="#${color}" size="${size}px">${value}</font>`,
				])
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async textInformation(
		msgType: TextInformationTypeEnum,
		msgId: number,
		parameters: string[]
	) {
		try {
			await this.client?.Send(
				new TextInformationMessage(msgType, msgId, parameters)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async addJobExperience(jobId: number, experience: number) {
		try {
			const job = this.getJobs(jobId)

			if (job) {
				await JobManager.getInstance().setExperience(experience, this, job)
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async addEmote(emoteId: number) {
		if (this.knownEmotes.includes(emoteId)) return

		this.knownEmotes.push(emoteId)
		await ContextHandler.handleNewEmote(this.client, emoteId)
	}

	public async addTitle(titleId: number) {
		if (this.knownTitles.includes(titleId)) return

		this.knownTitles.push(titleId)
		await ContextHandler.handleNewTitle(this.client, titleId)
	}

	public async addOrnament(ornamentId: number) {
		if (this.knownOrnaments.includes(ornamentId)) return

		this.knownOrnaments.push(ornamentId)
		await ContextHandler.handleNewOrnament(this.client, ornamentId)
	}

	public async equipeOrnament(ornamentId: number) {
		this.activeOrnament = ornamentId
		await this.refreshStats()
	}

	public async OnLevelChanged(currentLevel: number, difference: number) {
		try {
			if (currentLevel - difference < 200) {
				if (!(this.level > 200)) {
					;(this.stats.getCharacteristic(
						CharacteristicEnum.STATS_POINTS
					) as Characteristic).base +=
						(this.level - (currentLevel - difference)) * 5
				}
			}

			this.stats.lifePoints = this.level > 200 ? 1055 : 55 + this.level * 5

			if (currentLevel >= 100 && currentLevel - difference < 100) {
				;(this.stats.characteristics.get(
					CharacteristicEnum.ACTION_POINTS
				) as Characteristic).base = this.level >= 100 ? 7 : 6
			} else if (currentLevel < 100 && currentLevel - difference >= 100) {
				;(this.stats.characteristics.get(
					CharacteristicEnum.ACTION_POINTS
				) as Characteristic).base = this.level >= 100 ? 7 : 6
			}

			this.stats.currentMaxWeight += 5 * difference

			let shortcut = this.spellShortcutBar.shortcuts
			for (const breedSpellId of this.breed.breedSpells) {
				const spell = Spell.getSpells.get(breedSpellId)
				if (spell) {
					if (spell.minimumLevel < this.level) {
						if (shortcut.has(spell.id)) {
							console.log("Removing shortcut")
							this.spellShortcutBar.removeShortcut(
								(shortcut.get(spell.id) as CharacterSpellShortcut).slotId
							)
						}

						// if (this.spells.has(spell.id)) {
						//   console.log("Removing spell")
						// 	this.spells.delete(spell.id)
						// 	await this.refreshSpells()
						// }
					} else if (spell.minimumLevel <= this.level) {
						// console.log("Learning spell", spell.id, spell.minimumLevel, this.level)
						await this.learnSpell(spell.id, true)
					}

					if ((spell.variant?.minimumLevel as number) > this.level) {
						if (shortcut.has(spell.id)) {
							this.spellShortcutBar.removeShortcut(
								(shortcut.get(spell.id) as CharacterSpellShortcut).slotId
							)
						}
					}

					if ((spell.variant?.minimumLevel as number) <= this.level) {
						if (!this.spells.has(spell.id)) {
							await this.learnSpell(spell.id, true)
						}
					}
				}
			}

			await this.refreshStats()
			await this.inventory.refreshWeight()

			if (this.level > 1) {
				if (difference > 0) {
					await CharacterHandler.sendCharacterLevelUpMessage(
						this.client as WorldClient,
						this.level
					)
					await CharacterHandler.sendCharacterLevelUpInformationMessage(
						this.client as WorldClient,
						this,
						this.level
					)
				}
			}

			AchievementManager.getInstance().checkLevelAchievements(this)
		} catch (error) {
			console.log(error)
		}
	}

	public hasSpell(spellId: number): boolean {
		return Array.from(this.spells.values()).some(
			(spell) => spell.activeSpell().id === spellId
		)
	}

	public async learnSpell(spellId: number, notify: boolean) {
		try {
			if (this.hasSpell(spellId)) return

			let spell = new CharacterSpell(spellId, false, this)
			this.spells.set(spellId, spell)

			if (spell.learned()) {
				if (this.spellShortcutBar.canAdd()) {
					const spellShortcut = new CharacterSpellShortcut(
						this.spellShortcutBar.getFreeSlotId() as number,
						spellId,
						ShortcutBarEnum.SPELL_SHORTCUT_BAR
					)
					await this.spellShortcutBar.addShortcut(spellShortcut)

					if (notify) {
						await this.refreshShortcuts()
						await this.textInformation(
							TextInformationTypeEnum.TEXT_INFORMATION_MESSAGE,
							3,
							[spellId.toString()]
						)
					}
				}
			}

			if (notify) {
				await this.refreshSpells()
			}
		} catch (error) {
			console.log(error)
		}
	}

	public async onStatUpgradeResult(
		result: StatsUpgradeResultEnum,
		nbCharacBoost: number
	) {
		try {
			await this.client?.Send(
				new StatsUpgradeResultMessage(result, nbCharacBoost)
			)
		} catch (error) {
			console.log(error)
		}
	}

	public async disconnect() {
		await this.destroyContext()
	}

	public static loadShortcutsFromJson(
		json: any
	): {
		spellShortcuts: Map<number, CharacterShortcut>
		generalShortcuts: Map<number, CharacterShortcut>
	} {
		const spellShortcuts = new Map<number, CharacterShortcut>()
		const generalShortcuts = new Map<number, CharacterShortcut>()
		for (const shortcut of json) {
			if (shortcut.barType == ShortcutBarEnum.GENERAL_SHORTCUT_BAR) {
				generalShortcuts.set(
					shortcut.slotId,
					new CharacterItemShortcut(
						shortcut.slotId,
						shortcut.itemUid,
						shortcut.itemGid,
						shortcut.barType
					)
				)
			} else if (shortcut.barType == ShortcutBarEnum.SPELL_SHORTCUT_BAR) {
				spellShortcuts.set(
					shortcut.slotId,
					new CharacterSpellShortcut(
						shortcut.slotId,
						shortcut.spellId,
						shortcut.barType
					)
				)
			}
		}

		return {
			spellShortcuts,
			generalShortcuts,
		}
	}

	public saveKnownZaapsAsJSON(): string {
		let zaaps = []
		for (const mapId of this.knownZaaps.keys()) {
			zaaps.push(mapId)
		}
		return JSON.stringify(zaaps)
	}

	public static loadKnownZaapsFromJson(json: any): Map<number, GameMap> {
		const zaaps = new Map<number, GameMap>()
		for (const mapId of json) {
			zaaps.set(mapId, GameMap.getMapById(mapId) as GameMap)
		}
		return zaaps
	}

	public saveSpellsAsJSON(): string {
		let spells = []

		for (const spell of this.spells.values()) {
			spells.push(spell.saveAsJson())
		}

		return JSON.stringify(spells)
	}

	public saveShortcutsAsJSON(): string {
		let shortcuts = []
		for (const shortcut of this.generalShortcutBar.shortcuts.values()) {
			const shr = shortcut as CharacterItemShortcut
			if (shortcut) {
				shortcuts.push({
					barType: shr.barType,
					slotId: shr.slotId,
					spellId: null,
					itemUid: shr.itemUid,
					itemGid: shr.itemGid,
				})
			}
		}

		for (const shortcut of this.spellShortcutBar.shortcuts.values()) {
			const shr = shortcut as CharacterSpellShortcut
			if (shortcut) {
				shortcuts.push({
					barType: shr.barType,
					slotId: shr.slotId,
					spellId: shr.spellId,
					itemUid: null,
					itemGid: null,
				})
			}
		}

		return JSON.stringify(shortcuts)
	}

	public saveFinishmovesAsJSON(): string {
		let finishmoves = []
		for (const finishmove of this.finishmoves.values()) {
			finishmoves.push({
				id: finishmove.id,
			})
		}
		return JSON.stringify(finishmoves)
	}
}

export default Character
