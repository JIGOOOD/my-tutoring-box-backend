import { Controller, Post, Body } from '@nestjs/common';
import { MlService } from './ml.service';

@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  @Post('predict')
  async predict(@Body('answers') answers: number[]) {
    const result = await this.mlService.predictStudentType(answers);
    const workbooks = await this.mlService.recommendWorkbooks(result.label);
    return {
      status: 'success',
      data: {
        ...result,
        workbooks,
      },
    };
  }
}
