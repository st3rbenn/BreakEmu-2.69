import Database from "@breakEmu_API/Database"
import AuctionHouse from "@breakEmu_API/model/auctionHouse.model"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"

class AuctionHouseItemController {
	logger: Logger = new Logger("AuctionHouseItemController")
	public container: Container = Container.getInstance()
	public database: Database = this.container.get(Database)

	async modifySoldStatus(
		itemId: number,
		price: number,
    auctionHouse: AuctionHouse,
		sold: boolean
	): Promise<void> {
    try {
      await this.database.prisma.auctionHouseItem.update({
        where: {
          uid: itemId,
          auctionHouseId: auctionHouse.id,
          price,
        },
        data: {
          sold,
        },
      })
      auctionHouse.items.delete(itemId)
    } catch (error) {
      this.logger.error(
        `Error while modifying sold status for item ${itemId}`,
        error as any
      )
    }
  }

  async removeItem(itemId: number, auctionHouse: AuctionHouse): Promise<void> {
    try {
      await this.database.prisma.auctionHouseItem.delete({
        where: {
          uid: itemId,
          auctionHouseId: auctionHouse.id,
        },
      })

      auctionHouse.items.delete(itemId)
    } catch (error) {
      this.logger.error(
        `Error while removing item ${itemId} from auction house`,
        error as any
      )
    }
  }

  async getItemSoldBySellerId(
    sellerId: number,
  ) {
    try {
      const items = await this.database.prisma.auctionHouseItem.findMany({
        where: {
          sellerId,
          sold: true,
        },
      })

      return items
    } catch (error) {
      this.logger.error(
        `Error while getting items sold by seller ${sellerId}`,
        error as any
      )
    }
  }
}

export default AuctionHouseItemController
