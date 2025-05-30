import { addDays, getDay } from 'date-fns';
import {
  Student,
  StudentDocument,
} from 'src/libs/shared/src/schemas/student.schema';
import { StudentService } from 'src/student/student.service';

export function getStudentCycle(student: StudentDocument) {
  const totalLessons = student.frequency * 4;
  const cycle = Math.floor(student.count / totalLessons) + 1;
  return cycle;
}

export function createSchedule(student: StudentDocument) {
  const lessonDays = student.time.map((t) => getDayNumber(t.day));
  const totalLessons = student.frequency * 4;
  const cycle = getStudentCycle(student);
  let schedule: any[] = [];
  let date = student.startDate;
  let count = 1;

  while (count <= totalLessons) {
    for (let day of lessonDays) {
      if (getDay(date) !== day) {
        date = addDays(date, (day - getDay(date) + 7) % 7);
      }
      schedule.push({ studentId: student.id, date, count, cycle });
      count++;
    }
    date = addDays(date, 7 - getDay(date));
  }

  return schedule;
}

export function getDayNumber(day: string): number {
  const days = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };
  return days[day];
}

export function getNextLessonDate(from: Date, targetDay: number): Date {
  const currentDay = from.getDay();
  const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;

  const nextDate = addDays(from, daysToAdd);

  return nextDate;
}
