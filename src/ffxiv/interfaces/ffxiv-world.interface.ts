import { ServerCategory } from "../enums/server-category.enum";
import { ServerStatus } from "../enums/server-status.enum";

export interface FfxivWorld {
	group: string;
	name: string;
	category: ServerCategory;
	serverStatus: ServerStatus;
	canCreateNewCharacters: boolean;
}
