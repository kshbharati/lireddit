import React  from "react";
import {Box} from "@chakra-ui/react"

interface WrapperProps{
    variant: 'small' | 'regular'

}

export class Wrapper extends React.Component<WrapperProps>{
    render(): React.ReactNode {
        return(
            <Box maxW={this.props.variant === 'regular'?"800px": "400px"} w="100%" marginTop="20px" mx="auto">
                {this.props.children}
            </Box>
        )
    }
}
