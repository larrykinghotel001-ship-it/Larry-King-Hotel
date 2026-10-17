import express from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';
import { supabase, isSupabaseConnected } from '../supabase.js';
import { verifyPassword, generateToken, requireAdmin, AuthenticatedRequest } from '../auth.js';
import { AdminLoginSchema, BookingStatusUpdateSchema, BlockDateSchema } from '../validation.js';

const router = express.Router();

// 1. ADMIN LOGIN
router.post('/login', (req, res) => {
  const parseResult = AdminLoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Please provide valid credentials' });
    return;
  }

  const { email, password } = parseResult.data;
  const admin = db.getAdminByEmail(email);

  if (!admin || !admin.isActive) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const isMatch = verifyPassword(password, admin.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  db.updateAdminLastLogin(admin.id);
  const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });

  db.logAudit({
    adminEmail: admin.email,
    action: 'ADMIN_LOGIN',
    entityType: 'AUTH',
    entityId: admin.id,
    ipAddress: req.ip
  });

  // Set HTTP-only cookie as well for extra browser security
  res.cookie('lkh_admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role
    }
  });
});

// 2. ADMIN ME
router.get('/me', requireAdmin, (req: AuthenticatedRequest, res) => {
  const admin = db.getAdminById(req.admin!.id);
  if (!admin) {
    res.status(404).json({ error: 'Admin record not found' });
    return;
  }

  res.json({
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    lastLoginAt: admin.lastLoginAt
  });
});

// 3. ADMIN LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('lkh_admin_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

// 4. DASHBOARD STATS
router.get('/dashboard', requireAdmin, (req, res) => {
  const stats = db.getDashboardStats();
  res.json(stats);
});

// 5. ROOM TYPES MANAGEMENT
router.get('/room-types', requireAdmin, (req, res) => {
  res.json(db.getAllRoomTypes(false));
});

router.put('/room-types/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updated = db.updateRoomType(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Room category not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'UPDATE_ROOM_TYPE',
    entityType: 'ROOM_TYPE',
    entityId: id,
    details: req.body
  });

  res.json(updated);
});

// 6. PHYSICAL ROOMS INVENTORY
router.get('/rooms', requireAdmin, (req, res) => {
  res.json(db.getAllRooms());
});

router.post('/rooms', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { roomTypeId, roomNumber, floor, status, notes } = req.body;
  if (!roomTypeId || !roomNumber) {
    res.status(400).json({ error: 'Room type and room number are required' });
    return;
  }

  const newRoom = db.createRoom({
    roomTypeId,
    roomNumber,
    floor: Number(floor) || 1,
    status: status || 'available',
    notes
  });

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'CREATE_ROOM',
    entityType: 'ROOM',
    entityId: newRoom.id,
    details: { roomNumber, roomTypeId }
  });

  res.status(201).json(newRoom);
});

router.put('/rooms/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updated = db.updateRoom(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'UPDATE_ROOM',
    entityType: 'ROOM',
    entityId: id,
    details: req.body
  });

  res.json(updated);
});

router.delete('/rooms/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const deleted = db.deleteRoom(id);
  if (!deleted) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'DELETE_ROOM',
    entityType: 'ROOM',
    entityId: id
  });

  res.json({ success: true, message: 'Room removed from inventory' });
});

// 7. RESERVATIONS MANAGEMENT
router.get('/bookings', requireAdmin, (req, res) => {
  const { status, search } = req.query as { status?: string; search?: string };
  const reservations = db.getAllReservations(status, search);
  res.json(reservations);
});

router.get('/bookings/:id', requireAdmin, (req, res) => {
  const reservation = db.getReservationById(req.params.id);
  if (!reservation) {
    res.status(404).json({ error: 'Reservation not found' });
    return;
  }
  res.json(reservation);
});

router.patch('/bookings/:id/status', requireAdmin, (req: AuthenticatedRequest, res) => {
  const parseResult = BookingStatusUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid status update parameters', details: parseResult.error.flatten() });
    return;
  }

  const { status, cancellationReason, adminNotes, paymentStatus, assignedRoomId } = parseResult.data;
  const updated = db.updateReservationStatus(req.params.id, status, {
    cancellationReason,
    adminNotes,
    paymentStatus,
    assignedRoomId
  });

  if (!updated) {
    res.status(404).json({ error: 'Reservation not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'UPDATE_RESERVATION_STATUS',
    entityType: 'RESERVATION',
    entityId: req.params.id,
    details: { status, paymentStatus, assignedRoomId }
  });

  res.json(updated);
});

// 8. BLOCKED DATES
router.get('/blocked-dates', requireAdmin, (req, res) => {
  res.json(db.getBlockedDates());
});

router.post('/blocked-dates', requireAdmin, (req: AuthenticatedRequest, res) => {
  const parseResult = BlockDateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation failed for blocked dates', details: parseResult.error.flatten() });
    return;
  }

  const { roomId, roomTypeId, startDate, endDate, reason } = parseResult.data;
  const item = db.addBlockedDate({
    roomId: roomId || undefined,
    roomTypeId: roomTypeId || undefined,
    startDate,
    endDate,
    reason,
    createdBy: req.admin!.id
  });

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'ADD_BLOCKED_DATE',
    entityType: 'BLOCKED_DATE',
    entityId: item.id,
    details: parseResult.data
  });

  res.status(201).json(item);
});

