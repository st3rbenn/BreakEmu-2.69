import Database from "@breakEmu_API/Database"
import AuctionHouse from "@breakEmu_API/model/auctionHouse.model"
import AuctionHouseItem from "@breakEmu_API/model/auctionHouseItem.model"
import CharacterItem from "@breakEmu_API/model/characterItem.model"
import Item from "@breakEmu_API/model/item.model"
import Container from "@breakEmu_Core/container/Container"
import Logger from "@breakEmu_Core/Logger"
import EffectCollection from "@breakEmu_World/manager/entities/effect/EffectCollection"

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

	async getItemsSoldBySellerId(sellerId: number) {
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

	async addNewItem(
		sellerId: number,
		auctionHouseId: number,
		price: number,
		item: CharacterItem
	): Promise<AuctionHouseItem | null> {
		try {
			const newItem = await this.database.prisma.auctionHouseItem.create({
				data: {
					auctionHouseId: auctionHouseId,
					sellerId: sellerId,
					price: price,
					apparenceId: item.appearanceId,
					effects: item.effects.saveAsJson(),
					position: item.position,
					quantity: item.quantity,
					gId: item.gId,
				},
			})

			if (newItem) {
				const auctionHouseItem = new AuctionHouseItem(
					newItem.uid,
					newItem.gId,
					newItem.price,
					newItem.position,
					newItem.quantity,
					EffectCollection.loadFromJson(newItem.effects?.toString() as string),
					newItem.apparenceId,
					newItem.look || "",
					auctionHouseId,
					sellerId,
					false
				)

				return auctionHouseItem
			}

			return null
		} catch (error) {
			this.logger.error(
				`Error while adding new item to auction house`,
				error as any
			)
			return null
		}
	}

	async getItemsBySellerId(sellerId: number) {
		try {
			const items = await this.database.prisma.auctionHouseItem.findMany({
				where: {
					sellerId,
				},
			})

			const auctionHouseItems: AuctionHouseItem[] = []

			for (const item of items) {
				const newAuctionHouseItem = new AuctionHouseItem(
					item.uid,
					item.gId,
					item.price,
					item.position,
					item.quantity,
					EffectCollection.loadFromJson(item.effects?.toString() || ""),
					item.apparenceId,
					item.look || "",
					item.auctionHouseId,
					item.sellerId,
					item.sold
				)
				auctionHouseItems.push(newAuctionHouseItem)
			}

			return auctionHouseItems
		} catch (error) {
			this.logger.error(
				`Error while getting items sold by seller ${sellerId}`,
				error as any
			)
		}
	}

  async updateItemPrice(item: AuctionHouseItem): Promise<void> {
    try {
      await this.database.prisma.auctionHouseItem.update({
        where: {
          uid: item.id,
        },
        data: {
          price: item.price,
        },
      })
    } catch (error) {
      this.logger.error(
        `Error while updating price of item ${item.id}`,
        error as any
      )
    }
  }
}

export default AuctionHouseItemController
