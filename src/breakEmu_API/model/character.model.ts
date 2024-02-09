import CharacterController from "../../breakEmu_API/controller/character.controller"
import ConfigurationManager from "../../breakEmu_Core/configuration/ConfigurationManager"
import Logger from "../../breakEmu_Core/Logger"
import {
	ActorAlignmentInformations,
	ActorRestrictionsInformations,
	AlmanachCalendarDateMessage,
	BasicNoOperationMessage,
	BasicTimeMessage,
	CharacterBaseInformations,
	CharacteristicEnum,
	CharacterLoadingCompleteMessage,
	CharacterStatsListMessage,
	CurrentMapMessage,
	EmoteListMessage,
	EntityDispositionInformations,
	GameContextCreateMessage,
	GameContextDestroyMessage,
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
	ServerExperienceModificatorMessage,
	ShortcutBarEnum,
	SpellItem,
	SpellListMessage,
	StatsUpgradeResultEnum,
	StatsUpgradeResultMessage,
	TextInformationMessage,
	TextInformationTypeEnum,
} from "../../breakEmu_Server/IO"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import Entity from "../../breakEmu_World/manager/entities/Entity"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import CharacterSpell from "../../breakEmu_World/manager/entities/spell/CharacterSpell"
import Characteristic from "../../breakEmu_World/manager/entities/stats/characteristic"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import Inventory from "../../breakEmu_World/manager/items/Inventory"
import MapPoint from "../../breakEmu_World/manager/map/MapPoint"
import PathReader from "../../breakEmu_World/manager/map/PathReader"
import CharacterItemShortcut from "../../breakEmu_World/manager/shortcut/character/characterItemShortcut"
import CharacterShortcut from "../../breakEmu_World/manager/shortcut/character/CharacterShortcut"
import CharacterSpellShortcut from "../../breakEmu_World/manager/shortcut/character/characterSpellShortcut"
import GeneralShortcutBar from "../../breakEmu_World/manager/shortcut/GeneralShortcutBar"
import SpellShortcutBar from "../../breakEmu_World/manager/shortcut/SpellShortcutBar"
import WorldClient from "../../breakEmu_World/WorldClient"
import Breed from "./breed.model"
import Experience from "./experience.model"
import Finishmoves from "./finishmoves.model"
import Job from "./job.model"
import GameMap from "./map.model"
import Skill from "./skill.model"
import SkillManager from "../../breakEmu_World/manager/skills/SkillManager"

class Character extends Entity {
	private logger: Logger = new Logger("Character")

	public _id: number
	private _accountId: number
	private _breed: Breed
	private _sex: boolean
	private _cosmeticId: number
	public _name: string
	private _experience: number
	private _look: ContextEntityLook
	private _level: number
	private _mapId: number
	public _cellId: number
	public _direction: number
	private _kamas: number
	private _guildId: number | null = null

	public _map: GameMap | null = null

	private _stats?: EntityStats
	private _statsPoints: number
	private _knownEmotes: number[]
	private _shortcuts: Map<number, CharacterShortcut | undefined>
	private _knownOrnaments: number[]
	private _activeOrnament: number
	private _knownTitles: number[]
	private _activeTitle: number
	private _jobs: Map<number, Job>
	private _spells: Map<number, CharacterSpell> = new Map()
	private _spellShortcutBar: SpellShortcutBar
	private _generalShortcutBar: GeneralShortcutBar
	private _humanOptions: Map<number, HumanOption> = new Map()
	private _skillsAllowed: Map<number, Skill> = new Map()

	private _context: GameContextEnum | undefined
	private _inventory: Inventory

	private _finishmoves: Map<number, Finishmoves> = new Map()

	private _client: WorldClient | undefined

	public changeMap: boolean = false
	public isMoving: boolean = false
	public busy: boolean = false
	public movementKeys: number[] = []

	public _point: MapPoint
	private _movedCell: number | undefined

