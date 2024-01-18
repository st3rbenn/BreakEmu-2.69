import ConfigurationManager from "../../breakEmu_Core/configuration/ConfigurationManager"
import {
	AlmanachCalendarDateMessage,
	CharacterBaseInformations,
	CharacterLoadingCompleteMessage,
	CharacterStatsListMessage,
	CurrentMapMessage,
	EmoteListMessage,
	EntityDispositionInformations,
	GameContextCreateMessage,
	GameContextDestroyMessage,
	GameContextEnum,
	GameRolePlayActorInformations,
	GameRolePlayShowActorMessage,
	InventoryContentMessage,
	InventoryWeightMessage,
	JobCrafterDirectorySettingsMessage,
	JobDescriptionMessage,
	JobExperienceMultiUpdateMessage,
	ServerExperienceModificatorMessage,
	Shortcut,
	ShortcutBarContentMessage,
	ShortcutBarEnum,
	SpellItem,
	SpellListMessage,
	TextInformationMessage,
	TextInformationTypeEnum,
} from "../../breakEmu_Server/IO"
import WorldClient from "../../breakEmu_World/WorldClient"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import CharacterShortcut from "../../breakEmu_World/manager/shortcut/character/CharacterShortcut"
import Breed from "./breed.model"
import Experience from "./experience.model"
import Job from "./job.model"
import CharacterSpell from "../../breakEmu_World/manager/entities/spell/characterSpell"
import SpellShortcutBar from "../../breakEmu_World/manager/shortcut/SpellShortcutBar"
import GeneralShortcutBar from "../../breakEmu_World/manager/shortcut/GeneralShortcutBar"
import CharacterSpellShortcut from "../../breakEmu_World/manager/shortcut/character/characterSpellShortcut"
import CharacterItemShortcut from "../../breakEmu_World/manager/shortcut/character/characterItemShortcut"

class Character {
	private _id: number
	private _accountId: number
	private _breed: Breed
	private _sex: boolean
	private _cosmeticId: number
	private _name: string
	private _experience: number
	private _look: ContextEntityLook
	private _level: number
	private _mapId: number
	private _cellId: number
	private _direction: number
	private _kamas: number

	private _stats?: EntityStats
	private _statsPoints: number
	private _knownEmotes: number[]
	private _shortcuts: Map<number, CharacterShortcut>
	private _knownOrnaments: number[]
	private _activeOrnament: number
	private _jobs: Job[]
	private _spells: Map<number, CharacterSpell>
	private _spellShortcutBar: SpellShortcutBar
	private _generalShortcutBar: GeneralShortcutBar

	private _characters: Character[] = []
	private _context: GameContextEnum | undefined

