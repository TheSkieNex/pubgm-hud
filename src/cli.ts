import { Command } from 'commander';
import readline from 'readline';
import { eq } from 'drizzle-orm';

import db from './db';
import { adminUser } from './db/schemas/admin/user';

const program = new Command();

function prompt(question: string, hideInput?: boolean): Promise<string> {
  if (!hideInput) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise(resolve =>
      rl.question(question, answer => {
        rl.close();
        resolve(answer);
      })
    );
  }
  return new Promise(resolve => {
    process.stdout.write(question);
    let input = '';
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    function onData(char: Buffer) {
      const c = char.toString();
      if (c === '\r' || c === '\n') {
        process.stdout.write('\n');
        process.stdin.setRawMode?.(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        resolve(input);
      } else if (c === '\u0003') {
        process.stdout.write('\n');
        process.stdin.setRawMode?.(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.exit();
      } else if (c === '\u0008' || c === '\u007f') {
        // handle backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        input += c;
        process.stdout.write('*');
      }
    }
    process.stdin.on('data', onData);
  });
}

program.version('1.0.0');

program.command('admin:create-user').action(async () => {
  const email = await prompt('Email: ');
  const password = await prompt('Password: ', true);

  const existingUser = await db.select().from(adminUser).where(eq(adminUser.email, email));

  if (existingUser.length > 0) {
    console.log('User already exists');
    return;
  }

  await db.insert(adminUser).values({
    email,
    password,
  });

  console.log('User created successfully');
});

program.command('admin:list-users').action(async () => {
  const dbUsers = await db.select().from(adminUser);

  console.log(
    dbUsers.map(user => ({
      email: user.email,
      createdAt: new Date(user.createdAt).toISOString(),
    }))
  );
});

program.command('admin:delete-user').action(async () => {
  const email = await prompt('Email: ');
  await db.delete(adminUser).where(eq(adminUser.email, email));
  console.log('User deleted successfully');
});

program.parse(process.argv);
