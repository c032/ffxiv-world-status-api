import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const corsOptions = {
		// TODO: Get from config.
		origin: "https://c032.dev",
	};
	app.enableCors(corsOptions);

	// TODO: Cleanup.
	const port = parseInt(process.env.PORT || "", 10);
	if (port.toString() !== process.env.PORT || port === 0) {
		throw new Error(
			"Required environment variable `PORT` is missing or invalid.",
		);
	}

	await app.listen(port);
}

bootstrap();
