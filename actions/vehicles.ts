"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export type VehicleStatus = "AVAILABLE" | "RESERVED" | "SOLD";
const VEHICLE_STATUSES: VehicleStatus[] = ["AVAILABLE", "RESERVED", "SOLD"];

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

function isVehicleStatus(value: string): value is VehicleStatus {
  return VEHICLE_STATUSES.includes(value as VehicleStatus);
}

function sanitizeVehicleData(data: VehicleFormData): VehicleFormData {
  const name = data.name.trim();
  if (!name) {
    throw new Error("Nome do veículo é obrigatório.");
  }

  if (!Number.isFinite(data.price) || data.price < 0) {
    throw new Error("Preço inválido.");
  }

  if (!isVehicleStatus(data.status)) {
    throw new Error("Status inválido.");
  }

  if (typeof data.year === "number") {
    const maxYear = new Date().getFullYear() + 1;
    if (data.year < 1900 || data.year > maxYear) {
      throw new Error("Ano inválido.");
    }
  }

  if (typeof data.mileage === "number" && data.mileage < 0) {
    throw new Error("Quilometragem inválida.");
  }

  return {
    ...data,
    name,
    description: data.description.trim(),
    brand: data.brand?.trim(),
    color: data.color?.trim(),
    imageUrls: data.imageUrls.filter(Boolean),
  };
}

export async function getVehicles(status?: string) {
  const filteredStatus = status && status !== "ALL" && isVehicleStatus(status) ? status : undefined;

  return prisma.vehicle.findMany({
    where: filteredStatus ? { status: filteredStatus } : undefined,
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
  const sanitized = sanitizeVehicleData(data);

  const vehicle = await prisma.vehicle.create({
    data: {
      name: sanitized.name,
      description: sanitized.description,
      price: sanitized.price,
      status: sanitized.status,
      year: sanitized.year || null,
      brand: sanitized.brand || null,
      mileage: sanitized.mileage || null,
      color: sanitized.color || null,
      images: {
        create: sanitized.imageUrls.map((url) => ({ url })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { success: true, id: vehicle.id };
}

export async function updateVehicle(id: string, data: VehicleFormData) {
  await requireAuth();
  const sanitized = sanitizeVehicleData(data);

  // Delete existing images and recreate
  await prisma.image.deleteMany({ where: { vehicleId: id } });

  await prisma.vehicle.update({
    where: { id },
    data: {
      name: sanitized.name,
      description: sanitized.description,
      price: sanitized.price,
      status: sanitized.status,
      year: sanitized.year || null,
      brand: sanitized.brand || null,
      mileage: sanitized.mileage || null,
      color: sanitized.color || null,
      images: {
        create: sanitized.imageUrls.map((url) => ({ url })),
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

  if (!isVehicleStatus(status)) {
    throw new Error("Status inválido.");
  }

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
