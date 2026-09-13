import { prisma } from "./plugins/prisma";

async function main() {
  const v = await prisma.user.create({
    data: { phoneNumber: "987654321", name: "V" },
  });
  const a = await prisma.user.create({
    data: { phoneNumber: "123456789", name: "A" },
  });

  const group = await prisma.group.create({
    data: {
      name: "Paradise",
      members: {
        create: [{ userId: v.id }, { userId: a.id }],
      },
    },
  });

  console.log("Group ID:", group.id);
  console.log("V ID:", v.id);
  console.log("A ID:", a.id);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });