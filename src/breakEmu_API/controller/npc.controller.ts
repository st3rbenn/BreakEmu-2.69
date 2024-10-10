import Database from "@breakEmu_API/Database"
import Logger from "../../breakEmu_Core/Logger"
import ContextEntityLook from "../../breakEmu_World/manager/entities/look/ContextEntityLook"
import Npc from "../model/npc.model"
import BaseController from "./base.controller"
import Container from "@breakEmu_Core/container/Container"
import NpcTemplate from "@breakEmu_API/model/npcTemplate.model"

class NpcController {
	logger: Logger = new Logger("NpcController")
	public container: Container = Container.getInstance()
	public database: Database = this.container.get(Database)

	async createNpc(npc: Npc): Promise<boolean> {
		try {
			const isNpcExist = await this.database.prisma.npc.findUnique({
				where: {
					id: npc.id,
				},
			})

			if (isNpcExist) {
				this.logger.error(
					"Npc already exist",
					new Error(`Npc ${isNpcExist.name} (${isNpcExist.id}) already exist`)
				)
				return false
			}

			const newNpc = await this.database.prisma.npc.create({
				data: {
					id: npc.id,
					name: npc.name,
					look: ContextEntityLook.convertToString(npc.look),
					gender: npc.gender,
					npctemplate: {
						connect: {
							id: npc.npcId,
						},
					},
					npcspawn: {
						create: {
							mapId: npc.mapId,
							cellId: npc.cellId,
							direction: npc.direction,
						},
					},
				},
			})

			if (newNpc) {
				return true
			}

			return false
		} catch (error) {
			this.logger.error("Error while creating npc", error as any)
			return false
		}
	}

	async updateNpc(npc: Npc): Promise<boolean> {
		try {
			const isNpcExist = await this.database.prisma.npc.findUnique({
				where: {
					id: npc.id,
				},
			})

			if (!isNpcExist) {
				this.logger.error(
					"Npc not exist",
					new Error(`Npc ${npc.name} (${npc.id}) not exist`)
				)
				return false
			}

			const updatedNpc = await this.database.prisma.npc.update({
				where: {
					id: npc.id,
				},
				data: {
					id: npc.id,
					npcTemplateId: npc.npcId,
					name: npc.name,
					look: ContextEntityLook.convertToString(npc.look),
					gender: npc.gender,
				},
			})

			if (updatedNpc) {
				return true
			}

			return false
		} catch (error) {
			this.logger.error("Error while updating npc", error as any)
			return false
		}
	}

	async deleteNpc(npc: Npc): Promise<boolean> {
		try {
			const isNpcExist = await this.database.prisma.npc.findUnique({
				where: {
					id: npc.id,
				},
        select: {
          npcspawn: true,
          id: true
        }
			})

			if (!isNpcExist) {
				this.logger.error("Npc not exist", new Error(`Npc ${npc.id} not exist`))
				return false
			}

			await this.database.prisma.npc.delete({
				where: {
					id: isNpcExist.id,
				},
			})

			await this.database.prisma.npcspawn.deleteMany({
				where: {
					id: isNpcExist.npcspawn[0].id,
				},
			})

			return true
		} catch (error) {
			this.logger.error("Error while deleting npc", error as any)
			return false
		}
	}
}

export default NpcController
