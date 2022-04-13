import React, { Component } from 'react';
import { Form, Formik} from 'formik';
import { Button } from '@chakra-ui/react';
import {Wrapper} from '../components/Wrapper'
import InputField from '../components/InputField'
import { useMutation } from 'urql';

const REGISTER_MUTATION = `
    mutation Register($username: String!, $password:String!){
        register(options:{username:$username,password:$password}){
            errors{
                field
                message
            }
            
            user{
                id
                createdAt
                updatedAt
                username
            }
        }
    }`;

interface registerProps{}

 const Register: React.FC<registerProps> = ({})=> {

    const [,register] = useMutation(REGISTER_MUTATION);
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ username: "", password: ""
                }}
                onSubmit={async (values) => {
                    const response= register(values);
                    
                }}
            >
                {({isSubmitting,setSubmitting}) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="username"
                            label="Username"
                        />
                        <InputField
                            name="password"
                            placeholder="password"
                            label="Password"
                            type="password"
                        />
                        <Button type='submit' 
                            isLoading={isSubmitting}
                        color='teal'>Register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Register;