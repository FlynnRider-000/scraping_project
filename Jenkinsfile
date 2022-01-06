@Library('shared-library') _

def branch = env.BRANCH_NAME
def docker_tag = "${branch}".replaceAll("origin/","")
docker_tag = "${docker_tag}".replaceAll("/","-")
image_latest_tag = "${branch}" == "main" ? "latest" : "${docker_tag}"
def common = null

pipeline {
    environment {
        COMMIT_ID = sh(script: "printf \$(git rev-parse HEAD | cut -c 1-7)",returnStdout: true)
        IMAGE_TAG="${docker_tag}_${COMMIT_ID}_${BUILD_NUMBER}"
        scraping_image = ''
    }
    agent any
    options {
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
    }


    stages {
       
        stage("Build Images")
        {
          parallel {

              stage("Build Scraping Service Image")
              {
                steps
                { 
                    script {
                      scraping_image = docker.build("scraping-service:${IMAGE_TAG}")
                    }
                }
              }
          }
        }
        stage("Quality Control")
        {
            parallel {
                stage("Linting") {
                    steps {
                        script {
                            scraping_image.inside() {
                                sh "cd /appreciate-monorepo/services/scraping-service && npm run lint"
                            }
                        }
                    }
                }
                stage("Testing") {
                    steps {
                        script {
                            scraping_image.inside() {
                                sh "cd /appreciate-monorepo/services/scraping-service && npm run test"
                            }
                        }
                    }
                }
                stage("Dependency Audit") {
                    steps {
                        script {
                            scraping_image.inside("-u root") {
                                sh "cd /appreciate-monorepo/services/scraping-service && npm audit"
                            }
                        }
                    }
                }
            }
        }
    }


    post { 
        always { 
            SendSlackNotification(currentBuild.result)
        }
    }

}