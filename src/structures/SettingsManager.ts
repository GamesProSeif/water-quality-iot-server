interface ISettings {
	min: number;
	max: number;
	buzzerMode: boolean;
}

export default class SettingsManager {
	// Default settings
	private settings: ISettings = {
		min: 15,
		max: 30,
		buzzerMode: true
	};

	public get<T extends keyof ISettings >(key: T): ISettings[T] {
		return this.settings[key];
	}

	public getAll() {
		return { ...this.settings };
	}

	public update<T extends keyof ISettings>(key: T, value: ISettings[T]) {
		this.settings[key] = value;
	}

	public validateKey(key: unknown): key is keyof ISettings {
		if (typeof key === "string" && ["min", "max", "buzzerMode"].includes(key))
			return true;
		else return false;
	}

	public validateValue<T extends keyof ISettings>(key: T, value: unknown): value is ISettings[T] {
		if (key === "min" || key === "max")
			return typeof value === "number";
		else if (key === "buzzerMode")
			return typeof value === "boolean";
		else return false;
	}
}
