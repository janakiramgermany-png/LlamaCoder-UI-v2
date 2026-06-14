import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const apps = await prisma.generatedApp.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return Response.json(apps);
  } catch (error) {
    console.error("[v0] Error fetching featured apps:", error);
    return Response.json({ error: "Failed to fetch apps" }, { status: 500 });
  }
}
