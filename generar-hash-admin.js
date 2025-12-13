import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = await bcrypt.hash(password, 10);

console.log('========================================');
console.log('HASH GENERADO PARA CONTRASEÑA: admin123');
console.log('========================================');
console.log('\nHash:', hash);
console.log('\n========================================');
console.log('SQL PARA EJECUTAR EN TABLEPLUS/DBEAVER:');
console.log('========================================\n');
console.log(`INSERT INTO admin_users (username, password_hash) 
VALUES (
  'admin',
  '${hash}'
)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash);`);
console.log('\n========================================');
console.log('Credenciales:');
console.log('Usuario: admin');
console.log('Contraseña: admin123');
console.log('========================================\n');

