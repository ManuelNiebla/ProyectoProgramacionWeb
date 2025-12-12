const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'manuel603',
  database: 'company'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a MySQL');
});


// LOGIN

app.post('/api/login', (req, res) => {

  // LOG PARA VER QUE LLEGA DEL FRONTEND
  console.log("Login recibido:", req.body);

  const { email, password } = req.body;

  const query = 'SELECT * FROM usuarios WHERE email = ?';

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error en la query:", err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      console.log("Usuario NO encontrado en BD");
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = results[0];

    // LOG PARA VER HASH Y CONTRASEÑA
    console.log("Password ingresado:", password);
    console.log("Password hash BD:", user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log("⚠ Contraseña INCORRECTA");
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    console.log(" Login EXITOSO!");

    res.json({
      message: 'Login exitoso',
      user: { name: user.name, email: user.email }
    });
  });
});


// API EMPLOYEES
app.get('/api/employees', (req, res) => {
  const query = `
    SELECT e.*, d.Dname as department_name
    FROM employee e
    LEFT JOIN department d ON e.Dno = d.Dnumber
    ORDER BY e.Fname
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error obteniendo empleados:', err);
      return res.status(500).json({ error: 'Error obteniendo empleados' });
    }
    res.json(results);
  });
});


// API DEPARTMENTS

app.get('/api/departments', (req, res) => {
  const query = 'SELECT * FROM department ORDER BY Dname';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error obteniendo departamentos' });
    }
    res.json(results);
  });
});


// CREATE EMPLOYEE

app.post('/api/employees', (req, res) => {
  const { Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_ssn, Dno } = req.body;

  if (!Fname || !Lname || !Ssn || !Dno) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = `
    INSERT INTO employee (Fname, Minit, Lname, Ssn, Bdate, Address, Sex, Salary, Super_ssn, Dno)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Fname, Minit || null, Lname, Ssn,
    Bdate || null, Address || null,
    Sex || 'M', Salary || null,
    Super_ssn || null, Dno
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creando empleado:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Ya existe un empleado con ese SSN' });
      }
      return res.status(500).json({ error: 'Error' });
    }
    res.json({ message: 'Empleado creado exitosamente', id: result.insertId });
  });
});


// UPDATE EMPLOYEE

app.put('/api/employees/:ssn', (req, res) => {
  const { ssn } = req.params;
  const { Fname, Minit, Lname, Bdate, Address, Sex, Salary, Super_ssn, Dno } = req.body;

  const query = `
    UPDATE employee
    SET Fname = ?, Minit = ?, Lname = ?, Bdate = ?, Address = ?, Sex = ?, Salary = ?, Super_ssn = ?, Dno = ?
    WHERE Ssn = ?
  `;

  const values = [
    Fname, Minit, Lname, Bdate, Address,
    Sex, Salary, Super_ssn, Dno, ssn
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error actualizando empleado:', err);
      return res.status(500).json({ error: 'Error actualizando empleado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ message: 'Empleado actualizado exitosamente' });
  });
});


// DELETE EMPLOYEE

app.delete('/api/employees/:ssn', (req, res) => {
  const { ssn } = req.params;

  const query = 'DELETE FROM employee WHERE Ssn = ?';

  db.query(query, [ssn], (err, result) => {
    if (err) {
      console.error('Error eliminando empleado:', err);
      return res.status(500).json({ error: 'Error eliminando empleado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json({ message: 'Empleado eliminado exitosamente' });
  });
});


// SERVIDOR

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
