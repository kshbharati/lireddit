import { AbstractSqlConnection, AbstractSqlDriver, EntityManager } from "@mikro-orm/mariadb";
import { Request, Response} from "express";


export type MyContext = {
    em: EntityManager<AbstractSqlDriver<AbstractSqlConnection>>,
    req: Request,
    res: Response
}