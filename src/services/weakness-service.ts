'use server';
import { db } from '@/db/client';
import { weaknesses, type Weakness, type NewWeakness } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function getAllWeaknesses(): Promise<Weakness[]> {
  return db.select().from(weaknesses).all();
}

export async function createWeakness(data: Omit<NewWeakness, 'id'>): Promise<Weakness> {
  const weakness: NewWeakness = {
    id: nanoid(),
    ...data,
  };
  
  await db.insert(weaknesses).values(weakness);
  return weakness as Weakness;
}

export async function seedWeaknesses() {
  await db.delete(weaknesses);

  const defaultWeaknesses = [
    { name: "Green Glowing Rock", description: "Your body shuts down in proximity of a rock that glows green." },
    { name: "Bug Spray", description: "If your powers are based off bugs, you're going to have a bad time against this convenient weapon. Works on spiders, ants, beetles." },
    { name: "Lactose Intolerance", description: "Yes, this has incapacitated superheroes in battles before. It's surprisingly effective!" },
  ];

  for (const weakness of defaultWeaknesses) {
    await createWeakness(weakness);
  }
}
