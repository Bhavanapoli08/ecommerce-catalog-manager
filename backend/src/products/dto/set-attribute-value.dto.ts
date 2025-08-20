import { IsUUID, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetAttributeValueDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsUUID()
  categoryAttributeId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  valueText?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  valueNumber?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  valueBool?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  valueDate?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  optionId?: string;
}
