import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Calendar } from 'src/libs/shared/src/schemas/calendar.schema';
import { Lesson } from 'src/libs/shared/src/schemas/lesson.schema';
import { Student } from 'src/libs/shared/src/schemas/student.schema';
import { LessonDto } from './dto/lesson.dto';
import { getStudentCycle } from 'src/utils/schedule.util';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<Lesson>,

    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,

    @InjectModel(Calendar.name)
    private readonly calendarModel: Model<Calendar>,
  ) {}

  async findCurrentLesson(studentId: string) {
    const student = await this.studentModel.findById(studentId);
    const lessons = await this.lessonModel
      .find({ studentId })
      .populate<{ calendarId: Calendar }>('calendarId')
      .lean();

    const lesson = lessons.find(
      (lesson) => lesson.calendarId.count === student?.count,
    );

    return lesson;
  }

  async setLesson(lessonId: string, body: LessonDto) {
    return await this.lessonModel.findByIdAndUpdate(
      lessonId,
      {
        content: body.content,
        homework: body.homework,
      },
      { new: true },
    );
  }

  async setHomeworkComplete(lessonId: string, homeworkId: string) {
    return await this.lessonModel.findOneAndUpdate(
      {
        _id: lessonId,
        'homework._id': homeworkId,
      },
      {
        $bit: { 'homework.$.complete': { xor: 1 } },
      } as any,
      { new: true },
    );
  }

  async summaryLessons(studentId: string) {
    const student = await this.studentModel.findById(studentId);
    if (student == null) return;

    const cycle = getStudentCycle(student);
    const calendars = await this.calendarModel
      .find({ studentId, cycle: cycle - 1 })
      .sort({ count: 1 });

    return await Promise.all(
      calendars.map(async (c) => {
        return await this.lessonModel.findOne({ calendarId: c._id });
      }),
    );
  }
}
