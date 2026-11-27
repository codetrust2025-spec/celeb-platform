const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Unit tests use in-memory model doubles. No database, network or real accounts.
const source = fs.readFileSync(path.join(__dirname, '../controllers/bookingController.js'), 'utf8');
function setup(status = 'pending', found = true) {
  let saves = 0;
  const booking = { userId: 'owner', status, async save() { saves++; } };
  const exports = {};
  const models = {
    '../models/Booking': { findById: async () => found ? booking : null },
    '../models/Celebrity': { findById: async () => null }
  };
  vm.runInNewContext(source, { exports, require(name) {
    if (!Object.hasOwn(models, name)) throw new Error(`Unexpected dependency: ${name}`);
    return models[name];
  } }, { filename: 'bookingController.js' });
  const res = { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  const req = (userId = 'owner', userRole = 'user', body = {}) => ({ userId, userRole, body, params: { bookingId: 'fixture' } });
  return { booking, controller: exports, res, req, saves: () => saves };
}

test('confirmation requires administrator privileges', async () => {
  const x = setup();
  await x.controller.confirmBooking(x.req(), x.res);
  assert.equal(x.res.code, 403);
  assert.equal(x.saves(), 0);
});
test('administrator can confirm pending booking once', async () => {
  const x = setup();
  await x.controller.confirmBooking(x.req('admin', 'admin'), x.res);
  assert.equal(x.res.code, 200);
  assert.equal(x.booking.status, 'confirmed');
  assert.equal(x.saves(), 1);
  await x.controller.confirmBooking(x.req('admin', 'admin'), x.res);
  assert.equal(x.res.code, 400);
  assert.equal(x.saves(), 1);
});
test('cancelled booking cannot be confirmed', async () => {
  const x = setup('cancelled');
  await x.controller.confirmBooking(x.req('admin', 'admin'), x.res);
  assert.equal(x.res.code, 400);
  assert.equal(x.saves(), 0);
});
for (const action of ['updateBooking', 'cancelBooking', 'deleteBooking']) {
  test(`${action} rejects another customer`, async () => {
    const x = setup();
    await x.controller[action](x.req('other'), x.res);
    assert.equal(x.res.code, 403);
    assert.equal(x.saves(), 0);
  });
}
test('owner can cancel a confirmed booking', async () => {
  const x = setup('confirmed');
  await x.controller.cancelBooking(x.req(), x.res);
  assert.equal(x.res.code, 200);
  assert.equal(x.booking.status, 'cancelled');
  assert.equal(x.saves(), 1);
});
test('cancelled booking cannot be edited', async () => {
  const x = setup('cancelled');
  await x.controller.updateBooking(x.req('owner', 'user', { name: 'new' }), x.res);
  assert.equal(x.res.code, 400);
  assert.equal(x.saves(), 0);
});
test('unknown booking returns 404', async () => {
  const x = setup('pending', false);
  await x.controller.cancelBooking(x.req(), x.res);
  assert.equal(x.res.code, 404);
  assert.equal(x.saves(), 0);
});
test('booking creation rejects missing required fields', async () => {
  const x = setup();
  await x.controller.createBooking(x.req(), x.res);
  assert.equal(x.res.code, 400);
  assert.equal(x.saves(), 0);
});
test('booking creation rejects past event dates', async () => {
  const x = setup();
  const body = { name: 'Fixture', contact: 'fixture', eventType: 'event', eventTime: '2000-01-01T12:00:00Z', eventDate: '2000-01-01', eventLocation: 'fixture', celebrityId: 'fixture' };
  await x.controller.createBooking(x.req('owner', 'user', body), x.res);
  assert.equal(x.res.code, 400);
  assert.equal(x.saves(), 0);
});
test('booking rows and pagination count exclude soft-deleted records for every role', async () => {
  const rows = [
    { userId: 'owner', celebrity: 'artist', deletedAt: null },
    { userId: 'owner', celebrity: 'artist', deletedAt: new Date('2026-01-01') },
    { userId: 'other', celebrity: 'other-artist', deletedAt: null },
  ];
  const matches = (row, filter) => Object.entries(filter).every(([key, value]) => row[key] === value);
  for (const [userId, userRole, expected] of [['owner', 'user', 1], ['artist', 'celebrity', 1], ['admin', 'admin', 2]]) {
    const exports = {};
    const Booking = {
      find(filter) {
        // Simulate the current schema's /^find/ middleware; countDocuments has no such hook.
        const selected = rows.filter(row => row.deletedAt === null && matches(row, filter));
        return { populate() { return this; }, sort() { return this; }, skip(n) { this.offset = n; return this; }, limit(n) { return Promise.resolve(selected.slice(this.offset || 0, (this.offset || 0) + n)); } };
      },
      countDocuments(filter) { return Promise.resolve(rows.filter(row => matches(row, filter)).length); }
    };
    vm.runInNewContext(source, { exports, require(name) {
      if (name === '../models/Booking') return Booking;
      if (name === '../models/Celebrity') return {};
      throw new Error(`Unexpected dependency: ${name}`);
    } }, { filename: 'bookingController.js' });
    const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await exports.getBookings({ userId, userRole, query: { limit: '1' } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.bookings.length, Math.min(expected, 1));
    assert.equal(res.body.total, expected);
    assert.equal(res.body.pages, expected);
  }
});
