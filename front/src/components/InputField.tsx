import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'


type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name:string;
    label: string;
};

// interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement>{
//     name:string,
//     label: string,
//     placeholder: string;
// }

const InputField: React.FC<InputFieldProps> = ({label, size: _, ...props}) => {
    const [field, {error}] = useField(props);

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <Input {...field} {...props} id={field.name}  />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
}

export default InputField;
// export default class InputField extends React.Component<InputFieldProps>{
//     render([field, {error}]= useField(this.props)): React.ReactNode {
//         return(
//             <FormControl isInvalid={!!error}>
//                 <FormLabel htmlFor={field.name}>{this.props.label}</FormLabel>
//                 <Input {...field} id={field.name} placeholder={this.props.placeholder} />
//                 {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
//             </FormControl>
//         );
//     }
// }
