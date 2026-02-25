import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsInt()
  @IsNotEmpty()
  produtoId: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsNumber()
  @IsPositive()
  preco: number;

  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  itens: CheckoutItemDto[];

  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @IsOptional()
  @IsUrl()
  failureUrl?: string;

  @IsOptional()
  @IsUrl()
  pendingUrl?: string;
}