	private _client: WorldClient | undefined

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
		jobs: Job[],
		// spells: Map<number, CharacterSpell>,
		stats?: EntityStats
	) {
		this._id = id
		this._accountId = accountId
		this._breed = breed
		this._sex = sex
		this._cosmeticId = cosmeticId
		this._name = name
		this._experience = experience
		this._level = Experience.getCharacterLevel(this.experience)
		this._look = look
		this._mapId = mapId
		this._cellId = cellId
		this._direction = direction
		this._kamas = kamas
		this._stats = stats
		this._statsPoints = statsPoints
		this._knownEmotes = knownEmotes
		this._shortcuts = shortcuts
		this._spellShortcutBar = new SpellShortcutBar(this)
		this._generalShortcutBar = new GeneralShortcutBar(this)
		this._knownOrnaments = knownOrnaments
		this._activeOrnament = activeOrnament
		this._jobs = jobs
		this._spells = new Map<number, CharacterSpell>()
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
		kamas: number
	): Character {
		const startLevel = ConfigurationManager.getInstance().startLevel
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
			0,
			[1],
			new Map<number, CharacterShortcut>(),
			[],
			0,
			Job.new(),
			EntityStats.new(startLevel)
		)

		return character
	}

	//#region Getters & Setters

	public get id(): number {
		return this._id
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

	public get cosmeticId(): number {
		return this._cosmeticId
	}

	public set cosmeticId(cosmeticId: number) {
		this._cosmeticId = cosmeticId
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

	public get characters(): Character[] {
		return this._characters
	}

	public set characters(characters: Character[]) {
		this._characters = characters
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

	public get stats(): EntityStats | undefined {
		return this._stats
	}

	public set stats(stats: EntityStats | undefined) {
		this._stats = stats
	}

	public get level(): number {
		return this._level
	}

	public set level(level: number) {
		this._level = level
	}

	public get statsPoints(): number {
		return this._statsPoints
	}

	public set statsPoints(statsPoints: number) {
		this._statsPoints = statsPoints
	}

	public get jobs(): Job[] {
		return this._jobs
	}

	public get shortcuts(): Map<number, CharacterShortcut> {
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

	public toCharacterBaseInformations(): CharacterBaseInformations {
		return new CharacterBaseInformations(
			this.id,
			this.name,
			this._level,
			this.look.toEntityLook(),
			this.breed.id,
			this.sex
		)
	}

	public toGameRolePlayActorInformations(): GameRolePlayActorInformations {
		const entityDisposition = new EntityDispositionInformations(
			this.cellId,
			this.direction
		)

		return new GameRolePlayActorInformations(
			this.id,
			entityDisposition,
			this.look.toEntityLook()
		)
	}

	public async refreshJobs() {
		await this?.client?.Send(
			this?.client?.serialize(
				new JobCrafterDirectorySettingsMessage(
					this.jobs.map((x) => x.getDirectorySettings())
				)
			)
		)
		await this?.client?.Send(
			this?.client?.serialize(
				new JobDescriptionMessage(this.jobs.map((x) => x.getJobDescription()))
			)
		)
		await this?.client?.Send(
			this?.client?.serialize(
				new JobExperienceMultiUpdateMessage(
					this.jobs.map((x) => x.getJobExperience())
				)
			)
		)
	}

	public async sendGameRolePlayActorInformations() {
		const entityDisposition = new EntityDispositionInformations(
			this.cellId as number,
			this.direction as number
		)
		const gameRolePlayShowActorMessage = new GameRolePlayActorInformations(
			this.id,
			entityDisposition,
			this.look.toEntityLook()
		)

		await this?.client?.Send(
			this?.client?.serialize(
				new GameRolePlayShowActorMessage(gameRolePlayShowActorMessage)
			)
		)
	}

	public async refreshSpells() {

    const spellItems: SpellItem[] = []

    for (const spell of this.spells.values()) {
      spellItems.push(spell.getSpellItem(this))
    }

		await this?.client?.Send(
			this?.client?.serialize(
        new SpellListMessage(false, spellItems)
        )
		)
	}

	// public refreshGuild() {
	//   if(this._guildId === 0) return

	// }

	public async onCharacterLoadingComplete() {
		await this.onConnected()
		this.reply("Bienvenue sur BreakEmu !", "DarkGreen", true, true)
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

	public async teleport(mapId: number, cellId: number) {
		await this?.client?.Send(
			this?.client?.serialize(new CurrentMapMessage(mapId))
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

	public replyError(value: any): void {
		this.reply(value, "DarkRed", false, false)
	}

	public reply(
		value: any,
		color: string,
		bold: boolean = false,
		underline: boolean = false
	): void {
		value = this.applyPolice(value, bold, underline)
		// Remplacez la ligne suivante par votre propre logique d'envoi
		this?.client?.Send(
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

	public async refreshInventory() {
		await this?.client?.Send(
			this?.client?.serialize(new InventoryContentMessage([], this.kamas))
		)
		// this.refreshWeight(client)
	}

	public refreshWeight() {
		this?.client?.Send(
			this?.client?.serialize(new InventoryWeightMessage(0, 0, 1000))
		)
	}

	public async refreshShortcuts() {
		await this.spellShortcutBar.refresh()
		await this.generalShortcutBar.refresh()
	}

	public hasSpell(spellId: number): boolean {
		return this._spells.has(spellId)
	}

	public learnSpell(spellId: number, notify: boolean) {
		if (this.hasSpell(spellId)) return

		let spell = new CharacterSpell(spellId)
		this.spells.set(spellId, spell)

		if (spell.learned(this) && this.spellShortcutBar.canAdd()) {
			this.spellShortcutBar.add(spellId)

			if (notify) {
				this.refreshShortcuts()
			}
		}
	}

	public saveShortcutsAsJson(): string {
		let shortcuts = []
		for (const shortcut of this.shortcuts.values()) {
			shortcuts.push({
				barType: shortcut.barType,
				slotId: shortcut.slotId,
				spellId:
					shortcut instanceof CharacterSpellShortcut ? shortcut.spellId : null,
				itemUid:
					shortcut instanceof CharacterItemShortcut ? shortcut.itemUid : null,
				itemGid:
					shortcut instanceof CharacterItemShortcut ? shortcut.itemGid : null,
			})
		}
		return JSON.stringify(shortcuts)
	}

	public static loadShortcutsFromJson(
		json: any
	): Map<number, CharacterShortcut> {
		const shortcuts = new Map<number, CharacterShortcut>()
		for (const shortcut of json) {
			if (shortcut.barType === ShortcutBarEnum.GENERAL_SHORTCUT_BAR) {
				shortcuts.set(
					shortcut.slotId,
					new CharacterItemShortcut(
						shortcut.slotId,
						shortcut.itemUid,
						shortcut.itemGid,
						shortcut.barType
					)
				)
			} else if (shortcut.barType === ShortcutBarEnum.SPELL_SHORTCUT_BAR) {
				shortcuts.set(
					shortcut.slotId,
					new CharacterSpellShortcut(
						shortcut.slotId,
						shortcut.spellId,
						shortcut.barType
					)
				)
			}
		}
		return shortcuts
	}
}

export default Character
