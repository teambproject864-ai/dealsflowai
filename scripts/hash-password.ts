import bcrypt from 'bcrypt';

const password = 'Praneeth123!';
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Hashed password for Praneeth123! is:');
  console.log(hash);
});
