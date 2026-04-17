import { Controller, Get, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AssignRoleDto, SetResearchPermissionDto } from './dto/admin.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users')
    @ApiOperation({ summary: 'Get all users with filtering' })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'take', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'role', required: false, type: String })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    getAllUsers(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.adminService.getAllUsers(
            skip ? parseInt(skip, 10) : undefined,
            take ? parseInt(take, 10) : undefined,
            search,
            role,
        );
    }

    @Get('users/:id')
    @ApiOperation({ summary: 'Get user details by ID including surveys' })
    getUserDetails(@Param('id', ParseUUIDPipe) id: string) {
        return this.adminService.getUserDetails(id);
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Assign a role to a user' })
    assignRole(@Param('id', ParseUUIDPipe) id: string, @Body() assignRoleDto: AssignRoleDto) {
        return this.adminService.assignRole(id, assignRoleDto.role);
    }

    @Patch('users/:id/research-permission')
    @ApiOperation({ summary: 'Grant or revoke research creation permission' })
    setResearchPermission(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetResearchPermissionDto) {
        return this.adminService.setResearchPermission(id, dto.is_researcher);
    }
}
