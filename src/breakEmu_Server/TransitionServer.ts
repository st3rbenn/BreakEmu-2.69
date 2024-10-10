import Redis from "ioredis"
import ansiColorCodes from "@breakEmu_Core/Colors"
import Logger from "@breakEmu_Core/Logger"
import ConfigurationManager from "@breakEmu_Core/configuration/ConfigurationManager"
import Container from "@breakEmu_Core/container/Container"

abstract class TransitionServer {
	abstract logger: Logger
	private redis: Redis | null = null
	private readonly uri: string
	public container: Container = Container.getInstance()

	constructor(uri: string) {
		this.uri = uri
	}

	async connect(): Promise<void> {
		try {
			this.redis = new Redis(this.uri)

      this.redis.on("error", async (error) => {
        await this.logger.writeAsync(
          `Error connecting to TransitionServer with Redis: ${error}`,
          ansiColorCodes.red
        )
      })

      await this.logger.writeAsync(
        `Connected to TransitionServer with Redis`,
        ansiColorCodes.green
      )
		} catch (error) {
			await this.logger.writeAsync(
				`Error connecting to TransitionServer with Redis: ${error}`,
				ansiColorCodes.red
			)
		}
	}

	async disconnect(): Promise<void> {
		if (this.redis) {
			await this.redis.quit()
		}
	}

	async send(queueName: string, message: string): Promise<void> {
		if (!this.redis) {
			throw new Error("Cannot send message: Redis client is not connected")
		}

		if (this.container.get(ConfigurationManager).showDebugMessages) {
			await this.logger.writeAsync(`Sending ${queueName} to transition server`)
		}

		await this.redis.lpush(queueName, message)
	}

	async publish(channelName: string, message: string): Promise<void> {
		if (!this.redis) {
			throw new Error("Cannot publish message: Redis client is not connected")
		}

		if (this.container.get(ConfigurationManager).showDebugMessages) {
			await this.logger.writeAsync(
				`Publishing ${channelName} to transition server`
			)
		}

		await this.redis.publish(channelName, message)
	}

	async receive(queueName: string): Promise<string | undefined> {
		if (!this.redis) {
			throw new Error("Cannot receive message: Redis client is not connected")
		}
		const message = await this.redis.brpop(queueName, 0)

		if (message) {
			return message[1]
		}
	}

	async subscribeToAChannel(channelName: string): Promise<void> {
		if (!this.redis) {
			throw new Error("Cannot subscribe: Redis client is not connected")
		}

		await this.redis.subscribe(channelName)
	}

	async subscribe(
		channelName: string,
		callback: (message: string) => void
	): Promise<void> {
		if (!this.redis) {
			throw new Error("Cannot subscribe: Redis client is not connected")
		}

		const subscriber = this.redis.duplicate()
		await subscriber.subscribe(channelName)

		subscriber.on("message", (channel: string, message: string) => {
			if (channel === channelName) {
				callback(message)
			}
		})
	}

	async receiveFromChannel(channelName: string): Promise<string | undefined> {
		if (!this.redis) {
			throw new Error("Cannot receive message: Redis client is not connected")
		}

		const message = await this.redis.blpop(channelName, 0)

		if (message) {
			return message[1]
		}
	}

	async deleteKey(key: string): Promise<void> {
		if (!this.redis) {
			throw new Error("Cannot delete key: Redis client is not connected")
		}

		await this.redis.del(key)
	}

	public get redisClient(): Redis | null {
		return this.redis
	}
}

export default TransitionServer
