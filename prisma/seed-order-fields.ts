// prisma/seed-order-fields.ts
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function seedOrderFields() {
  const cvs = await prisma.cV.findMany()

  for (const cv of cvs) {
    const data = cv.cvData as Record<string, unknown>

    // Add order to experience items
    if (data.experience && Array.isArray(data.experience)) {
      data.experience = data.experience.map((item: Record<string, unknown>, idx: number) => ({
        ...item,
        order: (item.order as number) ?? idx,
      }))
    }

    // Add order to education items
    if (data.education && Array.isArray(data.education)) {
      data.education = data.education.map((item: Record<string, unknown>, idx: number) => ({
        ...item,
        order: (item.order as number) ?? idx,
      }))
    }

    // Add order to skills
    if (data.skills && Array.isArray(data.skills)) {
      data.skills = data.skills.map((item: Record<string, unknown>, idx: number) => ({
        ...item,
        order: (item.order as number) ?? idx,
      }))
    }

    // Add sectionOrder if not present
    if (!data.sectionOrder) {
      data.sectionOrder = ['profile', 'experience', 'education', 'skills']
    }

    // Update the CV
    await prisma.cV.update({
      where: { id: cv.id },
      data: { cvData: data as Prisma.InputJsonValue },
    })
  }

  console.log('Migration complete: All CVs now have order fields')
}

seedOrderFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
