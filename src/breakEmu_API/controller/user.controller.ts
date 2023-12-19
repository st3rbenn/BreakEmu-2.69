import { AuthClient } from "../../breakEmu_Auth/AuthClient"
import Logger from "../../breakEmu_Core/Logger"
import Database from "../Database"
import Account from "../model/account.model"
import BaseController from "./base.controller"

class UserController extends BaseController {
	public _logger: Logger = new Logger("AuthController")
	public _database: Database = Database.getInstance()

	constructor(client: AuthClient) {
		super(client)
	}
  public initialize(): void {
    throw new Error("Method not implemented.")
  }



  async update(account: Account) {
    try {
      const user = await this._database.prisma.user.findUnique({
        where: {
          username: account.username,
        },
      })

      if (!user) {
        await this._logger.writeAsync(`User ${account.username} not found`)
        return
      }


      // await this._database.prisma.user.update({
      //   data: {

      //   }
      // })
    } catch (error) {
      await this._logger.writeAsync(`Error while updating account ${account.username}`)
    }
  }
}