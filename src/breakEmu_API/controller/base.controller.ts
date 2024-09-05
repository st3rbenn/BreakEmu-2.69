import { Socket } from "net"
import Logger from "@breakEmu_Core/Logger"
import Database from "../Database"
import AuthClient from "@breakEmu_Auth/AuthClient"
import WorldServer from "@breakEmu_World/WorldServerManager"
import Container from "@breakEmu_Core/container/Container"

abstract class BaseController {
	protected _logger: Logger = new Logger("BaseController")
	protected container: Container = Container.getInstance()
	protected _database: Database = this.container.get(Database)

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
