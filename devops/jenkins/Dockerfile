FROM jenkins/jenkins:lts-jdk21
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    docker.io python3 python3-venv curl ca-certificates xz-utils \
    && rm -rf /var/lib/apt/lists/*
ARG NODE_VERSION=22.16.0
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
    | tar -xJ -C /usr/local --strip-components=1
ARG KIND_VERSION=v0.33.0
ARG KUBECTL_VERSION=v1.37.0
RUN curl -fsSL "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64" -o /usr/local/bin/kind \
    && curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o /usr/local/bin/kubectl \
    && chmod +x /usr/local/bin/kind /usr/local/bin/kubectl
COPY devops/requirements.txt /tmp/requirements.txt
RUN python3 -m venv /opt/browser-tests \
    && /opt/browser-tests/bin/pip install --no-cache-dir -r /tmp/requirements.txt
RUN jenkins-plugin-cli --plugins workflow-aggregator git junit timestamper
COPY devops/jenkins/init.groovy /usr/share/jenkins/ref/init.groovy.d/h5x.groovy
# A disposable local lab controller; keep the Docker socket on trusted machines.
USER root
