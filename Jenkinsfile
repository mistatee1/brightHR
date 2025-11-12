pipeline {
  agent any

  parameters {
    string(name: 'APP_URL', defaultValue: 'https://sandbox-app.brighthr.com/lite', description: 'Base URL of the app under test')
    string(name: 'TEST_EMAIL', defaultValue: '', description: 'Test account email')
    string(name: 'TEST_PASSWORD', defaultValue: '', description: 'Test account password')
    booleanParam(name: 'HEADED', defaultValue: false, description: 'Run tests in headed mode (with browser visible)')
  }

  environment {
    APP_URL = "${params.APP_URL}"
    TEST_EMAIL = "${params.TEST_EMAIL}"
    TEST_PASSWORD = "${params.TEST_PASSWORD}"
    NODE_HOME = tool name: 'Node-18', type: 'jenkins.plugins.shiningpanda.tools.NodeJSInstallation'
    PATH = "${NODE_HOME}/bin:${PATH}"
  }

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  stages {
    stage('Setup') {
      steps {
        script {
          echo "Node version:"
          sh 'node --version'
          echo "npm version:"
          sh 'npm --version'
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps chromium'
      }
    }

    stage('Run Playwright Tests') {
      steps {
        script {
          def headdedFlag = params.HEADED ? '--headed' : ''
          sh "npx playwright test --project=chromium --reporter=html,junit ${headdedFlag}"
        }
      }
    }
  }

  post {
    always {
      echo 'Archiving test results...'
      archiveArtifacts artifacts: 'playwright-report/**/*,test-results/**/*', allowEmptyArchive: true
      junit testResults: 'test-results/junit.xml', allowEmptyResults: true
      publishHTML([
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright HTML Report',
        allowMissing: false,
        alwaysLinkToLastBuild: true
      ])
    }

    success {
      echo '✓ All tests passed!'
    }

    failure {
      echo '✗ Tests failed. Check the Playwright HTML report and junit results above.'
    }

    unstable {
      echo '⚠ Some tests may have failed or been flaky.'
    }
  }
}
