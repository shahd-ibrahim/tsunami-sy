import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TSUNAMI database with SoulStar & SoulChill catalog...");

  // 1. Create or update the Voice Chat & Streaming Category
  const chatCategory = await prisma.category.upsert({
    where: { slug: "chat-apps" },
    update: {
      name: "قسم الدردشة والبث الصوتي",
      icon: "Tv",
      description: "تطبيقات المحادثات الصوتية، الغرف المباشرة، كوينز وماسات البث التفاعلي.",
      sortOrder: 1,
    },
    create: {
      name: "قسم الدردشة والبث الصوتي",
      slug: "chat-apps",
      icon: "Tv",
      description: "تطبيقات المحادثات الصوتية، الغرف المباشرة، كوينز وماسات البث التفاعلي.",
      sortOrder: 1,
    },
  });

  // 2. Seed SoulStar
  const soulStar = await prisma.product.upsert({
    where: { slug: "soulstar" },
    update: {
      name: "سول ستار - SoulStar",
      categoryId: chatCategory.id,
      image: "/images/soulstar_icon.jpg",
      imageUrl: "/images/soulstar_icon.jpg",
      bannerUrl: "/images/soulstar_banner.jpg",
      gameCode: "SOULSTAR",
      requiresPlayerId: true,
      description: "شحن كوينز تطبيق سول ستار الرسمي (SoulStar) فورياً عبر معرّف الحساب User ID لغرف الدردشة الصوتية والبث المباشر (soulstarapp.com).",
      sortOrder: 1,
    },
    create: {
      name: "سول ستار - SoulStar",
      slug: "soulstar",
      categoryId: chatCategory.id,
      image: "/images/soulstar_icon.jpg",
      imageUrl: "/images/soulstar_icon.jpg",
      bannerUrl: "/images/soulstar_banner.jpg",
      gameCode: "SOULSTAR",
      requiresPlayerId: true,
      description: "شحن كوينز تطبيق سول ستار الرسمي (SoulStar) فورياً عبر معرّف الحساب User ID لغرف الدردشة الصوتية والبث المباشر (soulstarapp.com).",
      sortOrder: 1,
    },
  });

  // SoulStar Packages: 1,000 / 5,000 / 10,000 / 50,000 / 100,000 Coins
  const soulStarPackages = [
    { sku: "SOULSTAR_1000", name: "1,000 كوينز / Coins", priceUser: 0.99, priceReseller: 0.90, costPrice: 0.85, sortOrder: 1 },
    { sku: "SOULSTAR_5000", name: "5,000 كوينز / Coins", priceUser: 4.89, priceReseller: 4.50, costPrice: 4.25, sortOrder: 2 },
    { sku: "SOULSTAR_10000", name: "10,000 كوينز / Coins", priceUser: 9.69, priceReseller: 8.95, costPrice: 8.50, sortOrder: 3 },
    { sku: "SOULSTAR_50000", name: "50,000 كوينز / Coins", priceUser: 47.99, priceReseller: 44.50, costPrice: 42.00, sortOrder: 4 },
    { sku: "SOULSTAR_100000", name: "100,000 كوينز / Coins", priceUser: 94.99, priceReseller: 88.00, costPrice: 83.50, sortOrder: 5 },
  ];

  for (const pkg of soulStarPackages) {
    await prisma.package.upsert({
      where: { sku: pkg.sku },
      update: {
        productId: soulStar.id,
        name: pkg.name,
        priceUser: pkg.priceUser,
        priceReseller: pkg.priceReseller,
        costPrice: pkg.costPrice,
        sortOrder: pkg.sortOrder,
      },
      create: {
        productId: soulStar.id,
        sku: pkg.sku,
        name: pkg.name,
        priceUser: pkg.priceUser,
        priceReseller: pkg.priceReseller,
        costPrice: pkg.costPrice,
        sortOrder: pkg.sortOrder,
      },
    });
  }

  // 3. Seed SoulChill
  const soulChill = await prisma.product.upsert({
    where: { slug: "soulchill" },
    update: {
      name: "سول شيل - SoulChill",
      categoryId: chatCategory.id,
      image: "/images/soulchill_icon.jpg",
      imageUrl: "/images/soulchill_icon.jpg",
      bannerUrl: "/images/soulchill_banner.jpg",
      gameCode: "SOULCHILL",
      requiresPlayerId: true,
      description: "شحن ماسات تطبيق سول شيل (SoulChill) الصوتي فورياً عبر معرّف الحساب UID لفتح الرومات الحصرية ودعم المضيفين والمواهب.",
      sortOrder: 2,
    },
    create: {
      name: "سول شيل - SoulChill",
      slug: "soulchill",
      categoryId: chatCategory.id,
      image: "/images/soulchill_icon.jpg",
      imageUrl: "/images/soulchill_icon.jpg",
      bannerUrl: "/images/soulchill_banner.jpg",
      gameCode: "SOULCHILL",
      requiresPlayerId: true,
      description: "شحن ماسات تطبيق سول شيل (SoulChill) الصوتي فورياً عبر معرّف الحساب UID لفتح الرومات الحصرية ودعم المضيفين والمواهب.",
      sortOrder: 2,
    },
  });

  // SoulChill Packages: 720 / 3,600 / 7,200 / 36,000 / 72,000 Diamonds
  const soulChillPackages = [
    { sku: "SOULCHILL_720", name: "720 ماسة / Diamonds", priceUser: 0.99, priceReseller: 0.92, costPrice: 0.86, sortOrder: 1 },
    { sku: "SOULCHILL_3600", name: "3,600 ماسة / Diamonds", priceUser: 4.89, priceReseller: 4.55, costPrice: 4.30, sortOrder: 2 },
    { sku: "SOULCHILL_7200", name: "7,200 ماسة / Diamonds", priceUser: 9.69, priceReseller: 9.10, costPrice: 8.60, sortOrder: 3 },
    { sku: "SOULCHILL_36000", name: "36,000 ماسة / Diamonds", priceUser: 47.99, priceReseller: 45.00, costPrice: 42.50, sortOrder: 4 },
    { sku: "SOULCHILL_72000", name: "72,000 ماسة / Diamonds", priceUser: 94.99, priceReseller: 89.50, costPrice: 84.50, sortOrder: 5 },
  ];

  for (const pkg of soulChillPackages) {
    await prisma.package.upsert({
      where: { sku: pkg.sku },
      update: {
        productId: soulChill.id,
        name: pkg.name,
        priceUser: pkg.priceUser,
        priceReseller: pkg.priceReseller,
        costPrice: pkg.costPrice,
        sortOrder: pkg.sortOrder,
      },
      create: {
        productId: soulChill.id,
        sku: pkg.sku,
        name: pkg.name,
        priceUser: pkg.priceUser,
        priceReseller: pkg.priceReseller,
        costPrice: pkg.costPrice,
        sortOrder: pkg.sortOrder,
      },
    });
  }

  console.log("Successfully seeded SoulStar and SoulChill catalog products and pricing tiers!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
