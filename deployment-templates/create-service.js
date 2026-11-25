const fs = require('fs');
const path = require('path');

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: node create-service.js <service-name>');
  process.exit(1);
}

const out = path.join(__dirname, '..', 'generated', name);
if (fs.existsSync(out)) {
  console.error('Already exists: ' + out);
  process.exit(1);
}

const files = {
  'app/package.json': JSON.stringify(
    { name, version: '1.0.0', main: 'server.js', scripts: { start: 'node server.js' } }, null, 2),

  'app/server.js': `const http = require('http');
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200); return res.end('ok'); }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from ${name}' }));
}).listen(port, () => console.log('Running on ' + port));
`,

  'app/Dockerfile': `FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
EXPOSE 3000
USER node
CMD ["node", "server.js"]
`,

  'k8s/app.yaml': `apiVersion: v1
kind: Namespace
metadata:
  name: apps
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: apps
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          image: ${name}:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            runAsNonRoot: true
            runAsUser: 10001
            runAsGroup: 10001
            capabilities:
              drop: ["ALL"]
            seccompProfile:
              type: RuntimeDefault
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: apps
spec:
  selector:
    app: ${name}
  ports:
    - port: 80
      targetPort: 3000
`,

  '.github/workflows/ci.yml': `name: ci
on:
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t ${name} app
`,
};

for (const [file, content] of Object.entries(files)) {
  const target = path.join(out, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
console.log('Created service: ' + out);