router.delete('/blocked-dates/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const deleted = db.removeBlockedDate(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Blocked date record not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'DELETE_BLOCKED_DATE',
    entityType: 'BLOCKED_DATE',
    entityId: req.params.id
  });

  res.json({ success: true });
});

// 9. GALLERY MANAGEMENT
router.get('/gallery', requireAdmin, (req, res) => {
  res.json(db.getGallery());
});

router.post('/gallery', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { title, category, imageUrl, altText, sortOrder } = req.body;
  if (!title || !imageUrl) {
    res.status(400).json({ error: 'Image title and URL are required' });
    return;
  }

  const item = db.addGalleryItem({
    title,
    category: category || 'Exterior & Grounds',
    imageUrl,
    altText: altText || title,
    sortOrder: Number(sortOrder) || 0
  });

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'ADD_GALLERY_IMAGE',
    entityType: 'GALLERY',
    entityId: item.id
  });

  res.status(201).json(item);
});

router.delete('/gallery/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const deleted = db.deleteGalleryItem(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Gallery item not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'DELETE_GALLERY_IMAGE',
    entityType: 'GALLERY',
    entityId: req.params.id
  });

  res.json({ success: true });
});

// 10. TESTIMONIALS MANAGEMENT
router.get('/testimonials', requireAdmin, (req, res) => {
  res.json(db.getTestimonials(false));
});

router.post('/testimonials', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { guestName, guestLocation, rating, comment, stayDate, isApproved, sortOrder } = req.body;
  if (!guestName || !comment) {
    res.status(400).json({ error: 'Guest name and review comment are required' });
    return;
  }

  const item = db.addTestimonial({
    guestName,
    guestLocation,
    rating: Number(rating) || 5,
    comment,
    stayDate,
    isApproved: isApproved !== undefined ? Boolean(isApproved) : true,
    sortOrder: Number(sortOrder) || 0
  });

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'ADD_TESTIMONIAL',
    entityType: 'TESTIMONIAL',
    entityId: item.id
  });

  res.status(201).json(item);
});

router.put('/testimonials/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const updated = db.updateTestimonial(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'UPDATE_TESTIMONIAL',
    entityType: 'TESTIMONIAL',
    entityId: req.params.id
  });

  res.json(updated);
});

router.delete('/testimonials/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const deleted = db.deleteTestimonial(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'DELETE_TESTIMONIAL',
    entityType: 'TESTIMONIAL',
    entityId: req.params.id
  });

  res.json({ success: true });
});

// 11. HOTEL SETTINGS
router.get('/settings', requireAdmin, (req, res) => {
  res.json(db.getSettings());
});

router.put('/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  const updated = db.updateSettings(req.body);

  db.logAudit({
    adminEmail: req.admin!.email,
    action: 'UPDATE_SETTINGS',
    entityType: 'SETTINGS',
    details: req.body
  });

  res.json(updated);
});

// 12. AUDIT LOGS
router.get('/audit-logs', requireAdmin, (req, res) => {
  res.json(db.getAuditLogs(100));
});

// 13. SUPABASE DATABASE STATUS & SYNCHRONIZATION
router.get('/database-status', requireAdmin, async (req, res) => {
  let supabaseLive = false;
  let remoteCounts = { roomTypes: 0, rooms: 0, reservations: 0 };
  let errorMsg: string | undefined = undefined;

  if (isSupabaseConnected) {
    try {
      const [rtRes, rmRes, resRes] = await Promise.all([
        supabase.from('room_types').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('*', { count: 'exact', head: true })
      ]);
      if (!rtRes.error) {
        supabaseLive = true;
        remoteCounts = {
          roomTypes: rtRes.count || 0,
          rooms: rmRes.count || 0,
          reservations: resRes.count || 0,
        };
      } else {
        errorMsg = rtRes.error.message;
      }
    } catch (err: any) {
      errorMsg = err?.message || String(err);
    }
  }

  let sqlScript = '';
  try {
    const sqlPath = path.resolve(process.cwd(), 'database/supabase_complete_setup.sql');
    if (fs.existsSync(sqlPath)) {
      sqlScript = fs.readFileSync(sqlPath, 'utf8');
    }
  } catch (err) {
    console.error('Could not read SQL setup file:', err);
  }

  res.json({
    isConfigured: isSupabaseConnected,
    supabaseUrl: process.env.SUPABASE_URL || 'https://mlhpaboepwxyreccvqdk.supabase.co',
    projectRef: 'mlhpaboepwxyreccvqdk',
    supabaseLive,
    remoteCounts,
    error: errorMsg,
    sqlScript
  });
});

router.post('/database-sync', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    await db.syncFromSupabase();
    db.logAudit({
      adminEmail: req.admin!.email,
      action: 'SYNC_DATABASE_SUPABASE',
      entityType: 'DATABASE',
      details: { timestamp: new Date().toISOString() }
    });
    res.json({ success: true, message: 'Successfully synced database with Supabase' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

export default router;
