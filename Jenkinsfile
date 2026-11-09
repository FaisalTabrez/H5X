pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }
    environment {
        KUBECONFIG = '/run/h5x/kubeconfig'
        KUBE_CONTEXT = 'kind-h5x-devops'
        SELENIUM_REMOTE_URL = 'http://h5x-selenium:4444'
    }
    stages {
        stage('Git checkout') {
            steps {
                checkout scm
                sh 'git branch --show-current; git log -1 --format="%h %s"'
                script { env.APP_IMAGE = "h5x-devops:build-${env.BUILD_NUMBER}" }
            }
        }
        stage('Test and build') {
            steps {
                sh 'node --version; npm test; npm run build:pages; npm run check:site'
            }
        }
        stage('Docker image') {
            steps {
                sh 'docker build --progress=plain -t "$APP_IMAGE" .'
                sh 'docker image inspect "$APP_IMAGE" --format="Image={{.Id}} User={{.Config.User}}"'
            }
        }
        stage('Selenium acceptance') {
            steps {
                sh '''
                    docker run -d --name "h5x-test-${BUILD_NUMBER}" --network kind "$APP_IMAGE"
                    export BASE_URL="http://h5x-test-${BUILD_NUMBER}:8080"
                    /opt/browser-tests/bin/python -m pytest tests/selenium -v -s --junitxml=reports/selenium/junit.xml
                '''
            }
        }
        stage('Kubernetes deploy') {
            steps {
                sh '''
                    kind load docker-image "$APP_IMAGE" --name h5x-devops
                    mkdir -p reports/manifests
                    kubectl kustomize k8s > reports/manifests/deployment.yaml
                    sed -i "s|h5x-devops:local|$APP_IMAGE|g" reports/manifests/deployment.yaml
                    kubectl --context "$KUBE_CONTEXT" apply -f reports/manifests/deployment.yaml
                    kubectl --context "$KUBE_CONTEXT" -n h5x-devops rollout status deployment/h5x --timeout=120s
                    kubectl --context "$KUBE_CONTEXT" -n h5x-devops get deployments,pods,services -o wide
                    curl --fail --retry 12 --retry-delay 2 --retry-all-errors http://h5x-devops-control-plane:30080/healthz
                '''
            }
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'reports/selenium/junit.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/**/*'
            sh 'docker rm -f "h5x-test-${BUILD_NUMBER}" >/dev/null 2>&1 || true'
        }
    }
}
