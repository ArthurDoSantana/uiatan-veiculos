"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export type VehicleStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export interface VehicleFormData {
  name: string;
  description: string;
  price: number;
  status: VehicleStatus;
  year?: number;
  brand?: string;
  mileage?: number;
  color?: string;
  imageUrls: string[];
}

async function requireAuth() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");
}

export async function getVehicles(status?: string) {
  return prisma.vehicle.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: { images: true },
  });
}

export async function createVehicle(data: VehicleFormData) {
  await requireAuth();

  const vehicle = await prisma.vehicle.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      status: data.status,
      year: data.year || null,
      brand: data.brand || null,
      mileage: data.mileage || null,
      color: data.color || null,
      images: {
        create: data.imageUrls.map((url) => ({ url })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { success: true, id: vehicle.id };
}

export async function updateVehicle(id: string, data: VehicleFormData) {
  await requireAuth();

  // Delete existing images and recreate
  await prisma.image.deleteMany({ where: { vehicleId: id } });

  await prisma.vehicle.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      status: data.status,
      year: data.year || null,
      brand: data.brand || null,
      mileage: data.mileage || null,
      color: data.color || null,
      images: {
        create: data.imageUrls.map((url) => ({ url })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/veiculo/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function updateVehicleStatus(id: string, status: VehicleStatus) {
  await requireAuth();

  await prisma.vehicle.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/");
  revalidatePath(`/veiculo/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteVehicle(id: string) {
  await requireAuth();

  await prisma.vehicle.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function getAdminStats() {
  await requireAuth();

  const [total, available, reserved, sold] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "RESERVED" } }),
    prisma.vehicle.count({ where: { status: "SOLD" } }),
  ]);

  return { total, available, reserved, sold };
}
