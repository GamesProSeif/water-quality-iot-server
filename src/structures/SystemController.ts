import Container from "typedi";
import SettingsManager from "./SettingsManager";
import MQTTClient from "./MQTTClient";
import SinricProIntegration from "./SinricProIntegration";

export default class SystemController {
	private temp: number | null = null;
	private buzzerTriggered = false;

	public async updateTemp(temp: number) {
		this.temp = temp;

		const sinricProIntegration = Container.get<SinricProIntegration>("sinricProIntegration");
		await sinricProIntegration.updateTemperature(temp);

		const settingsManager = Container.get<SettingsManager>("settingsManager");
		const { min, max, buzzerMode } = settingsManager.getAll();

		if ((this.temp < min || this.temp > max) && buzzerMode)
			this.triggerBuzzer();
		else if (this.temp >= min || this.temp <= max)
			this.disableBuzzer();
	}

	public getTemp() {
		return this.temp;
	}

	public async triggerBuzzer() {
		if (this.buzzerTriggered)
			return;

		const mqttClient = Container.get<MQTTClient>("mqttClient");
		await mqttClient.publish(process.env.MQTT_TOPIC as string, "trigger_buzzer");

		this.buzzerTriggered = true;
		console.log("Buzzer Triggered");
	}

	public async disableBuzzer() {
		if (!this.buzzerTriggered)
			return;

		const mqttClient = Container.get<MQTTClient>("mqttClient");
		await mqttClient.publish(process.env.MQTT_TOPIC as string, "disable_buzzer");

		this.buzzerTriggered = false;
		console.log("Buzzer Disabled");
	}
}
