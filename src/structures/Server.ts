import express from "express";
import Container from "typedi";
import SettingsManager from "./SettingsManager";
import SystemController from "./SystemController";

export default class Server {
	private app: express.Application;
	private port: number;

	public constructor() {
		this.port = parseInt(process.env.PORT as string);

		this.app = express();
		this.config();
		this.setRoutes();
	}

	private config() {
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.json());
	}

	private setRoutes() {
		this.app.post("/config", async (req, res) => {
			const settingsManager = Container.get<SettingsManager>("settingsManager");

			const { key, value } = req.body;

			// Validate Key
			if (!settingsManager.validateKey(key)) {
				res.status(400).json({ error: "unknown key" });
				return;
			}

			// Validate Value
			if (!settingsManager.validateValue(key, value)) {
				res.status(400).json({ error: "incorrect value type" });
				return;
			}

			// set config parameters
			settingsManager.update(key, value);

			if (key === "buzzerMode" && value === false) {
				const systemController = Container.get<SystemController>("systemController");
				await systemController.disableBuzzer();
			}

			res.status(200).json({ key, value: settingsManager.get(key) });
		});

		this.app.get("/temp", (req, res) => {
			// query current temperature
			const systemController = Container.get<SystemController>("systemController");
			const temp = systemController.getTemp();

			res.status(200).json({ temp });
		});

		this.app.get("/settings", (req, res) => {
			// query current settings
			const settingsManager = Container.get<SettingsManager>("settingsManager");
			const settings = settingsManager.getAll();

			res.status(200).json(settings);
		});
	}

	public start() {
		this.app.listen(this.port, () => {
			console.log(`Started server on http://localhost:${this.port}`);
		});
	}
}
