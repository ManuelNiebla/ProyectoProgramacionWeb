const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'manuel603',
  database: 'company'
});

async function createUser() {
  const email = 'manuel@dominio.com';
  const password = '12345';
  const name = 'Manuel';
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Hash generado:', hash);
  console.log('Longitud del hash:', hash.length);
  
  // Primero eliminar si existe
  db.query('DELETE FROM usuarios WHERE email = ?', [email], (err) => {
    if (err) console.error('Error eliminando:', err);
    
    // Insertar nuevo usuario
    db.query(
      'INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash],
      (err, result) => {
        if (err) {
          console.error('Error insertando:', err);
        } else {
          console.log('✅ Usuario creado exitosamente');
          
          // Verificar que se guardó correctamente
          db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, rows) => {
            if (err) console.error(err);
            else console.log('Usuario en BD:', rows[0]);
            db.end();
          });
        }
      }
    );
  });
}

createUser();