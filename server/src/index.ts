//Mikro-Orm Reflect metadata. Always at front
import "reflect-metadata";
import {MikroORM} from "@mikro-orm/core"
import { EntityManager} from "@mikro-orm/mariadb";

//constants
import { __db_name__, __db_password__, __db_user__, __prod__ } from "./constants";

import { Post } from "./entities/Post";

//mikro-orm config file
import config from "./mikro-orm.config";

//Express
import express from 'express';

//ApolloServer and GraphQl
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageDisabled, ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

//Resolvers from ./resolvers folder
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import {createClient} from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";

require('dotenv').config();
const main = async()=>{

    console.log(process.env.DB_NAME);

    /********************* 
     * Mikro- Orm Setup and migration
    **********************/
    const orm = await MikroORM.init(config);
    const em=orm.em as EntityManager;
    await orm.getMigrator().up();

    /*******************
     * Express Server Initialise
     *******************/
    const app= express();

    /******************
     * Express Session with Redis Store for Authentication
     * Initialisation of RedisStore and RedisClient
     */
    const RedisStore = connectRedis(session);
    const redisClient = createClient({legacyMode:true});
    redisClient.connect().catch(console.error);

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365, //1 Year
                httpOnly: true,
                sameSite: 'lax', //csrf
                secure: __prod__ //coolor only works in https 
            },
            //TODO Change secret to environment variable
            secret: "qweqwasasdasdasmjd",
            resave: false,
            saveUninitialized:false,
        })
    );

    /**
     * Apollo Server Initialise with GraphQl
     */
    const apolloServer= new ApolloServer({
        // playground:true,
        // typeDefs:gql`
        //     type Example{
        //         message:String
        //     }

        //     type Query{
        //         queryExample:Example
        //     }

        //     type Mutation{
        //         mutationExample:Example
        //     }
        // `,
        //
        schema: await buildSchema({
            resolvers:[HelloResolver, PostResolver,UserResolver],
            validate:false, 
        }),
        //Setup to enable GraphQL Playground instead of default Apollo Server Landing Page
        plugins:[
            ApolloServerPluginLandingPageGraphQLPlayground({}),
            ApolloServerPluginLandingPageDisabled()
        ],
        //set context for GraphQl Resolvers. See resolvers on /src/resolvers
        //Access this context using @Ctx() in resolvers file
        context:({req,res}):MyContext=>({em,req,res})
        
    });

    //Start apollo Server. Require this statement.
    await apolloServer.start();

    /**
     * Express Endpoints
     */
    const posts = await em.find(Post, {});
    app.get("/",(_,res)=>{
        res.json(posts);
    });

    //Initialises Apollo and Graphql Middleware
    apolloServer.applyMiddleware({app});
    
    
    /**************
     * BroadCast server on port 4000
     */
    //TODO CHANGE PORT AND ENABLE PORT FROM NODE_ENV 
    app.listen(4000,()=>{
        console.log('server started on http://localhost:4000')
    });
    // //const post= orm.em.create(Post,{title:'Hello World', createdAt: new Date(), updatedAt:new Date()});
    // const post= new Post('Hello World');

    // await em.persistAndFlush(post);


    // // console.log('_______________________-sql 2 -------------------')
    // await em.nativeInsert(new Post("Hello World is the only beginning"));


}

main().catch(err=>{
    console.error(err);
});
