import ConfigurationManager from "../../breakEmu_Core/configuration/ConfigurationManager"
import {
	ActorExtendedAlignmentInformations,
	AlmanachCalendarDateMessage,
	CharacterBaseInformations,
	CharacterCharacteristicsInformations,
	CharacterLoadingCompleteMessage,
	CharacterStatsListMessage,
	CurrentMapMessage,
	EmoteListMessage,
	EntityDispositionInformations,
	GameContextCreateMessage,
	GameContextDestroyMessage,
	GameContextEnum,
	GameRolePlayActorInformations,
	InventoryContentMessage,
	InventoryWeightMessage,
	JobCrafterDirectorySettingsMessage,
	JobDescriptionMessage,
	JobExperienceMultiUpdateMessage,
	ServerExperienceModificatorMessage,
	ShortcutBarContentMessage,
	SpellListMessage,
	TextInformationMessage,
	TextInformationTypeEnum,
} from "../../breakEmu_Server/IO"
import WorldClient from "../../breakEmu_World/WorldClient"
import BreedManager from "../../breakEmu_World/manager/breed/BreedManager"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import EntityStats from "../../breakEmu_World/manager/entities/stats/entityStats"
import CharacterShortcut from "../../breakEmu_World/manager/shortcut/characterShortcut"
import Breed from "./breed.model"
import Experience from "./experience.model"
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
	private _shortcuts: CharacterShortcut[]
	private _knownOrnaments: number[]
	private _activeOrnament: number
	// private _spells: CharacterSpell[]

	private _characters: Character[] = []
	private _context: GameContextEnum | undefined

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
		shortcuts: CharacterShortcut[],
		knownOrnaments: number[],
		activeOrnament: number,
		stats?: EntityStats
		// spells: CharacterSpell[]
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
		this._knownOrnaments = knownOrnaments
		this._activeOrnament = activeOrnament
		// this._spells = spells
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
	) {
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
			[] as CharacterShortcut[],
			[],
			0,
			EntityStats.new(startLevel)
		)

		return character
	}

	//#region Getters & Setters

	public get id(): number {
		return this._id
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

	public characterCharacteristicsInformations() {
		const alignementInfos: ActorExtendedAlignmentInformations = new ActorExtendedAlignmentInformations(
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		)
		// const charac = new CharacterCharacteristic(1)

		const stats = new CharacterCharacteristicsInformations(
			this.experience,
			Experience.getCharacterExperienceLevelFloor(this._level),
			Experience.getCharacterExperienceNextLevelFloor(this._level),
			0,
			this.kamas,
			alignementInfos,
			[],
			0,
			[],
			0
		)

		return stats
	}

  public toGameRolePlayActorInformations(): GameRolePlayActorInformations {
    const entityDisposition = new EntityDispositionInformations(
      this.cellId,
      this.direction
    );

    return new GameRolePlayActorInformations(
      this.id,
      entityDisposition,
      this.look.toEntityLook()
    );
  }

	public refreshJobs(client: WorldClient) {
		client.Send(
			client.serialize(
				new JobCrafterDirectorySettingsMessage(
					[]
					// Record.Jobs.Select((x) => x.GetDirectorySettings()).ToArray()
				)
			)
		)
		client.Send(
			client.serialize(
				new JobDescriptionMessage(
					[]
					// Record.Jobs.Select((x) => x.GetJobDescription()).ToArray()
				)
			)
		)
		client.Send(
			client.serialize(
				new JobExperienceMultiUpdateMessage(
					[]
					// Record.Jobs.Select((x) => x.GetJobExperience()).ToArray()
				)
			)
		)
	}

	public refreshSpells(client: WorldClient) {
		client.Send(
			client.serialize(
				new SpellListMessage(
					false,
					[]
					// Record.Spells.Select((x) => x.GetSpellItem(this)).ToArray()
				)
			)
		)
	}

	// public refreshGuild(client: WorldClient) {
	//   if(this._guildId === 0) return

	// }

	public onCharacterLoadingComplete(client: WorldClient) {
		this.onConnected(client)
		this.reply(client, "Bienvenue sur BreakEmu !", "DarkGreen", true, true)
		client.Send(client.serialize(new CharacterLoadingCompleteMessage()))
	}

	public onConnected(client: WorldClient) {
		this.textInformation(
			client,
			TextInformationTypeEnum.TEXT_INFORMATION_ERROR,
			89,
			[]
		)
		client.Send(client.serialize(new AlmanachCalendarDateMessage(1)))
	}

	public destroyContext(client: WorldClient) {
		client.Send(client.serialize(new GameContextDestroyMessage()))
		this._context = undefined
	}

	public sendServerExperienceModificator(client: WorldClient) {
		client.Send(
			client.serialize(
				new ServerExperienceModificatorMessage(
					ConfigurationManager.getInstance().XpRate * 100
				)
			)
		)
	}

  public teleport(client: WorldClient, mapId: number, cellId: number) {
    client.Send(client.serialize(new CurrentMapMessage(mapId)));
  }

	public createContext(client: WorldClient, context: number) {
		client.Send(client.serialize(new GameContextCreateMessage(context)))
		this._context = context
	}

	public refreshEmotes(client: WorldClient) {
		client.Send(client.serialize(new EmoteListMessage([])))
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

	public replyWarning(client: WorldClient, value: any): void {
		this.reply(client, value, "DarkOrange", false, false)
	}

	public replyError(client: WorldClient, value: any): void {
		this.reply(client, value, "DarkRed", false, false)
	}

	public reply(
		client: WorldClient,
		value: any,
		color: string,
		bold: boolean = false,
		underline: boolean = false
	): void {
		value = this.applyPolice(value, bold, underline)
		// Remplacez la ligne suivante par votre propre logique d'envoi
		client.Send(
			client.serialize(
				new TextInformationMessage(0, 0, [
					`<font color="#${color}">${value}</font>`,
				])
			)
		)
	}

  public refreshStats(client: WorldClient) {
    client.Send(client.serialize(new CharacterStatsListMessage(this.characterCharacteristicsInformations())));
  }

	public textInformation(
		client: WorldClient,
		msgType: TextInformationTypeEnum,
		msgId: number,
		parameters: string[]
	) {
		client.Send(
			client.serialize(new TextInformationMessage(msgType, msgId, parameters))
		)
	}

	public refreshInventory(client: WorldClient) {
		client.Send(client.serialize(new InventoryContentMessage([], this.kamas)))
		// this.refreshWeight(client)
	}

	public refreshWeight(client: WorldClient) {
		client.Send(client.serialize(new InventoryWeightMessage(0, 0, 1000)))
	}

	public refreshShortcuts(client: WorldClient) {
		client.Send(client.serialize(new ShortcutBarContentMessage(1, [])))
	}
}

export default Character
