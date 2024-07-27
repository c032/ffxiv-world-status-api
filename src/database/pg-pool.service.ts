import { Injectable, Inject } from "@nestjs/common";

import { Pool } from "./types/pool";
import { Client } from "./types/client";

export interface QueryFunction<T> {
	(client: Client): Promise<T>;
}

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
