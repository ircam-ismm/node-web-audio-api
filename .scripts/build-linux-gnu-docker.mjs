import { execSync } from 'node:child_process';

const cwd = process.cwd();
console.log(`> executing docker command in dir ${cwd}`);

// the source code directory is shared with the docker image,
// so every thing is always up to date

// @todo - rebuild docket image
// cd ./.scripts/docker_x86_64-unknown-linux-gnu/
// docker build -t bbmmaa/build-x86_64 .

execSync(`docker run --rm \
  -v ~/.cargo/git:/root/.cargo/git \
  -v ~/.cargo/registry:/root/.cargo/registry \
  -v ${cwd}:/sources \
  -w /sources \
  bbmmaa/build-x86_64 \
  bash -c "
    yarn build:jack --target x86_64-unknown-linux-gnu && \
    x86_64-linux-gnu-strip *.linux-x64-gnu.node && \
    ls -al /sources"
`, { stdio: 'inherit' });
