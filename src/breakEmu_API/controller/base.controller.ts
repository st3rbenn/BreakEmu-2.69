import { Socket } from "net"
import Logger from "@breakEmu_Core/Logger"
import Database from "../Database"
import AuthClient from "@breakEmu_Auth/AuthClient"
import WorldServer from "@breakEmu_World/WorldServerManager"

abstract class BaseController {
	protected _logger: Logger = new Logger("BaseController")
	protected _database: Database = Database.getInstance()

	private _socket: AuthClient | WorldServer

	constructor(socket: AuthClient | WorldServer) {
		this._socket = socket
	}

	public get AuthClient(): AuthClient {
		return this._socket as AuthClient
	}

	public get WorldServer(): WorldServer {
		return this._socket as WorldServer
	}

	public abstract initialize(): void
}

export default BaseController
