import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

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

  @IsOptional()
  @IsInt()
  vendedorId?: number;
}
