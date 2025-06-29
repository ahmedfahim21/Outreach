import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '../../prisma/generated'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())

if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma