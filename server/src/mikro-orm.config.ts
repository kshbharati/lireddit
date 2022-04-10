import { MikroORM } from "@mikro-orm/core";
import { __db_name__, __db_password__, __db_user__, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
import { User } from "./entities/User";

export default {
    migrations:{
        path: path.join(__dirname,"./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
        disableForeignKeys: true
    },
    entities: [Post,User],
    dbName: 'lireddit',
    user: 'henge',
    password:'1996',
    type: 'mariadb',
    debug: !__prod__,
    allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];