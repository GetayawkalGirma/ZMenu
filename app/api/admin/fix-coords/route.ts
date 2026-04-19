import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        geoLocation: {
          contains: "!2d",
        },
        OR: [
          { latitude: null },
          { longitude: null },
        ]
      }
    });

    let updatedCount = 0;
    for (const res of restaurants) {
      if (!res.geoLocation) continue;

      const match = res.geoLocation.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
      if (match) {
        const lng = parseFloat(match[1]);
        const lat = parseFloat(match[2]);

        await prisma.restaurant.update({
          where: { id: res.id },
          data: {
            latitude: lat,
            longitude: lng,
          }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} restaurants with coordinates.`,
      found: restaurants.length
    });
  } catch (error) {
    console.error("Fix coords error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
