import prisma from '@/lib/prisma';

export interface Feature {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantFeatureAssignment {
  id: string;
  restaurantId: string;
  featureId: string;
  restaurant: Restaurant | null;
  feature: Feature | null;
}

export interface Restaurant {
  id: string;
  name: string | null;
  location: string | null;
  logoUrl: string | null;
  rating: number | null;
  noiselevel: string | null;
  privacylevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FeatureRepository {
  // Get all features
  static async getAll(): Promise<Feature[]> {
    const features = await prisma.feature.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return features;
  }

  // Get feature by ID
  static async getById(id: string): Promise<Feature | null> {
    const feature = await prisma.feature.findUnique({
      where: { id },
    });

    return feature;
  }

  // Search features
  static async search(query: string): Promise<Feature[]> {
    const features = await prisma.feature.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });

    return features;
  }

  // Create feature
  static async create(data: { name: string; description?: string }): Promise<Feature> {
    const feature = await prisma.feature.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return feature;
  }

  // Update feature
  static async update(id: string, data: { name?: string; description?: string }): Promise<Feature> {
    const feature = await prisma.feature.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return feature;
  }

  // Delete feature
  static async delete(id: string): Promise<void> {
    await prisma.feature.delete({
      where: { id },
    });
  }

  // Get restaurant features
  static async getRestaurantFeatures(restaurantId: string): Promise<Feature[]> {
    const assignments = await prisma.restaurantFeatureAssignment.findMany({
      where: { restaurantId },
      include: {
        feature: true,
      },
    });

    return assignments.map(assignment => assignment.feature);
  }

  // Assign features to restaurant
  static async assignFeatures(restaurantId: string, featureIds: string[]): Promise<void> {
    // Delete existing assignments
    await prisma.restaurantFeatureAssignment.deleteMany({
      where: { restaurantId },
    });

    // Create new assignments
    if (featureIds.length > 0) {
      await prisma.restaurantFeatureAssignment.createMany({
        data: featureIds.map(featureId => ({
          restaurantId,
          featureId,
        })),
      });
    }
  }

  // Remove feature assignment
  static async removeFeatureAssignment(restaurantId: string, featureId: string): Promise<void> {
    await prisma.restaurantFeatureAssignment.deleteMany({
      where: {
        restaurantId,
        featureId,
      },
    });
  }
}
