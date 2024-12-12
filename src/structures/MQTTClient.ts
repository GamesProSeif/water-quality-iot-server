import mqtt, { MqttClient } from "mqtt";
import Container from "typedi";
import SystemController from "./SystemController";

export default class MQTTClient {
	private client: MqttClient;

	private setEventListeners() {
		// Event: Message received on the subscribed topic
		this.client.on("message", (topic, message) => {
			console.log(`Message received on topic '${topic}': ${message.toString()}`);

			if (message.toString().startsWith("temp:")) {
				try {
					const temp = parseFloat(message.toString().split(":")[1]);

					const systemController = Container.get<SystemController>("systemController");
					systemController.updateTemp(temp);
				} catch (error) {
					console.error("Error while parsing temp message:", error);
				}
			}
		});

		// Event: Error
		this.client.on("error", (err) => {
			console.error(`MQTT client error: ${err.message}`);
		});

		// Event: Disconnected from the broker
		this.client.on("close", () => {
			console.log("Disconnected from MQTT broker");
		});
	}

	public async connectToBroker() {
		try {
			this.client = await mqtt.connectAsync(process.env.BROKER_URL as string, {
				host: process.env.BROKER_URL,
				username: process.env.BROKER_USERNAME,
				password: process.env.BROKER_PASSWORD,
				port: parseInt(process.env.BROKER_PORT as string),
				protocol: "mqtts"
			});
			console.log("Connected to MQTT broker");

			await this.client.subscribeAsync(process.env.MQTT_TOPIC as string);
			console.log("Subscribed to topic successfully");

			this.setEventListeners();
		} catch (error) {
			console.error("Error while connecting:", error);
		}
	}

	public async publish(topic: string, message: string) {
		try {
			await this.client.publishAsync(topic, message);
			console.log(`Published to topic: ${topic}`);
		} catch (error) {
			console.error(`Failed to publish to topic ${topic}:`, error);
		}
	}
}