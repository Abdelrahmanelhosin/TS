import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('surveys')
@Controller()
export class SurveysController {
    constructor(private readonly surveysService: SurveysService) { }

    @Get('surveys')
    @ApiOperation({ summary: 'Get all approved surveys (Public)' })
    findAllApproved() {
        return this.surveysService.findAllApproved();
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('researcher')
    @Post('surveys')
    @ApiOperation({ summary: 'Create survey (Researcher only)' })
    create(@Body() createSurveyDto: CreateSurveyDto, @Request() req: any) {
        return this.surveysService.create(createSurveyDto, req.user.userId);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('researcher')
    @Get('surveys/user')
    @ApiOperation({ summary: 'Get my surveys (Researcher only)' })
    findMySurveys(@Request() req: any) {
        return this.surveysService.findByResearcher(req.user.userId);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN', 'researcher')
    @Get('surveys/:id')
    @ApiOperation({ summary: 'Get survey by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.surveysService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('researcher')
    @Patch('surveys/:id')
    @ApiOperation({ summary: 'Update my survey (Researcher only)' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSurveyDto: UpdateSurveyDto, @Request() req: any) {
        return this.surveysService.update(id, updateSurveyDto, req.user.userId);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('researcher')
    @Delete('surveys/:id')
    @ApiOperation({ summary: 'Delete my survey (Researcher only)' })
    remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
        return this.surveysService.remove(id, req.user.userId);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/surveys/pending')
    @ApiOperation({ summary: 'Get pending surveys (Admin only)' })
    findPending() {
        return this.surveysService.findPending();
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/surveys/stats')
    @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
    getStats() {
        return this.surveysService.getStats();
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/surveys/recent-pending')
    @ApiOperation({ summary: 'Get recent pending surveys for notifications (Admin only)' })
    getRecentPending() {
        return this.surveysService.getRecentPending();
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/surveys/all')
    @ApiOperation({ summary: 'Get all surveys (Admin only)' })
    findAll() {
        return this.surveysService.findAllForAdmin();
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/surveys/:id/update')
    @ApiOperation({ summary: 'Update survey reward/duration (Admin only)' })
    adminUpdate(@Param('id', ParseUUIDPipe) id: string, @Body() updateData: { reward_amount?: number, estimated_time?: number }) {
        return this.surveysService.adminUpdate(id, updateData?.reward_amount, updateData?.estimated_time);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/surveys/:id/approve')
    @ApiOperation({ summary: 'Approve survey (Admin only)' })
    approve(@Param('id', ParseUUIDPipe) id: string, @Body() updateData?: { reward_amount?: number, estimated_time?: number }) {
        return this.surveysService.approve(id, updateData?.reward_amount, updateData?.estimated_time);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/surveys/:id/reject')
    @ApiOperation({ summary: 'Reject survey (Admin only)' })
    reject(@Param('id', ParseUUIDPipe) id: string) {
        return this.surveysService.reject(id);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/surveys/:id/restore')
    @ApiOperation({ summary: 'Restore survey to pending (Admin only)' })
    restore(@Param('id', ParseUUIDPipe) id: string) {
        return this.surveysService.restore(id);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Patch('admin/surveys/:id/complete')
    @ApiOperation({ summary: 'Mark survey as completed (Admin only)' })
    complete(@Param('id', ParseUUIDPipe) id: string) {
        return this.surveysService.complete(id);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post('admin/surveys/:id/match-csv')
    @ApiOperation({ summary: 'Match CSV data with survey submissions (Admin only)' })
    matchCSV(@Param('id', ParseUUIDPipe) id: string, @Body() body: { rows: { unique_id?: string, email?: string }[] }) {
        return this.surveysService.matchCSV(id, body.rows);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin/surveys/:id/payment-table')
    @ApiOperation({ summary: 'Get payment table for bank export (Admin only)' })
    getPaymentTable(@Param('id', ParseUUIDPipe) id: string) {
        return this.surveysService.getPaymentTable(id);
    }
}
