import PgPool from "pg-pool";

import { Client } from "./client";

export type Pool = PgPool<Client>;
