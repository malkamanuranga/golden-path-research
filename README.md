<div align="center">

# 🛡️ Secure-by-Default Deployment Templates

### A Pilot Evaluation: one command, 61 hand-written config lines removed, 18 → 0 Kubernetes misconfigurations

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24526784.svg)](https://doi.org/10.5281/zenodo.24526784)
![Status](https://img.shields.io/badge/status-preprint-blue)
![Peer review](https://img.shields.io/badge/peer%20review-not%20yet-lightgrey)
![License](https://img.shields.io/badge/paper%20license-CC%20BY%204.0-green)
![Node](https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-v1.36-326CE5?logo=kubernetes&logoColor=white)
![Scanner](https://img.shields.io/badge/scanner-Trivy-1904DA)

**[📄 Read the paper (Zenodo)](https://zenodo.org/records/24526784)** · **[🔗 DOI](https://doi.org/10.5281/zenodo.24526784)** · **[🧑‍🔬 ORCID](https://orcid.org/0009-0004-9208-7525)**

</div>

---

## 📌 Summary

Writing a Dockerfile, Kubernetes manifests and a CI workflow for every service is repetitive, and the defaults are easy to leave unsafe. This pilot tests a **standardized deployment template** (a dependency-free Node.js generator) against a **hand-written baseline**, for the same small containerized service.

| Measure | Baseline | Template v1 | Template v2 (secure by default) |
|---|:---:|:---:|:---:|
| Config lines written by the developer, per service | 61 | 0 (1 command) | 0 (1 command) |
| Trivy failed checks, total | 18 | 18 | **0** |
| HIGH / MEDIUM / LOW | 3 / 4 / 11 | 3 / 4 / 11 | 0 / 0 / 0 |
| Both replicas Ready (`/health` probe) | ✅ | ✅ | ✅ |

**Key finding:** templating alone does not make a deployment safe. Template v1 copied the baseline's unsafe defaults and inherited all 18 findings. The security gain came from the hardened content of v2: non-root user, dropped capabilities, read-only root filesystem, resource limits, seccomp profile, dedicated namespace and a pinned image tag.

> ⚠️ **Honest scope:** single author, one application, one scanner (Trivy). v2 was tuned against Trivy's output ("teaching to the test"), and line counts are only a rough proxy for effort. No human participants were involved, and cognitive load was **not** measured. See Sections 5 and 6 of the paper.

---

## 🚀 Quick start

Requires Node.js. To also run the cluster checks you need Docker Desktop with Kubernetes enabled.

```powershell
# 1. Generate a service from the template (writes to generated/<name>/)
node deployment-templates\create-service.js orders-demo

# 2. Count configuration lines (baseline vs generated)
node measure\count-config.js

# 3. Build and deploy the generated service
cd generated\orders-demo
docker build -t orders-demo:1.0.0 app
kubectl apply -f k8s\app.yaml
kubectl get pods -n apps

# 4. Scan the manifest with Trivy
cd ..\..
docker run --rm -v "${PWD}:/src" aquasec/trivy config /src/generated/orders-demo/k8s
```

---

## 🗂️ Repository map

| Path | What it is |
|---|---|
| `baseline/` | The hand-written baseline: app, Dockerfile, Kubernetes manifest |
| `.github/workflows/baseline-ci.yml` | Baseline CI workflow |
| `deployment-templates/create-service.js` | The generator (Node.js, no dependencies) |
| `generated/orders-demo/` | Example output of the secure-by-default generator |
| `measure/count-config.js` | Counts non-blank configuration lines |
| `results/` | Scan outputs, deployment logs and line-count metrics |
| `docs/` | Task sheet and participant information for the planned human study |

---

## 🔬 What the template adds (v1 → v2)

| Trivy check | Severity | Template v2 control |
|---|---|---|
| KSV-0014 | HIGH | `readOnlyRootFilesystem: true` |
| KSV-0118 (×2) | HIGH | pod and container `securityContext` set |
| KSV-0001 | MEDIUM | `allowPrivilegeEscalation: false` |
| KSV-0012 | MEDIUM | `runAsNonRoot: true` |
| KSV-0013 | MEDIUM | image tag pinned to `1.0.0` |
| KSV-0104 | MEDIUM | `seccompProfile: RuntimeDefault` |
| KSV-0003, 0004, 0106 | LOW | `capabilities.drop: ["ALL"]` |
| KSV-0011, 0015, 0016, 0018 | LOW | CPU and memory requests and limits |
| KSV-0020, 0021 | LOW | `runAsUser` / `runAsGroup` 10001 |
| KSV-0030 | LOW | `seccompProfile: RuntimeDefault` |
| KSV-0110 | LOW | dedicated namespace `apps` |

---

## 🧭 Roadmap

- [x] Baseline, template v1 and v2, Trivy evidence, deployment logs
- [x] Preprint published on Zenodo (DOI above)
- [ ] TechRxiv preprint
- [ ] Human-subject study (random assignment, time to deployment, NASA-TLX, SUS). **Requires ethics approval before any data is collected.**
- [ ] Stronger baseline reviewed by practitioners, more applications and scanners, managed cloud cluster

---

## 📖 How to cite

> Manuranga, M. (2026). *Secure-by-Default Deployment Templates: A Pilot Evaluation* (Preprint). Zenodo. https://doi.org/10.5281/zenodo.24526784

---

## 👤 Author

**Malka Manuranga**, independent researcher, Sri Lanka
📧 bmmanuranga.research@gmail.com · 🧑‍🔬 [ORCID 0009-0004-9208-7525](https://orcid.org/0009-0004-9208-7525) · 💻 [GitHub @malkamanuranga](https://github.com/malkamanuranga)

Feedback and independent replications are very welcome. Please open an issue.