	constructor(
		id: number,
		accountId: number,
		breed: Breed,
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
		activeOrnament: number,
		jobs: Map<number, Job>,
		finishMoves: Map<number, Finishmoves>,
		map: GameMap | null,
		stats?: EntityStats
	) {
		super(map)
		this.id = id
		this.accountId = accountId
		this.breed = breed
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
		this._stats = stats
		this.spells = new Map<number, CharacterSpell>()
		this.statsPoints = statsPoints
		this.knownEmotes = knownEmotes
		this.shortcuts = shortcuts
		this._spellShortcutBar = new SpellShortcutBar(this)
		this._generalShortcutBar = new GeneralShortcutBar(this)
		this.knownOrnaments = knownOrnaments
		this.activeOrnament = activeOrnament
		this._jobs = jobs
		this._finishmoves = finishMoves
		this.skillsAllowed = SkillManager.getInstance().getAllowedSkills(this)
	}

	public static create(
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
		finishmoves: Map<number, Finishmoves>
	): Character {
		const startLevel = ConfigurationManager.getInstance().startLevel - 1
		const bree = BreedManager.getInstance().breeds.find(
			(b) => b.id === breed
		) as Breed

		const character = new Character(
			id,
			accountId,
			bree,
			sex,
			cosmeticId,
			name,
			Experience.getCharacterExperienceLevelFloor(startLevel),
			look,
			mapId,
			cellId,
			direction,
			kamas,
			ConfigurationManager.getInstance().startStatsPoints,
			[1],
			new Map<number, CharacterShortcut>(),
			[],
			0,
			Job.new(),
			finishmoves,
			GameMap.getMapById(mapId) as GameMap,
			EntityStats.new(startLevel)
		)

		BreedManager.getInstance().learnBreedSpells(character)

		return character
	}

	public get id(): number {
		return this._id
	}

	public set id(id: number) {
		this._id = id
	}

	public get client(): WorldClient | undefined {
		return this._client
	}

	public set client(client: WorldClient | undefined) {
		this._client = client
	}

	public get accountId(): number {
		return this._accountId
	}

	public set accountId(accountId: number) {
		this._accountId = accountId
	}

	public get breed(): Breed {
		return this._breed
	}

	public set breed(breed: Breed) {
		this._breed = breed
	}

	public get sex(): boolean {
		return this._sex
	}

	public set sex(sex: boolean) {
		this._sex = sex
	}

	public get inventory(): Inventory {
		return this._inventory
	}

	public set inventory(inventory: Inventory) {
		this._inventory = inventory
	}

	public get knownTitles(): number[] {
		return this._knownTitles
	}

	public set knownTitles(knownTitles: number[]) {
		this._knownTitles = knownTitles
	}

	public get activeTitle(): number {
		return this._activeTitle
	}

	public set activeTitle(activeTitle: number) {
		this._activeTitle = activeTitle
	}

	public get skillsAllowed(): Map<number, Skill> {
		return this._skillsAllowed
	}

	public set skillsAllowed(skillsAllowed: Map<number, Skill>) {
		this._skillsAllowed = skillsAllowed
	}

	public get cosmeticId(): number {
		return this._cosmeticId
	}

	public set cosmeticId(cosmeticId: number) {
		this._cosmeticId = cosmeticId
	}

	public get humanOptions(): Map<number, HumanOption> {
		return this._humanOptions
	}

	public set humanOptions(humanOptions: Map<number, HumanOption>) {
		this._humanOptions = humanOptions
	}

	public get name(): string {
		return this._name
	}

	public set name(name: string) {
		this._name = name
	}

	public get experience(): number {
		return this._experience
	}

	public set experience(experience: number) {
		this._experience = experience
	}

	public get finishMoves(): Map<number, Finishmoves> {
		return this._finishmoves
	}

	public set finishMoves(finishmoves: Map<number, Finishmoves>) {
		this._finishmoves = finishmoves
	}

	public get look(): ContextEntityLook {
		return this._look
	}

