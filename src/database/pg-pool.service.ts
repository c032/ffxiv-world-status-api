import { Inject, Injectable } from "@nestjs/common";

import { Client } from "./types/client";
import { Pool } from "./types/pool";

export type QueryFunction<T> = (client: Client) => Promise<T>;

@Injectable()
export class PgPoolService {
	constructor(@Inject("PG_POOL") private readonly pgPool: Pool) {}

	public async useClient<T>(fn: QueryFunction<T>): Promise<T> {
		const client = await this.pgPool.connect();
		try {
			return await fn(client);
		} finally {
			client.release();
		}
	}
}
