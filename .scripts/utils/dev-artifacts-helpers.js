import fs from 'node:fs';

const pkg = fs.readFileSync('package.json');
const PROJECT_NAME = JSON.parse(pkg).name;

export const destReleaseFile = `${PROJECT_NAME}.build-release.node`;
export const destDebugFile = `${PROJECT_NAME}.build-debug.node`;

export function deleteDevArtifacts() {
  if (fs.existsSync(destReleaseFile)) {
    fs.rmSync(destReleaseFile, { force: true });
  }

  if (fs.existsSync(destDebugFile)) {
    fs.rmSync(destDebugFile, { force: true });
  }
}
