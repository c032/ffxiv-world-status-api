import { Injectable } from "@nestjs/common";
import * as pg from "pg";

@Injectable()
export class DbConnectionService extends pg.Client {}
