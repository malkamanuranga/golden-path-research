# Task Sheet

Participant ID: ______   Condition: A (manual) / B (template)
Start time: ______   End time: ______

## Scenario
You have a small Node.js web service. Your job is to get it running
on Kubernetes with an automated CI pipeline.

## Required outcome (done when ALL are true)
1. The app is packaged as a Docker image.
2. The app runs on Kubernetes with 2 replicas.
3. GET /health returns "ok" through the Kubernetes service.
4. A GitHub Actions pipeline builds the image on every push.

## Rules
- You may use the internet and documentation.
- Record every error you hit and every search you make.
- Stop after 90 minutes even if you are not finished.

## Condition A (manual)
Start from the plain app in baseline/app. Write the Dockerfile,
Kubernetes YAML and CI file yourself.

## Condition B (template)
Run: node deployment-templates/create-service.js <your-service-name>
Then deploy the generated service.