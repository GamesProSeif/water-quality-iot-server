require("dotenv").config();

import Container from "typedi";
import Server from "./structures/Server";
import SettingsManager from "./structures/SettingsManager";
import MQTTClient from "./structures/MQTTClient";
import SystemController from "./structures/SystemController";

async function main() {
	const settingsManager = new SettingsManager();
	Container.set("settingsManager", settingsManager);

	const systemController = new SystemController();
	Container.set("systemController", systemController);

	const mqttClient = new MQTTClient();
	await mqttClient.connectToBroker();
	Container.set("mqttClient", mqttClient);

	const server = new Server();
	server.start();
	Container.set("server", server);
}

main();
