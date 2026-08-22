import { spawn } from 'child_process';

console.log('📡 Starting Earth-Mars Ground Control Backend Gateway...');
const backend = spawn('npm', ['run', 'dev', '--workspace=apps/backend'], { shell: true, stdio: 'inherit' });

console.log('🧠 Starting On-Rover AI Executive Engine...');
const ai = spawn('npm', ['run', 'dev', '--workspace=apps/ai-engine'], { shell: true, stdio: 'inherit' });

console.log('🚀 Starting Mission Control Frontend Dashboard...');
const frontend = spawn('npm', ['run', 'dev', '--workspace=apps/frontend'], { shell: true, stdio: 'inherit' });

process.on('SIGINT', () => {
  backend.kill();
  ai.kill();
  frontend.kill();
  process.exit();
});
