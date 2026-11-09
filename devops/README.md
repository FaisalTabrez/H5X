# H5X DevOps Lab

**Student:** Md. Faisal Tabrez, 23261A0535  
**Faculty:** K. Rajitha, Associate Professor  
**Repository branch:** `devops/h5x-lab-project`

This branch packages the existing H5X website and implements Git/GitHub,
Jenkins, Docker, Selenium and Kubernetes. The existing website attribution in
`NOTICE-H5X.md` remains applicable. The public website's main-branch publishing
workflow is independent of this lab.

## Introduction

The pipeline checks out this branch, runs the 14 existing Node tests, builds and
validates five pages, builds a non-root Nginx image, runs eight Selenium browser
checks and deploys two replicas into a disposable local kind cluster.
The build uses the checked-in verified CTFtime snapshot. Live data refresh is
not required by the lab. No paid cloud service or external database is needed.

## Git and GitHub

```sh
git clone https://github.com/FaisalTabrez/H5X.git
cd H5X
git switch devops/h5x-lab-project
git log -3 --oneline
```

`.github/workflows/devops-lab.yml` verifies the branch on pushes and manual
dispatch. It runs real Docker, Selenium and Kubernetes steps on a GitHub-hosted
runner and uploads test XML, browser screenshots and rendered manifests.
It does not publish the production website.

## Jenkins

`Jenkinsfile` implements the same five stages using a real Jenkins Pipeline job.
The local lab controller image is defined in `devops/jenkins/Dockerfile`.
Prerequisites: Docker Desktop with Linux containers, kind v0.33.0 and kubectl.
Run these commands from a shell appropriate for your machine; the commands
below use POSIX syntax.

```sh
kind create cluster --name h5x-devops --config devops/kind.yaml
mkdir -p .lab-private
kind get kubeconfig --name h5x-devops --internal > .lab-private/kubeconfig
# Create .lab-private/admin-password with a unique local lab password.
docker build -f devops/jenkins/Dockerfile -t h5x-jenkins-lab:local .
docker volume create h5x-jenkins-home
docker run -d --name h5x-selenium --network kind --shm-size=1g \
  -p 127.0.0.1:14444:4444 selenium/standalone-chromium:latest
docker run -d --name h5x-jenkins --network kind \
  -p 127.0.0.1:18080:8080 -e JAVA_OPTS='-Djenkins.install.runSetupWizard=false -Xmx768m' \
  -v h5x-jenkins-home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD/.lab-private:/run/h5x:ro" h5x-jenkins-lab:local
```

Open `http://127.0.0.1:18080`, sign in as `faisal` with the local password, and
build **H5X-DevOps**. The initialization script creates that job and points it
to this branch. The lab runs the controller as root to access Docker's socket;
this is a trusted, loopback-only teaching setup. Do not expose it publicly or
use it as a production Jenkins architecture. Credentials and kubeconfigs must
remain outside Git. On Windows, use an absolute Windows path for the bind mount.

## Docker

```sh
docker build --progress=plain -t h5x-devops:local .
docker run -d --name h5x-demo -p 127.0.0.1:18081:8080 h5x-devops:local
curl --fail http://127.0.0.1:18081/healthz
docker inspect h5x-demo --format '{{.State.Health.Status}}'
```

The multi-stage Dockerfile builds with Node and serves only `out/` through
unprivileged Nginx on port 8080. `/healthz` supports container health checks and
Kubernetes readiness/liveness probes. Unknown routes return 404.

## Selenium

```sh
python -m pip install -r devops/requirements.txt
# Start a remote Selenium server or use a locally installed Chrome browser.
BASE_URL=http://127.0.0.1:18081 python -m pytest tests/selenium -v -s \
  --junitxml=reports/selenium/junit.xml
```

For a remote browser, set `SELENIUM_REMOTE_URL` to its server URL and set
`BASE_URL` to a website address reachable from that browser container. Five
tests click the navigation links; three test theme persistence, gallery
selection/dialog controls and motion-pause persistence. Browser images are
saved under `reports/selenium/screenshots`, including the open gallery dialog.

## Kubernetes

```sh
kind load docker-image h5x-devops:local --name h5x-devops
kubectl --context kind-h5x-devops apply -k k8s
kubectl --context kind-h5x-devops -n h5x-devops rollout status deployment/h5x
kubectl --context kind-h5x-devops -n h5x-devops get deploy,pods,svc
curl --fail http://127.0.0.1:18088/healthz
kubectl --context kind-h5x-devops -n h5x-devops scale deployment/h5x --replicas=3
kubectl --context kind-h5x-devops -n h5x-devops rollout status deployment/h5x
# Delete one selected H5X pod and observe the ReplicaSet creating a replacement.
kubectl --context kind-h5x-devops -n h5x-devops get pods
kubectl --context kind-h5x-devops -n h5x-devops scale deployment/h5x --replicas=2
```

All operations explicitly target the lab context and namespace. Deployment
settings include two replicas, rolling updates, resource requests/limits,
probes, a read-only root filesystem and dropped Linux capabilities. This is a
single-node lab: multiple pods demonstrate orchestration, not multi-node high
availability. Scaling is manual; this project does not claim autoscaling.

## Conclusion and evidence

The final report, screenshots and execution logs are stored in `devops/report/`
and `devops/evidence/` after verification. Report results must refer to the
captured run IDs and source revision. Full command logs accompany selected
readable screenshots so that the report stays within 15 pages.

## Stop the lab

```sh
docker stop h5x-jenkins h5x-selenium h5x-demo
# When finished with the disposable cluster:
kind delete cluster --name h5x-devops
```

The named Jenkins volume retains its build history. Remove it only when that
history is no longer needed. Do not commit `.lab-private/`, passwords or tokens.
