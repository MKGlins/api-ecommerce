import { IsString, IsNumber, IsPositive, Min, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProductDto {
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nome: string;

    @IsString()
    descricao: string;

    @IsNumber()
    @IsPositive() 
    preco: number;

    @IsInt()
    @Min(0)
    estoque: number;
}
