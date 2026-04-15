import Dexie, { type EntityTable } from 'dexie';
import { Strategy } from './types';

const db = new Dexie('StrategyPresenterDB') as Dexie & {
  strategies: EntityTable<Strategy, 'id'>;
};

db.version(1).stores({
  strategies: 'id, name, clientName, createdAt, updatedAt',
});

export async function getAllStrategies(): Promise<Strategy[]> {
  return db.strategies.orderBy('updatedAt').reverse().toArray();
}

export async function getStrategy(id: string): Promise<Strategy | undefined> {
  return db.strategies.get(id);
}

export async function saveStrategy(strategy: Strategy): Promise<void> {
  strategy.updatedAt = new Date().toISOString();
  await db.strategies.put(strategy);
}

export async function deleteStrategy(id: string): Promise<void> {
  await db.strategies.delete(id);
}

export async function duplicateStrategy(id: string, newName: string): Promise<string> {
  const original = await db.strategies.get(id);
  if (!original) throw new Error('Strategy not found');

  const newId = crypto.randomUUID();
  const copy: Strategy = {
    ...original,
    id: newId,
    name: newName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: original.sections.map(s => ({ ...s, id: crypto.randomUUID() })),
  };
  await db.strategies.put(copy);
  return newId;
}

export { db };
