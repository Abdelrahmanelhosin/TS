import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto, ChangeStatusDto } from './dto/user.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles('ADMIN')
    @Get()
    @ApiOperation({ summary: 'Get all users with filtering (Admin only)' })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'role', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    findAll(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.usersService.findAll(
            skip ? parseInt(skip, 10) : undefined,
            take ? parseInt(take, 10) : undefined,
            search,
            role,
            isActive !== undefined ? isActive === 'true' : undefined,
        );
    }
    @Roles('ADMIN', 'user', 'researcher')
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    @Roles('ADMIN')
    @Patch(':id')
    @ApiOperation({ summary: 'Update user info (Admin only)' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Roles('ADMIN')
    @Patch(':id/role')
    @ApiOperation({ summary: 'Assign role (Admin only)' })
    assignRole(@Param('id', ParseUUIDPipe) id: string, @Body() assignRoleDto: AssignRoleDto) {
        return this.usersService.assignRole(id, assignRoleDto.role);
    }

    @Roles('ADMIN')
    @Patch(':id/status')
    @ApiOperation({ summary: 'Change user status (Admin only)' })
    changeStatus(@Param('id', ParseUUIDPipe) id: string, @Body() changeStatusDto: ChangeStatusDto) {
        return this.usersService.changeStatus(id, changeStatusDto.isActive);
    }
}
