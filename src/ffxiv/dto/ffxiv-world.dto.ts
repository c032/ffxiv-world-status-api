export interface FfxivWorldDto {
	group: string;
	name: string;
	category: string;
	serverStatus: string;
	canCreateNewCharacters: boolean;

	isOnline: boolean;
	isMaintenance: boolean;

	isCongested: boolean;
	isPreferred: boolean;
	isNew: boolean;
}
