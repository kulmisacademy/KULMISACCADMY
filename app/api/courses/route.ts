import { NextResponse } from 'next/server';
import { getAllCourses } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
