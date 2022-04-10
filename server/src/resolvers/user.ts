import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { NotFoundError, UniqueConstraintViolationException } from "@mikro-orm/core";

@InputType()
class UsernamePassswordInput{
    @Field()
    username:string
    
    @Field()
    password:string
}

@ObjectType()
class FieldError{
    @Field()
    field:string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(()=>[FieldError], {nullable:true})
    errors?: FieldError[]

    @Field(()=> User, {nullable:true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(()=>User, {nullable:true})
    async me(
        @Ctx() {req, em}:MyContext
    ){
        if(!req.session.userId)
        {
            return null;
        }
        const user = await em.findOne(User, {id:req.session.userId});
        return user;   
    }
    
    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePassswordInput)
        options: UsernamePassswordInput,
        @Ctx() { em, req }: MyContext
    ):Promise<UserResponse> {

        //Checks length of username and return if it's empty or has length less than 2
        if(options.username===null || options.username.length<=2){
            return {
                errors: [{
                    field: 'username',
                    message:'Invalid username {Username is either empty or Length must be greater than 2}'
                }]
            }    
        }

        //checks password is empty
        if(options.password===null)
        {
            return {
                errors: [{
                    field: 'password',
                    message: 'password is empty'
                }]
            }
        }

        //Return Error if Password is less than 6
        if(options.password.length<6)
        {
            return {
                errors: [{
                    field: 'password',
                    message: 'password length should be greater than 6'
                }]
            };
        }

        const hashedPassword = await argon2.hash(options.password);

        const user = new User(options.username, hashedPassword);

        try {
            await em.persistAndFlush(user);
        } catch (error) {
            if(error instanceof UniqueConstraintViolationException)
            {
                return {
                    errors: [{
                        field:'username',
                        message: 'Username already exists'
                    }]
                }
            }
        }

        req.session.userId= user.id;
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options", () => UsernamePassswordInput)
        options: UsernamePassswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        let user=null;
        try{
            user = await em.findOneOrFail(User, {
                username: options.username,
            });
        
        } catch(err){
            if(err instanceof NotFoundError)
            {   
                return {
                    errors: [{
                        field: 'username',
                        message: "username doesn't exist"
                    }]
                }
            }
        }

        
        
        if(!user)
        {
            return {
                errors: [{
                    field: 'username',
                    message: "username doesn't exist"
                }]
            };
        }

        const valid = await argon2.verify(user.password, options.password);

        if(!valid)
        {
            return {
                errors: [{
                    field: 'password',
                    message: 'Incorrect Password'
                }]
            };


        }
        req.session.userId= user.id;
        return {
            user
        }; 

    }
}