	public set look(look: ContextEntityLook) {
		this._look = look
	}

	public get mapId(): number {
		return this._mapId
	}

	public set mapId(mapId: number) {
		this._mapId = mapId
	}

	public get cellId(): number {
		return this._cellId
	}

	public set cellId(cellId: number) {
		this._cellId = cellId
	}

	public get direction(): number {
		return this._direction
	}

	public set direction(direction: number) {
		this._direction = direction
	}

	public get kamas(): number {
		return this._kamas
	}

	public set kamas(kamas: number) {
		this._kamas = kamas
	}

	public get stats(): EntityStats {
		return this._stats as EntityStats
	}

	public set stats(stats: EntityStats) {
		this._stats = stats
	}

	public get level(): number {
		return this._level
	}

	public set level(level: number) {
		this._level = level
	}

	public get statsPoints(): number {
		return this.stats.getCharacteristic(CharacteristicEnum.STATS_POINTS)
			?.base as number
	}

	public set statsPoints(statsPoints: number) {
		;(this.stats.getCharacteristic(
			CharacteristicEnum.STATS_POINTS
		) as Characteristic).base = statsPoints
	}

	public get jobs(): Map<number, Job> {
		return this._jobs
	}

	public get shortcuts(): Map<number, CharacterShortcut | undefined> {
		return this._shortcuts
	}

	public set shortcuts(shortcuts: Map<number, CharacterShortcut>) {
		this._shortcuts = shortcuts
	}

	public get spellShortcutBar(): SpellShortcutBar {
		return this._spellShortcutBar
	}

	public get generalShortcutBar(): GeneralShortcutBar {
		return this._generalShortcutBar
	}

	public get spells(): Map<number, CharacterSpell> {
		return this._spells
	}

	public set spells(spells: Map<number, CharacterSpell>) {
		this._spells = spells
	}

	public get mapPoint(): MapPoint | undefined {
		if (this._point === undefined) {
			this._point = new MapPoint(this.cellId)
		}
		return this._point
	}

	public set mapPoint(point: MapPoint) {
		this._point = point
	}

	public get movedCell(): number | undefined {
		return this._movedCell
	}

	public set movedCell(value: number | undefined) {
		this._movedCell = value
	}

	public get knownEmotes(): number[] {
		return this._knownEmotes
	}

	public set knownEmotes(knownEmotes: number[]) {
		this._knownEmotes = knownEmotes
	}

	public get knownOrnaments(): number[] {
		return this._knownOrnaments
	}

	public set knownOrnaments(knownOrnaments: number[]) {
		this._knownOrnaments = knownOrnaments
	}

	public get activeOrnament(): number {
		return this._activeOrnament
	}

	public set activeOrnament(activeOrnament: number) {
		this._activeOrnament = activeOrnament
	}

	public get guildId(): number | null {
		return this._guildId
	}

