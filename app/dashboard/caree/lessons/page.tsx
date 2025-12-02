import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Lesson from "@/models/Lesson"
import User from "@/models/User"
import dynamic from "next/dynamic"
import  GenerateLessonButton from "@/app/dashboard/caree/lessons/GenerateLessonButton"

type LessonType = {
  _id: string
  title: string
  description?: string
  content?: string
}

async function fetchLessons(): Promise<LessonType[]> {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user?.email) return []
  await connectToDatabase()
  const caree = await User.findOne({ email: session.user.email }).select('_id role caregiverId')
  if (!caree || caree.role !== 'caree' || !caree.caregiverId) return []
  // List lessons generated for this caree by the global /api/lessons endpoint
  // which stores lessons with userId = caree._id
  const docs = await Lesson.find({ userId: caree._id }).sort({ createdAt: -1 }).limit(200)
  return docs as any
}

export default async function CareeLessonsPage() {
  const lessons = await fetchLessons()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Lessons</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline"><Link href="/dashboard/caree/lessons/new">New Lesson</Link></Button>
          <GenerateLessonButton />
        </div>
      </div>
      {lessons.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">No lessons yet. Generate or add one.</Card>
      ) : (
        <div className="grid gap-3">
          {lessons.map(l => (
            <Link key={l._id} href={`/dashboard/caree/lessons/${l._id}`}>
              <Card className="p-4 hover:bg-accent cursor-pointer">
                <div className="text-sm font-medium">{l.title}</div>
                {l.description && <div className="text-xs text-muted-foreground mt-1">{l.description}</div>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
