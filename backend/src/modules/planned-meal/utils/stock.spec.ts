import { describe, expect, it } from 'vitest';
import { FoodUnit } from '../../../utils/types/food-unit.type.js';
import { buildStock, getMissingQuantity, planConsumption } from './stock.js';

const milk = (quantity: string, unit = FoodUnit.Milliliter) => ({ name: 'Mleko', quantity, unit });

describe('stock availability', () => {
  it('combines matching names and converts liters to milliliters', () => {
    const stock = buildStock([milk('1', FoodUnit.Liter), { ...milk('250'), name: ' mleko ' }]);
    expect(getMissingQuantity(stock, milk('1500'))).toBe(250);
  });

  it('reports no shortage when stock is sufficient', () => {
    expect(getMissingQuantity(buildStock([milk('500')]), milk('200'))).toBe(0);
  });

  it('reports the entire requirement when no stock exists', () => {
    expect(getMissingQuantity(buildStock([]), milk('200'))).toBe(200);
  });

  it('keeps incompatible measurement dimensions separate', () => {
    expect(getMissingQuantity(buildStock([milk('500', FoodUnit.Gram)]), milk('200'))).toBe(200);
  });
});

describe('meal consumption', () => {
  it('updates a partially consumed batch', () => {
    expect(planConsumption([milk('200')], [{ ...milk('500'), id: 'a' }])).toEqual({
      updates: [{ id: 'a', quantity: '300.000' }],
      deletions: [],
    });
  });

  it('removes exhausted batches and consumes the next batch', () => {
    expect(
      planConsumption(
        [milk('600')],
        [
          { ...milk('500'), id: 'a' },
          { ...milk('500'), id: 'b' },
        ],
      ),
    ).toEqual({ updates: [{ id: 'b', quantity: '400.000' }], deletions: ['a'] });
  });

  it('consumes only available stock without creating negative quantities', () => {
    expect(planConsumption([milk('1000')], [{ ...milk('500'), id: 'a' }])).toEqual({
      updates: [],
      deletions: ['a'],
    });
  });

  it('does not change unrelated food', () => {
    expect(
      planConsumption(
        [milk('200')],
        [{ name: 'Voda', quantity: '500', unit: FoodUnit.Milliliter, id: 'a' }],
      ),
    ).toEqual({
      updates: [],
      deletions: [],
    });
  });

  it('converts units when subtracting from stock', () => {
    expect(planConsumption([milk('250')], [{ ...milk('1', FoodUnit.Liter), id: 'a' }])).toEqual({
      updates: [{ id: 'a', quantity: '0.750' }],
      deletions: [],
    });
  });
});