	public set guildId(guildId: number) {
		this._guildId = guildId
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

	public getActorInformations(): GameRolePlayCharacterInformations {
		const entityDisposition = new EntityDispositionInformations(
			this.cellId,
			this.direction
		)

		return new GameRolePlayCharacterInformations(
			this.id,
			entityDisposition,
			this.look.toEntityLook(),
			this.name,
			new HumanInformations(this.getActorRestrictions(), this.sex, Array.from(this.humanOptions.values())),
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

	public createHumanOptions() {
		this.humanOptions.set(1, new HumanOptionFollowers([]))

		this.humanOptions.set(2, new HumanOptionOrnament(128, this.level, 0, 2))

		// if (this.activeTitle > 0) {
		// 	this.humanOptions.set(3, new HumanOptionTitle(335, ""))
		// }

		if (this.guildId !== null) {
			// this.humanOptions.set(3, new HumanOptionGuild(this.activeTitle, ""))
		}
	}

	public async refreshJobs() {
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
			this?.client?.serialize(
				new JobCrafterDirectorySettingsMessage(directorySettings)
			)
		)
		await this?.client?.Send(
			this?.client?.serialize(new JobDescriptionMessage(jobDescription))
		)
		await this?.client?.Send(
			this?.client?.serialize(
				new JobExperienceMultiUpdateMessage(jobExperience)
			)
		)
	}

	public async refreshSpells() {
		const spellItems: SpellItem[] = []

		for (const spell of this.spells.values()) {
			spellItems.push(spell.getSpellItem(this))
		}

		await this?.client?.Send(
			this?.client?.serialize(new SpellListMessage(false, spellItems))
		)
	}

	public async refreshGuild() {
		if (this.guildId === 0) return
		// TODO: Send guild info
	}

	public async refreshAll() {
		await this.refreshJobs()
		await this.refreshSpells()
		await this.refreshGuild()
		await this.refreshEmotes()
		await this.client?.selectedCharacter?.inventory.refresh()
		await this.refreshShortcuts()
		this.createHumanOptions()
		await this.sendServerExperienceModificator()
	}

	public async move(keys: number[]) {
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
	}

	public async stopMove() {
		this.cellId = this.movedCell as number
		this.movedCell = 0
		this.isMoving = false
		this.movementKeys = []

		// let element = this.map?.instance
		// 	.getElements<MapElement>(MapElement)
		// 	.map((x) => x)
		// 	.find((x) => x.record.cellId === this.cellId)

		// if (
		// 	element != null &&
		// 	element.record.skill != null &&
		// 	element.record.skill.actionIdentifier == GenericActionEnum.Teleport
		// ) {
		// 	console.log(`Try to use element ${element.record.elementId}`)
		// 	/*this.map?.instance.useInteractive(this, element.record.elementId, 0)*/
		// }
	}

	public async noMove() {
		await this.client?.Send(
			this.client?.serialize(
				new GameMapNoMovementMessage(
					this.mapPoint?.x as number,
					this.mapPoint?.y as number
				)
			)
		)
	}

	public async cancelMove(cellId: number) {
		this.isMoving = false
		this.cellId = cellId
		this.client?.Send(this.client?.serialize(new BasicNoOperationMessage()))
	}

	public async teleport(mapId: number, cellId: number | null = null) {
		await this.teleportPlayer(GameMap.getMapById(mapId) as GameMap, cellId)
	}

	public async teleportPlayer(
		teleportMap: GameMap,
		cellId: number | null = null
	) {
		if (this.busy) return

		this.changeMap = true

		if (cellId === null) {
			cellId = teleportMap.getNearestCellId(this.cellId)
		}

		this.cellId = cellId
		this.mapId = teleportMap.id

		if (this.map !== null) {
			await this.map.instance.removeEntity(this)
		}

		this.map = teleportMap
		this.mapPoint = new MapPoint(cellId)

		await this.currentMapMessage(this.mapId)
	}

	public async currentMapMessage(mapId: number) {
		await this?.client?.Send(
			this?.client?.serialize(new CurrentMapMessage(mapId))
		)
	}

	public async onEnterMap() {
		this.changeMap = false

		await this.map?.instance.addEntity(this)

		await this.map?.instance.sendMapComplementaryInformations(
			this.client as WorldClient
		)
		/*this.map?.instance.sendMapFightCount(this.client)*/

		const mapCharacters = this.map?.instance.getEntities<Character>(Character)

		for (const player of mapCharacters as Character[]) {
			if (player.isMoving) {
				await this.client?.Send(
					this.client?.serialize(
						new GameMapMovementMessage(player.movementKeys, 0, player.id)
					)
				)
				await this.client?.Send(
					this.client?.serialize(new BasicNoOperationMessage())
				)
			}
		}

		await this.client?.Send(
			this.client?.serialize(new BasicNoOperationMessage())
		)
		const date = new Date()
		const unixTime = Math.round(date.getTime() / 1000)
		await this.client?.Send(
			this.client?.serialize(new BasicTimeMessage(unixTime, 1))
		)
	}

	public async createContext(context: number) {
		await this?.client?.Send(
			this?.client?.serialize(new GameContextCreateMessage(context))
		)
		this._context = context
	}

	public async refreshEmotes() {
		await this?.client?.Send(this?.client?.serialize(new EmoteListMessage([])))
	}

	public async onCharacterLoadingComplete() {
		await this.onConnected()
		await this.reply("Bienvenue sur BreakEmu !", "38a3d9", true, true)
		await this?.client?.Send(
			this?.client?.serialize(new CharacterLoadingCompleteMessage())
		)
	}

	public async onConnected() {
		await this.textInformation(
			TextInformationTypeEnum.TEXT_INFORMATION_ERROR,
			89,
			[]
		)
		await this?.client?.Send(
			this?.client?.serialize(new AlmanachCalendarDateMessage(1))
		)
	}

	public async destroyContext() {
		await this?.client?.Send(
			this?.client?.serialize(new GameContextDestroyMessage())
		)
		this._context = undefined
	}

	public async sendServerExperienceModificator() {
		await this?.client?.Send(
			this?.client?.serialize(
				new ServerExperienceModificatorMessage(
					ConfigurationManager.getInstance().XpRate * 100
				)
			)
		)
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

	public replyWarning(value: any): void {
		this.reply(value, "DarkOrange", false, false)
	}

	public async replyError(value: any): Promise<void> {
		await this.reply(value, "DarkRed", false, false)
	}

	public async reply(
		value: any,
		color: string,
		bold: boolean = false,
		underline: boolean = false
	): Promise<void> {
		value = this.applyPolice(value, bold, underline)

		await this?.client?.Send(
			this?.client?.serialize(
				new TextInformationMessage(0, 0, [
					`<font color="#${color}">${value}</font>`,
				])
			)
		)
	}

	public async refreshStats() {
		await this?.client?.Send(
			this?.client?.serialize(
				new CharacterStatsListMessage(
					this?.stats?.getCharacterCharacteristicInformations(this)
				)
			)
		)
	}

	public async textInformation(
		msgType: TextInformationTypeEnum,
		msgId: number,
		parameters: string[]
	) {
		await this?.client?.Send(
			this?.client?.serialize(
				new TextInformationMessage(msgType, msgId, parameters)
			)
		)
	}

	public async refreshShortcuts() {
		await this.spellShortcutBar.refresh()
		await this.generalShortcutBar.refresh()
	}

	public hasSpell(spellId: number): boolean {
		return this._spells.has(spellId)
	}

	public async learnSpell(spellId: number, notify: boolean) {
		if (this.hasSpell(spellId)) return

		let spell = new CharacterSpell(spellId, false, this)
		this.spells.set(spellId, spell)

		if (spell.learned() && this.spellShortcutBar.canAdd()) {
			const spellShortcut = new CharacterSpellShortcut(
				this.spellShortcutBar.getFreeSlotId() as number,
				spellId,
				ShortcutBarEnum.SPELL_SHORTCUT_BAR
			)
			this.spellShortcutBar.addShortcut(spellShortcut)

			if (notify) {
				await this.refreshShortcuts()
				await this.textInformation(
					TextInformationTypeEnum.TEXT_INFORMATION_MESSAGE,
					3,
					[spellId.toString()]
				)
			}
		}

		if (notify) {
			await this.refreshSpells()
		}
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
		for (const finishmove of this.finishMoves.values()) {
			finishmoves.push({
				id: finishmove.id,
			})
		}
		return JSON.stringify(finishmoves)
	}

	public async onStatUpgradeResult(
		result: StatsUpgradeResultEnum,
		nbCharacBoost: number
	) {
		await this.client?.Send(
			this.client?.serialize(
				new StatsUpgradeResultMessage(result, nbCharacBoost)
			)
		)
	}

	public async disconnect() {
		await this.destroyContext()
		await this.map?.instance.removeEntity(this)
		await CharacterController.getInstance().updateCharacter(this)
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
}

export default Character
