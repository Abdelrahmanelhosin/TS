import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    role: string;
}

export class SetResearchPermissionDto {
    @ApiProperty()
    @IsBoolean()
    is_researcher: boolean;
}

