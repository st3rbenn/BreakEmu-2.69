/* Type for AuthConfiguration YML file */

export interface IAuthConfiguration {
	dofus: IDofusInfo
	database: IDatabaseCredentials
	debug: IDebugOptions
	authServer: IAuthServer
  worldServer: IWorldConfiguration
}

export interface IWorldConfiguration {
	host: string
	port: number
}

interface IDofusInfo {
	dofusProtocolVersion: string
	versionMajor: number
	versionMinor: number
  apLimit: number
  startAp: number
  mpLimit: number
  startMp: number
  startLevel: number
  startMapId: number
  startCellId: number
  startKamas: number
  startStatsPoints: number
  XpRate: number
}

interface IDatabaseCredentials {
	host: string
	port: number
	user: string
	password: string
	name: string
}

interface IDebugOptions {
	showDebugMessages: boolean
	showProtocolMessage: boolean
  showDatabaseLogs: boolean
}

interface IAuthServer {
	host: string
	port: number
}
