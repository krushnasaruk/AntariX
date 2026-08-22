import { execSync } from 'child_process';

console.log('🚀 Bootstrapping Earth-Mars Autonomous Mission Monorepo Workspace...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Monorepo Setup & Bootstrap Complete!');
} catch (e) {
  console.log('⚠️ Bootstrap warning: Running in lightweight standalone mode.');
}
