import { IsString, IsEmail, IsOptional, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;
}

export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;
}

export class AssignRoleDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    role: string;
}

export class ChangeStatusDto {
    @ApiProperty()
    @IsBoolean()
    isActive: boolean;
}
