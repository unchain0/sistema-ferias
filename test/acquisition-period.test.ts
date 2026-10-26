import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  computeAcquisitionEndDate,
  formatDateToPtBR,
} from '../lib/utils';

describe('acquisition period calculation', () => {
  it('ends one year minus one day after the start', () => {
    assert.equal(computeAcquisitionEndDate('2025-08-31'), '2026-08-30');
    assert.equal(computeAcquisitionEndDate('2025-09-01'), '2026-08-31');
    assert.equal(computeAcquisitionEndDate('2025-03-01'), '2026-02-28');
    assert.equal(computeAcquisitionEndDate('2024-03-01'), '2025-02-28');
  });

  it('formats calendar dates in pt-BR without UTC shift', () => {
    assert.equal(formatDateToPtBR('2025-08-31'), '31/08/2025');
    assert.equal(formatDateToPtBR('2025-09-01'), '01/09/2025');
    assert.equal(
      `${formatDateToPtBR('2025-08-31')} até ${formatDateToPtBR(computeAcquisitionEndDate('2025-08-31'))}`,
      '31/08/2025 até 30/08/2026'
    );
  });

  it('demo seed acquisition periods never end before they start', async () => {
    const seed = await import('../lib/seed-demo');
    const snapshot = await seed.getDemoSnapshot();
    for (const vacation of snapshot.vacations) {
      assert.ok(
        vacation.acquisitionEndDate >= vacation.acquisitionStartDate,
        `${vacation.id}: ${vacation.acquisitionStartDate} até ${vacation.acquisitionEndDate}`
      );
    }
    const september = snapshot.vacations.filter(
      (vacation) => vacation.acquisitionStartDate === '2025-09-01'
    );
    assert.ok(september.length >= 1);
    for (const vacation of september) {
      assert.equal(vacation.acquisitionEndDate, '2026-08-31');
      assert.equal(
        formatDateToPtBR(vacation.acquisitionStartDate),
        '01/09/2025'
      );
    }
  });
});
