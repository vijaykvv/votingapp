# Security Scanning Integration

This document describes the security scanning, SBOM generation, and VEX creation features added to the GitHub Actions workflows.

## Overview

The voting app now includes comprehensive security scanning for all three components (vote, result, worker) with the following features:

- **Vulnerability Scanning** using Grype
- **SBOM Generation** using Syft  
- **VEX Document Creation** using VEXctl
- **Image Attestation** using Cosign
- **Automated Storage** of security artifacts

## Workflow Triggers

All workflows now trigger on both `main` and `sbom` branches for:
- Push events
- Pull request events

## Security Tools Installed

### Grype
- Vulnerability scanner for container images
- Generates JSON and table format reports
- Scans for known CVEs and security issues

### Syft
- Software Bill of Materials (SBOM) generator
- Creates SPDX-JSON format SBOMs
- Catalogs all packages and dependencies in images

### VEXctl
- Vulnerability Exchange (VEX) document creator
- Creates OpenVEX format documents
- Provides vulnerability status information

### Cosign
- Image signing and attestation tool
- Attests SBOMs and VEX documents to images
- Uses keyless signing with OIDC

## Outputs and Storage

### SBOM Files
Stored in `Image-SBOM-Details/` directory:
- `{imagename}-{tag}-sbom.spdx.json` - SPDX JSON format
- `{imagename}-{tag}-sbom.txt` - Human readable table format

### VEX Files  
Stored in `VEX-Image-Details/` directory:
- `{imagename}-{tag}-vex.json` - OpenVEX JSON format

### Vulnerability Reports
Stored in `grype-reports/` directory:
- `{imagename}-{tag}-vulnerabilities.json` - JSON format
- `{imagename}-{tag}-vulnerabilities.txt` - Human readable format

## Image Names and Tags

The workflows generate unique tags for each build:
- Format: `latest-{run_id}-{run_number}`
- Examples:
  - `votingapp_vote:latest-1234567890-1`
  - `votingapp_result:latest-1234567890-2` 
  - `votingapp_worker:latest-1234567890-3`

## Attestation

Each image gets the following attestations:
- **SBOM Attestation** (type: spdxjson)
- **VEX Attestation** (type: vuln)

Attestations are stored with the image in the registry and can be verified using:
```bash
cosign verify-attestation --type spdxjson {image}
cosign verify-attestation --type vuln {image}
```

## Workflow Jobs

Each workflow now contains three jobs:

1. **call-docker-build** - Builds and pushes the image
2. **security-scan** - Performs all security scanning and attestation
3. **update-manifests** - Updates Kubernetes manifests with new image tags

## Required Secrets

The workflows require the following GitHub secrets:
- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Security Benefits

- **Vulnerability Visibility** - Early detection of security issues
- **Supply Chain Security** - Complete software bill of materials
- **Compliance** - VEX documents for vulnerability disclosure
- **Traceability** - Cryptographic attestation of security artifacts
- **Automated** - No manual intervention required

## Usage

Security scanning runs automatically on every push to `main` or `sbom` branches. The artifacts are committed back to the repository and attestations are attached to the container images.

To verify an image's SBOM:
```bash
cosign verify-attestation --type spdxjson vijaykvv/votingapp_vote:latest-{run_id}-{run_number}
```

To verify an image's VEX document:
```bash
cosign verify-attestation --type vuln vijaykvv/votingapp_vote:latest-{run_id}-{run_number}
```
