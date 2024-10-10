// serviceRegistry.ts
import Database from "@breakEmu_API/Database"
import BankItemController from "@breakEmu_API/controller/bankItem.controller"
import CharacterController from "@breakEmu_API/controller/character.controller"
import NpcController from "@breakEmu_API/controller/npc.controller"
import CharacterItemController from "@breakEmu_API/controller/characterItem.controller"
import WorldController from "@breakEmu_API/controller/world.controller"
import AuthTransition from "@breakEmu_Auth/AuthTransition"
import TaskManager from "@breakEmu_Core/bull/TaskManager"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import Container from "@breakEmu_Core/container/Container"
import MessageHandlers from "@breakEmu_World/MessageHandlers"
import WorldServerManager from "@breakEmu_World/WorldServerManager"
import WorldTransition from "@breakEmu_World/WorldTransition"
import CommandHandler from "@breakEmu_World/handlers/chat/command/CommandHandler"
import AchievementManager from "@breakEmu_World/manager/achievement/AchievementManager"
import JobFormulas from "@breakEmu_World/manager/formulas/JobFormulas"
import JobManager from "@breakEmu_World/manager/job/JobManager"
// import AuctionHouseItemController from "@breakEmu_API/controller/auctionHouseItem.controller"

export function registerServices(container: Container) {
	container.register(
		AuthTransition,
		new AuthTransition(process.env.REDIS_URI as string)
	)
	container.register(ConfigurationManager, new ConfigurationManager())
	container.register(Database, new Database())
	container.register(WorldServerManager, new WorldServerManager())
	container.register(
		WorldController,
		new WorldController(container.get(WorldServerManager))
	)

	container.register(
		WorldTransition,
		new WorldTransition(process.env.REDIS_URI as string)
	)
	container.register(TaskManager, new TaskManager())

	container.registerFactory(AchievementManager, () => new AchievementManager())
	container.registerFactory(JobManager, () => new JobManager())
	container.registerFactory(MessageHandlers, () => new MessageHandlers())
	container.registerFactory(CommandHandler, () => new CommandHandler())
	container.registerFactory(JobFormulas, () => new JobFormulas())
	container.registerFactory(
		CharacterItemController,
		() => new CharacterItemController()
	)
	container.registerFactory(BankItemController, () => new BankItemController())
	container.registerFactory(
		CharacterController,
		() => new CharacterController()
	)
	container.registerFactory(NpcController, () => new NpcController())
	// container.registerFactory(
	// 	AuctionHouseItemController,
	// 	() => new AuctionHouseItemController()
	// )

	// Si vous avez besoin d'une logique plus complexe pour certains services,
	// vous pouvez utiliser des factories :
	// container.registerFactory(SomeComplexService, () => {
	//     // Logique complexe d'initialisation
	//     return new SomeComplexService(/* params */);
	// });
}
