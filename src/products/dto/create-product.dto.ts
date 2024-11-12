import { Transform } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
  
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;
}
