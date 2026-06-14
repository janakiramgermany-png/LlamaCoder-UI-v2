import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const app = await prisma.generatedApp.findUnique({
      where: { id: params.id },
      include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!app) {
      return Response.json({ error: "App not found" }, { status: 404 });
    }

    return Response.json(app);
  } catch (error) {
    console.error("[v0] Error fetching app:", error);
    return Response.json({ error: "Failed to fetch app" }, { status: 500 });
  }
}
