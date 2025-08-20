import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttrDataType } from '@prisma/client';

export class CreateAttributeDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ enum: AttrDataType })
  @IsEnum(AttrDataType)
  dataType: AttrDataType;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = false;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number = 0;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minNumber?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxNumber?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  regex?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxLength?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hint?: string;
}
