import { describe, expect, it } from 'vitest';
import { FoodUnit } from '../../../utils/types/food-unit.type.js';
import { planMissingIngredients } from './shopping-list.js';

const rice = (quantity: string) => ({ name: 'Riž', quantity, unit: FoodUnit.Gram });

describe('automatic shopping list', () => {
  it('adds only the missing amount', () => {
    expect(planMissingIngredients([rice('500')], [rice('200')], [])).toEqual({
      updates: [],
      additions: [rice('300.000')],
      deletions: [],
    });
  });

  it('combines requirements from multiple meals into one item', () => {
    expect(planMissingIngredients([rice('300'), rice('400')], [rice('200')], []).additions).toEqual(
      [rice('500.000')],
    );
  });

  it('does not add ingredients already in stock', () => {
    expect(planMissingIngredients([rice('200')], [rice('500')], [])).toEqual({
      updates: [],
      additions: [],
      deletions: [],
    });
  });

  it('increases an existing item instead of adding a duplicate', () => {
    expect(planMissingIngredients([rice('500')], [], [{ ...rice('200'), id: 'a' }])).toEqual({
      updates: [{ id: 'a', quantity: '500.000' }],
      additions: [],
      deletions: [],
    });
  });

  it('reduces excess when stock increases', () => {
    expect(
      planMissingIngredients([rice('500')], [rice('300')], [{ ...rice('500'), id: 'a' }]),
    ).toEqual({
      updates: [{ id: 'a', quantity: '200.000' }],
      additions: [],
      deletions: [],
    });
  });

  it('removes generated items when no meals require them', () => {
    expect(planMissingIngredients([], [], [{ ...rice('500'), id: 'a' }])).toEqual({
      updates: [],
      additions: [],
      deletions: ['a'],
    });
  });

  it('keeps an existing correct amount unchanged', () => {
    expect(planMissingIngredients([rice('500')], [], [{ ...rice('500'), id: 'a' }])).toEqual({
      updates: [],
      additions: [],
      deletions: [],
    });
  });

  it('removes duplicate excess items before reducing the remaining item', () => {
    expect(
      planMissingIngredients(
        [rice('100')],
        [],
        [
          { ...rice('300'), id: 'a' },
          { ...rice('200'), id: 'b' },
        ],
      ),
    ).toEqual({ updates: [{ id: 'a', quantity: '100.000' }], additions: [], deletions: ['b'] });
  });
});
