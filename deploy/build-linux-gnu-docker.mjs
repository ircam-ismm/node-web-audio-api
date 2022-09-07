import { execSync } from 'node:child_process';

const cwd = process.cwd();
console.log(`> executing docker command in dir ${cwd}`);

execSync(`docker run --rm \
  -v ~/.cargo/git:/root/.cargo/git \
  -v ~/.cargo/registry:/root/.cargo/registry \
  -v ${cwd}:/sources \
  -w /sources \
  bbmmaa/build-x86_64 \
  bash -c "
    yarn build --target x86_64-unknown-linux-gnu && \
    x86_64-linux-gnu-strip *.linux-x64-gnu.node && \
    ls -al /sources"
`, { stdio: 'inherit' });
