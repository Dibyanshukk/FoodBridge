// ============================================
//   FoodBridge Backend – server.js
//   Node.js + Express + MySQL
// ============================================

const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname)));


// ─────────────────────────────────────────
// Database Connection Pool
// ─────────────────────────────────────────
const pool = mysql.createPool({
  host    : process.env.DB_HOST     || 'localhost',
  user    : process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'Dibyanshu@7973',
  database: process.env.DB_NAME     || 'foodbridge',
  waitForConnections: true,
  connectionLimit   : 10,
});

// ─────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

// GET /users – list all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users – create a user
app.post('/users', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role)
    return res.status(400).json({ error: 'name, email, and role are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO Users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role]
    );
    res.status(201).json({ message: 'User created', user_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// DONATIONS
// ─────────────────────────────────────────

// GET /donations – list all donations with donor info
app.get('/donations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        fd.donation_id,
        u.name       AS donor_name,
        u.email      AS donor_email,
        fd.food_type,
        fd.quantity,
        fd.expiry_time,
        fd.location,
        fd.status,
        fd.created_at
      FROM Food_Donations fd
      JOIN Users u ON fd.donor_id = u.user_id
      ORDER BY fd.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /donate – add a food donation
app.post('/donate', async (req, res) => {
  const { donor_id, food_type, quantity, expiry_time, location } = req.body;
  if (!donor_id || !food_type || !quantity || !expiry_time || !location)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO Food_Donations (donor_id, food_type, quantity, expiry_time, location) VALUES (?, ?, ?, ?, ?)',
      [donor_id, food_type, quantity, expiry_time, location]
    );
    res.status(201).json({ message: 'Donation added!', donation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/top-donors', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.name, COUNT(fd.donation_id) AS total_donations
      FROM Users u
      JOIN Food_Donations fd ON u.user_id = fd.donor_id
      GROUP BY u.user_id
      ORDER BY total_donations DESC
      LIMIT 3
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// REQUESTS
// ─────────────────────────────────────────

// GET /requests – list all requests
app.get('/requests', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.request_id,
        u.name        AS requester_name,
        u.role        AS requester_role,
        r.food_needed,
        r.quantity,
        r.location,
        r.created_at
      FROM Requests r
      JOIN Users u ON r.requester_id = u.user_id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /request – add a food request
app.post('/request', async (req, res) => {
  const { requester_id, food_needed, quantity, location } = req.body;
  if (!requester_id || !food_needed || !quantity || !location)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO Requests (requester_id, food_needed, quantity, location) VALUES (?, ?, ?, ?)',
      [requester_id, food_needed, quantity, location]
    );
    res.status(201).json({ message: 'Request submitted!', request_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// DISTRIBUTION
// ─────────────────────────────────────────

// GET /distributions – view all distribution records
app.get('/distributions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.distribution_id,
        fd.food_type,
        fd.quantity,
        fd.location   AS pickup_location,
        u.name        AS volunteer_name,
        d.status,
        d.assigned_at
      FROM Distribution d
      JOIN Food_Donations fd ON d.donation_id   = fd.donation_id
      JOIN Users          u  ON d.volunteer_id  = u.user_id
      ORDER BY d.assigned_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /assign – assign a volunteer to a donation
app.post('/assign', async (req, res) => {
  const { donation_id, volunteer_id } = req.body;
  if (!donation_id || !volunteer_id)
    return res.status(400).json({ error: 'donation_id and volunteer_id are required' });

  try {
    // Check volunteer role
    const [users] = await pool.query(
      "SELECT role FROM Users WHERE user_id = ?", [volunteer_id]
    );
    if (!users.length || users[0].role !== 'volunteer')
      return res.status(400).json({ error: 'User is not a volunteer' });

    const [result] = await pool.query(
      'INSERT INTO Distribution (donation_id, volunteer_id, status) VALUES (?, ?, "pending")',
      [donation_id, volunteer_id]
    );

    // Mark donation as assigned
    await pool.query(
      "UPDATE Food_Donations SET status = 'assigned' WHERE donation_id = ?",
      [donation_id]
    );

    res.status(201).json({ message: 'Volunteer assigned!', distribution_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /signup – register user
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );

    res.status(201).json({ message: 'Signup successful!', user_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// POST /login – user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length > 0) {
      res.json({ message: 'Login successful', user: rows[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// PATCH /distributions/:id/deliver – mark as delivered
app.patch('/distributions/:id/deliver', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE Distribution SET status = 'delivered' WHERE distribution_id = ?", [id]
    );
    // Also update donation status
    const [dist] = await pool.query(
      "SELECT donation_id FROM Distribution WHERE distribution_id = ?", [id]
    );
    if (dist.length) {
      await pool.query(
        "UPDATE Food_Donations SET status = 'delivered' WHERE donation_id = ?",
        [dist[0].donation_id]
      );
    }
    res.json({ message: 'Marked as delivered!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Stats (dashboard overview)
// ─────────────────────────────────────────
app.get('/stats', async (req, res) => {
  try {
    const [[donations]]     = await pool.query('SELECT COUNT(*) AS total FROM Food_Donations');
    const [[requests]]      = await pool.query('SELECT COUNT(*) AS total FROM Requests');
    const [[delivered]]     = await pool.query("SELECT COUNT(*) AS total FROM Distribution WHERE status='delivered'");
    const [[volunteers]]    = await pool.query("SELECT COUNT(*) AS total FROM Users WHERE role='volunteer'");
    res.json({
      total_donations : donations.total,
      total_requests  : requests.total,
      delivered       : delivered.total,
      volunteers      : volunteers.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌾 FoodBridge API running at http://localhost:${PORT}`);
  console.log(`   Endpoints ready: /donate  /donations  /request  /assign  /distributions`);
});
