import Database from "@breakEmu_API/Database"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"

class AuctionHouseItemController {
	logger: Logger = new Logger("AuctionHouseItemController")
	public container: Container = Container.getInstance()
	public database: Database = this.container.get(Database)

	async modifySoldStatus(
		itemId: number,
		price: number,
    auctionHouseId: number,
		sold: boolean
	): Promise<void> {
    try {
      await this.database.prisma.auctionHouseItem.update({
        where: {
          uid: itemId,
          auctionHouseId,
          price,
        },
        data: {
          sold,
        },
      })
    } catch (error) {
      this.logger.error(
        `Error while modifying sold status for item ${itemId}`,
        error as any
      )
    }
  }

  async removeItem(itemId: number, auctionHouseId: number): Promise<void> {
    try {
      await this.database.prisma.auctionHouseItem.delete({
        where: {
          uid: itemId,
          auctionHouseId,
        },
      })
    } catch (error) {
      this.logger.error(
        `Error while removing item ${itemId} from auction house`,
        error as any
      )
    }
  }
}

export default AuctionHouseItemController
