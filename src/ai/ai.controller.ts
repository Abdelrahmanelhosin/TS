import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('analyze')
  @ApiOperation({ summary: 'Get AI-powered platform analysis (Admin only)' })
  async analyzePlatform() {
    const report = await this.aiService.analyzePlatform();
    return report;
  }

  @Get('analyze-survey/:surveyId')
  @ApiOperation({ summary: 'Get AI-powered survey analysis (Admin only)' })
  async analyzeSurvey(@Param('surveyId', ParseUUIDPipe) surveyId: string) {
    const report = await this.aiService.analyzeSurvey(surveyId);
    return report;
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant (Admin only)' })
  async chat(
    @Request() req: any,
    @Body() body: { message: string; surveyId?: string },
  ) {
    const userId = req.user.userId;
    const response = await this.aiService.chat(
      userId,
      body.message,
      body.surveyId,
    );
    return { response };
  }

  @Post('analyze-data')
  @ApiOperation({ summary: 'Analyze generic data/excel (Admin only)' })
  async analyzeData(@Body() body: { context: string; title: string }) {
    const report = await this.aiService.analyzeGenericData(
      body.context,
      body.title,
    );
    return { report };
  }

  @Get('analyze-user/:id')
  @ApiOperation({ summary: 'Get AI-powered user analysis (Admin only)' })
  async analyzeUser(@Param('id', ParseUUIDPipe) id: string) {
    const report = await this.aiService.analyzeUser(id);
    return report;
  }

  @Get('chat/history')
  @ApiOperation({ summary: 'Get AI chat history (Admin only)' })
  async getChatHistory(
    @Request() req: any,
    @Query('surveyId') surveyId?: string,
  ) {
    const userId = req.user.userId;
    return this.aiService.getChatHistory(userId, surveyId);
  }

  @Get('pulse')
  @ApiOperation({
    summary:
      'Get AI-powered notification pulse and timing analysis (Admin only)',
  })
  async getPulse() {
    const report = await this.aiService.getSmartPulse();
    return { report };
  }
}
