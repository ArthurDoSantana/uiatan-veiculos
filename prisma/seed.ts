import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco de dados...");

  const vehicles = [
    {
      name: "Toyota Hilux SRX 2023",
      description:
        "Hilux SRX completa, motor 2.8 diesel 4x4, couro, multimídia, câmera de ré, rodas 18\". Único dono, revisões em concessionária.",
      price: 289900,
      status: "AVAILABLE",
      year: 2023,
      brand: "Toyota",
      mileage: 28000,
      color: "Branco Pérola",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" },
          { url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800" },
        ],
      },
    },
    {
      name: "Honda Civic EXL 2022",
      description:
        "Civic EXL com motor 1.5 turbo, teto solar, bancos em couro, CarPlay/AndroidAuto, assistente de faixa. Impecável.",
      price: 149800,
      status: "AVAILABLE",
      year: 2022,
      brand: "Honda",
      mileage: 41000,
      color: "Cinza Sonic",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800" },
          { url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800" },
        ],
      },
    },
    {
      name: "Jeep Compass Limited 2023",
      description:
        "Compass Limited 2.0 diesel 4x4, configuração completa com suíte de segurança Uconnect, banco em couro, rodas 19\".",
      price: 218500,
      status: "RESERVED",
      year: 2023,
      brand: "Jeep",
      mileage: 19000,
      color: "Preto Carbon",
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800" },
        ],
      },
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({ data: vehicle });
  }

  console.log("✅ Banco populado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
