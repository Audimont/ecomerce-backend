import {
  IsInt,
  IsArray,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsBoolean()
  installationRequested?: boolean;

  @IsNumber()
  installationSlotId?: number;
}

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}
