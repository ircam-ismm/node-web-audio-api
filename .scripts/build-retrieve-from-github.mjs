import * as dotenv from 'dotenv';
import { Octokit } from 'octokit';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

dotenv.config({ debug: false });

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;
const ghToken = process.env.GITHUB_TOKEN;

const workflowName = 'matrix-build';
const numArtifacts = 2; // 2 Mac, 2 windows
// need a key for downloading job artifacts
const octokit = new Octokit({ auth: ghToken });

let res;

function checkResponse(res) {
  if (res.status !== 200) {
    console.log('request error:')
    console.log(res);

    console.log('');
    console.log('exiting...');
    process.exit(1);
  }
}

// --------------------------------------------------------------
console.log('');
console.log(`> get ${workflowName} workflow id`);
// --------------------------------------------------------------

res = await octokit.request(`GET /repos/${owner}/${repo}/actions/workflows`);
checkResponse(res)

const workflowId = res.data.workflows.find(w => w.name === workflowName).id;
console.log('workflow id is: ', workflowId);


// --------------------------------------------------------------
console.log('');
console.log(`> get ${workflowName} workflow run id`);
// --------------------------------------------------------------

const runId = await new Promise(async (resolve, reject) => {

    async function checkRunCompleted(resolve) {
      res = await octokit.request(`GET /repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`);
      checkResponse(res)
      // the runs seems to be ordered
      const latestWorkflow = res.data.workflow_runs[0];

      // status: 'completed',
      // conclusion: 'success',
      if (latestWorkflow.status === 'completed') {
        if (latestWorkflow.conclusion === 'success') {
          console.log('workflow successfully completed');

          resolve(latestWorkflow.id);
          return;
        } else {
          console.log('workflow failed, exiting...');
          process.exit(1);
        }
      } else {
        console.log('...workflow not completed, check again in 30 seconds');
        setTimeout(() => checkRunCompleted(resolve), 30 * 1000);
      }
    }

    await checkRunCompleted(resolve);
});

console.log('workflow run id is: ', runId);

// --------------------------------------------------------------
console.log('');
console.log('get artifact list');
// --------------------------------------------------------------

res = await octokit.request(`GET /repos/${owner}/${repo}/actions/runs/${runId}/artifacts`);
checkResponse(res);

if (res.data.total_count < numArtifacts) {
    console.log(`> too few artifacts found: ${res.data.total_count}, exiting...`);
    process.exit(1);
} else {
    console.log('download artifacts');
    const artifacts = res.data.artifacts;

    for (let i = 0; i < artifacts.length; i++) {
        const artifact = artifacts[i];
        const res = await octokit.request(`GET /repos/${owner}/${repo}/actions/artifacts/${artifact.id}/zip`);
        console.log('-------------------------------------');
        console.log(artifact.name);
        console.log('-------------------------------------');

        console.log('> write archive file');
        fs.writeFileSync(`${artifact.name}.zip`, Buffer.from(res.data));

        console.log('> unzip archive file (-o for override):', `unzip -o ${artifact.name}.zip`);
        execSync(`unzip -o ${artifact.name}.zip`, { stdio: 'inherit' });

        console.log('> delete archive file');
        fs.unlinkSync(`${artifact.name}.zip`);
    };

    console.log('')
    console.log('> Success, # archives downloaded and inflated:', artifacts.length);
}
