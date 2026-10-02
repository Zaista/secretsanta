import { execSync } from 'child_process';

// appVersion is the commit SHA injected by cloudbuild.yaml; locally fall back to git
function getCommit() {
  if (process.env.appVersion) return process.env.appVersion;
  try {
    return execSync('git rev-parse --short HEAD', { stdio: 'pipe' })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

let version;

export function getVersion() {
  // GAE_VERSION is set by App Engine to the deployed version id (a timestamp)
  version ??= {
    commit: getCommit(),
    deployVersion: process.env.GAE_VERSION ?? null,
  };
  return version;
}

export function getVersionLabel() {
  const { commit, deployVersion } = getVersion();
  return deployVersion ? `${commit} · ${deployVersion}` : commit;
}
