import { IsInt, IsArray, IsNotEmpty } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}
