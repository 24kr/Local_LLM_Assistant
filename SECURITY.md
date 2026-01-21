# Security Policy

## Supported Versions

LoLA is currently in active development. The following versions receive security updates:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.0.x   | :white_check_mark: | Current stable release |
| 0.9.x   | :white_check_mark: | Beta - Limited support until 1.1.0 |
| < 0.9   | :x:                | No longer supported |

**Note:** As LoLA is a local-first application that runs entirely on your machine, security vulnerabilities have different implications than cloud-based services. However, we take security seriously and address issues promptly.

## Security Considerations

### Local-First Architecture
- **No Data Transmission**: LoLA processes all data locally; your documents and conversations never leave your machine
- **No Authentication Required**: Since it's a desktop application, traditional authentication vulnerabilities don't apply
- **File System Access**: LoLA requires read/write access to store documents and chat history locally

### Potential Security Concerns
We monitor and address the following areas:
- **Malicious File Uploads**: Protection against files designed to exploit parsing vulnerabilities
- **Dependency Vulnerabilities**: Regular updates to Python and Node.js dependencies
- **Code Injection**: Sanitization of user inputs to prevent potential exploits
- **File System Security**: Proper permissions and sandboxing of uploaded documents
- **Electron Security**: Following Electron security best practices for the desktop app

## Reporting a Vulnerability

We appreciate responsible disclosure of security vulnerabilities.

### How to Report

**For security issues, please do NOT open a public GitHub issue.**

Instead, report vulnerabilities privately via:

1. **GitHub Security Advisories** (Preferred)
   - Navigate to the Security tab in our repository
   - Click "Report a vulnerability"
   - Fill out the private advisory form

2. **Email**
   - Send details to: [security@yourdomain.com] or [your-github-email]
   - Subject line: "[SECURITY] LoLA Vulnerability Report"
   - Include: Description, steps to reproduce, potential impact, and suggested fix if known

### What to Include

Please provide as much information as possible:
- Type of vulnerability (file parsing, dependency, code injection, etc.)
- Steps to reproduce the issue
- Affected versions
- Potential impact and severity assessment
- Proof of concept (if applicable)
- Suggested mitigation or fix (optional)

### Response Timeline

- **Initial Response**: Within 48 hours of report
- **Status Update**: Every 5-7 days until resolved
- **Fix Timeline**: 
  - Critical vulnerabilities: 1-7 days
  - High severity: 7-14 days
  - Medium/Low severity: 14-30 days

### What to Expect

**If the vulnerability is accepted:**
- We'll work on a fix and keep you updated on progress
- You'll be credited in the security advisory (unless you prefer to remain anonymous)
- We'll coordinate disclosure timing with you
- A security patch will be released and announced

**If the vulnerability is declined:**
- We'll explain why it doesn't qualify as a security issue
- We may still address it as a regular bug or enhancement
- You're welcome to discuss our reasoning

## Security Best Practices for Users

### Recommended Setup
1. **Keep LoLA Updated**: Always use the latest version to receive security patches
2. **Verify Downloads**: Only download LoLA from official sources (GitHub releases)
3. **Ollama Security**: Keep your Ollama installation updated
4. **File Sources**: Only upload documents from trusted sources
5. **Firewall**: Though LoLA runs locally, ensure your firewall is configured properly

### Safe Usage
- Don't share your LoLA installation directory with untrusted users
- Regularly review uploaded documents in the `backend/uploads/` folder
- Be cautious when uploading files from unknown sources
- Check file sizes before upload (50MB limit by default)

## Security Updates

Security patches are released as:
- **Patch versions** (e.g., 1.0.1 → 1.0.2) for minor security fixes
- **Minor versions** (e.g., 1.0.x → 1.1.0) for moderate security improvements
- **Immediate hotfixes** for critical vulnerabilities

Security advisories are published via:
- GitHub Security Advisories
- Release notes with `[SECURITY]` tag
- README updates for critical issues

## Dependency Security

We actively monitor dependencies using:
- **Dependabot**: Automated dependency updates for known vulnerabilities
- **npm audit**: Regular Node.js dependency checks
- **pip-audit**: Python package vulnerability scanning
- **Snyk**: Additional vulnerability monitoring (optional)

### Regular Audits
Run these commands periodically to check for vulnerabilities:
```bash
# Python dependencies
cd backend
pip-audit

# Node.js dependencies
cd frontend
npm audit
```

## Disclosure Policy

- **Responsible Disclosure**: We follow a coordinated disclosure approach
- **Disclosure Window**: Typically 90 days from initial report before public disclosure
- **Public Credit**: Security researchers are credited unless they request anonymity
- **CVE Assignment**: For significant vulnerabilities, we'll request CVE IDs when appropriate

## Questions?

For non-security questions about privacy or data handling:
- Open a regular GitHub issue
- Start a GitHub Discussion
- Check our [Privacy Documentation](docs/PRIVACY.md) (if you create one)

Thank you for helping keep LoLA secure! 🔒
