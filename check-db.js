const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Users:', JSON.stringify(users, null, 2));
    const clients = await prisma.client.findMany();
    console.log('Clients:', JSON.stringify(clients, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
