import { spawn } from 'child_process';

function run(name, command, args) {
  const child = spawn(command, args, {
    shell: true,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  return child;
}

const backend = run('backend', 'npm', ['--prefix', 'backend', 'run', 'dev']);
const frontend = run('frontend', 'npm', ['--prefix', 'frontend', 'run', 'dev']);

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
