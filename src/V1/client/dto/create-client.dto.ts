import { IContactWay } from "../interfaces/contact-way-interface";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateClientDto {
    @IsNotEmpty({message:"Name is required"})
    @IsString({message:"Name must be a string"})
    name:string;
    @IsArray({ message: "Contact ways must be an array" })
    contactWays:IContactWay[];
}
