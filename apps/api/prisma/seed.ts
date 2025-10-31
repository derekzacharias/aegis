import { PrismaClient } from '@prisma/client';
import { frameworks } from '../src/framework/seed/frameworks.seed';
import { controls } from '../src/framework/seed/controls.seed';

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: 'aegis-compliance' },
    update: {},
    create: {
      slug: 'aegis-compliance',
      name: 'Aegis Compliance Control Center',
      impactLevel: 'MODERATE'
    }
  });

  for (const framework of frameworks) {
    await prisma.framework.upsert({
      where: { id: framework.id },
      create: {
        ...framework,
        organizationId: organization.id
      },
      update: {
        name: framework.name,
        version: framework.version,
        description: framework.description,
        family: framework.family,
        controlCount: framework.controlCount
      }
    });
  }

  for (const control of controls) {
    await prisma.control.upsert({
      where: { id: control.id },
      create: control,
      update: {
        title: control.title,
        description: control.description,
        priority: control.priority
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
