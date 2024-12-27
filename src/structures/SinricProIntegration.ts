import Container from "typedi";
import SystemController from "./SystemController";
import SettingsManager from "./SettingsManager";

// @ts-ignore
const { SinricPro, startSinricPro, raiseEvent } = require("sinricpro"); // require('../../index');const

export default class SinricProIntegration {
	private sinricpro: any;
	private tempInterval: NodeJS.Timeout;
	private lastTemp = 0;

	private DEVICE_IDS = {
		BUZZER: process.env.BUZZER_DEVICE_ID as string,
		TEMP_SENSOR: process.env.TEMP_SENSOR_DEVICE_ID as string,
	} as const;

	private APP_KEY = process.env.APP_KEY;

	private APP_SECRET = process.env.APP_SECRET;

	private get deviceIds() {
		return Object.values(this.DEVICE_IDS);
	}

	private get callbacks() {
		const systemController =
			Container.get<SystemController>("systemController");
		const settingsManager =
			Container.get<SettingsManager>("settingsManager");

		const setPowerState = async (deviceId: string, data: any) => {
			const DEVICE_NAME = Object.entries(this.DEVICE_IDS).find(
				([_, v]) => v === deviceId
			)![0];
			console.log(`Power state device: ${DEVICE_NAME}, data: ${data}`);

			if (deviceId === this.DEVICE_IDS.BUZZER) {
				settingsManager.update("buzzerMode", data === "On");
			}

			return true;
		};

		const onDisconnect = () => {
			console.log("Sinric Pro connection closed");
			if (this.tempInterval)
				clearInterval(this.tempInterval);
		};

		const onConnected = async () => {
			console.log("Connected to Sinric Pro");

			await this.updateBuzzerMode(settingsManager.get("buzzerMode"));
			await this.updateTemperature(systemController.getTemp() || 0);

			// this.tempInterval = setInterval(async () => {
			// 	await this.updateTemperature(systemController.getTemp() || 0);
			// }, 5000);
		};

		return {
			setPowerState,
			onDisconnect,
			onConnected
		};
	}

	public init() {
		const sinricpro = new SinricPro(
			this.APP_KEY,
			this.deviceIds,
			this.APP_SECRET,
			true
		);
		startSinricPro(sinricpro, this.callbacks);

		this.sinricpro = sinricpro;
	}

	public async updateTemperature(temp: number) {
		if (temp === this.lastTemp)
			return;

		this.lastTemp = temp;

		await raiseEvent(
			this.sinricpro,
			"currentTemperature",
			this.DEVICE_IDS.TEMP_SENSOR,
			{ temperature: temp }
		);

	}

	public async updateBuzzerMode(mode: boolean) {
		await raiseEvent(this.sinricpro, "setPowerState", this.DEVICE_IDS.BUZZER, {
			state: mode ? "On" : "Off",
		});
	}
}
