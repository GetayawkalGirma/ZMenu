import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const meals = await prisma.restaurantMenu.findMany({
      where: {
        restaurantId: id
      },
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ items: meals });
  } catch (error) {
    console.error("Error fetching restaurant meals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
