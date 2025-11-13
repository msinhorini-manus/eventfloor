import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const adminAccounts = [
  {
    email: 'marcelo.sinhorini@portalerp.com',
    password: 'MARC1976',
    name: 'Marcelo Sinhorini',
  },
  {
    email: 'andrea.sinhorini@portalerp.com',
    password: 'ANDREA1980',
    name: 'Andrea Sinhorini',
  },
  {
    email: 'vanessa.hipolito@portalerp.com',
    password: 'VANESSA2025!',
    name: 'Vanessa Hipólito',
  },
  {
    email: 'adriana.santos@portalerp.com',
    password: 'ADRIANA2025@',
    name: 'Adriana Santos',
  },
];

async function createAdmins() {
  console.log('🔐 Creating admin accounts...\n');

  // Connect to database
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  for (const account of adminAccounts) {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);

      // Insert admin
      await connection.execute(
        'INSERT INTO admins (email, passwordHash, name, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [account.email, passwordHash, account.name, true]
      );

      console.log(`✅ Created admin: ${account.name} (${account.email})`);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`⚠️  Admin already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating admin ${account.email}:`, error.message);
      }
    }
  }

  await connection.end();
  console.log('\n✨ Done!');
  process.exit(0);
}

createAdmins().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
