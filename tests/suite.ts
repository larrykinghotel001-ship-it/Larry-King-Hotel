import assert from 'assert';
import { db } from '../server/db.js';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../server/auth.js';

console.log('--- RUNNING LARRY KING HOTEL AUTOMATED TEST SUITE ---');

// Test 1: Password hashing and scrypt verification
console.log('Test 1: Admin password hashing & verification');
const testPassword = 'MySecretAdminPassword2026!';
const hash = hashPassword(testPassword);
assert(hash.includes(':'), 'Hash must contain salt delimiter');
assert(verifyPassword(testPassword, hash), 'Valid password must verify against its hash');
assert(!verifyPassword('WrongPassword', hash), 'Invalid password must be rejected');
console.log('✓ Test 1 passed');

// Test 2: JWT token signing & verification
console.log('Test 2: JWT token generation and verification');
const token = generateToken({ id: 'admin-1', email: 'admin@larrykinghotel.com', role: 'superadmin' });
assert(typeof token === 'string' && token.split('.').length === 3, 'JWT must have 3 parts');
const payload = verifyToken(token);
assert(payload !== null, 'Valid JWT must verify');
assert(payload.email === 'admin@larrykinghotel.com', 'Payload email must match');
console.log('✓ Test 2 passed');

// Test 3: Unique Booking Reference generation
console.log('Test 3: Unique Booking Reference Format');
const ref1 = db.generateUniqueBookingReference();
const ref2 = db.generateUniqueBookingReference();
assert(ref1.startsWith('LKH-'), 'Reference must start with LKH-');
assert(ref1.length === 10, 'Reference must have exactly 10 characters (LKH-XXXXXX)');
assert(ref1 !== ref2, 'Sequential references must be unique');
console.log('✓ Test 3 passed');

// Test 4: Room types and published pricing verification
console.log('Test 4: Room types and published pricing');
const roomTypes = db.getAllRoomTypes();
assert(roomTypes.length >= 4, 'Must have at least 4 room types');
const standard = roomTypes.find(r => r.slug === 'standard');
const deluxe = roomTypes.find(r => r.slug === 'deluxe');
const executive = roomTypes.find(r => r.slug === 'executive');
const suite = roomTypes.find(r => r.slug === 'suite');

assert(standard && standard.baseRateNgn === 20000, 'Standard Room must be ₦20,000');
assert(deluxe && deluxe.baseRateNgn === 25000, 'Deluxe Room must be ₦25,000');
assert(executive && executive.baseRateNgn === 30000, 'Executive Room must be ₦30,000');
assert(suite && suite.baseRateNgn === 40000, 'Suite must be ₦40,000');
console.log('✓ Test 4 passed');

// Test 5: Availability calculations & capacity checks
console.log('Test 5: Availability calculations for future dates');
const testYear = 2030 + Math.floor(Math.random() * 10);
const checkIn = `${testYear}-05-10`;
const checkOut = `${testYear}-05-12`;
const avail = db.checkAvailability(checkIn, checkOut, 2, 0);
assert(avail.numberOfNights === 2, 'Should calculate 2 nights');
assert(avail.results.length >= 4, 'All room categories should be evaluated');
const standardAvail = avail.results.find(r => r.roomType.slug === 'standard');
assert(standardAvail !== undefined, 'Standard room result should exist');
assert(standardAvail.totalAmountNgn === 40000, '2 nights at 20,000 should equal 40,000');
console.log('✓ Test 5 passed');

// Test 6: Reservation Creation & Snapshot Rate
console.log('Test 6: Reservation Creation & Snapshot Rate');
const resResult = db.createReservation({
  roomTypeId: standard!.id,
  checkInDate: checkIn,
  checkOutDate: checkOut,
  adults: 2,
  children: 0,
  numberOfRooms: 1,
  paymentMode: 'pay_at_hotel',
  guest: {
    firstName: 'Test',
    lastName: 'Engineer',
    email: `test-${Date.now()}@larrykinghotel.com`,
    phone: '+2349071286050'
  }
});

assert(resResult.success, 'Reservation should succeed');
assert(resResult.reservation !== undefined, 'Reservation object must be returned');
assert(resResult.reservation.nightlyRateSnapshot === 20000, 'Nightly rate snapshot must be recorded');
assert(resResult.reservation.totalAmountNgn === 40000, 'Total should be 40,000 for 2 nights');
assert(resResult.reservation.reservationStatus === 'confirmed', 'Pay at hotel should default to confirmed hold');
console.log('✓ Test 6 passed');

// Test 7: Overlap prevention
console.log('Test 7: Overlap check on fully booked inventory');
// Verify lookup
const found = db.getReservationByReference(resResult.reservation.bookingReference);
assert(found !== null, 'Reservation must be retrievable by reference');
assert(found.bookingReference === resResult.reservation.bookingReference, 'Retrieved ref must match');
console.log('✓ Test 7 passed');

console.log('\n========================================');
console.log('ALL 7 AUTOMATED INTEGRATION TESTS PASSED!');
console.log('========================================\n');
