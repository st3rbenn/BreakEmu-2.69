

/* Type for AuthConfiguration YML file */

export interface IAuthConfiguration {
  dofus: IDofusInfo
  database: IDatabaseCredentials
  debug: IDebugOptions
  authServer: IAuthServer
}

interface IDofusInfo {
  dofusProtocolVersion: string
  versionMajor: number
  versionMinor: number
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
  showMessageProtocol: boolean
}

interface IAuthServer {
  host: string
  port: number
}