import * as fs from "node:fs";

import { Injectable } from "@nestjs/common";

import { keywordValueToUri } from "postgresql-keyword-value-to-uri";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (typeof value !== "string" || value === "") {
    throw new Error(`environment variable ${key} must be non-empty`);
  }

  return value;
}

function readConnectionStringFromFile(file: string): string {
  let connectionString: string = fs.readFileSync(file, "utf8");
  connectionString = connectionString.trim();

  return connectionString;
}

@Injectable()
export class ConfigService {
  public get postgresqlConnectionStringFile(): string {
    return getRequiredEnv("POSTGRESQL_CONNECTION_STRING_FILE");
  }

  public get postgresqlConnectionString(): string {
    const file = this.postgresqlConnectionStringFile;

    const kvConnectionString = readConnectionStringFromFile(file);
    const connectionStringUri = keywordValueToUri(kvConnectionString);

    return connectionStringUri;
  }
}
