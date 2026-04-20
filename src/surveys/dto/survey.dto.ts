import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSurveyDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    survey_link: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    completion_code: string;

    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_gender?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_age_group?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_city?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_education?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_occupation?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_sector?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_position?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_income?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_marital_status?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_child_count?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_employment_status?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_nationality?: string[];
}

export class UpdateSurveyDto {
    @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() title?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() description?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() survey_link?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() completion_code?: string;

    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_gender?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_age_group?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_city?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_education?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_occupation?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_sector?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_position?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_income?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_marital_status?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_child_count?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_employment_status?: string[];
    @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) target_nationality?: string[];
}

