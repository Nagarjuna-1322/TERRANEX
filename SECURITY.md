# Security Policy

## Supported Versions

The project is currently maintained in the default branch and security fixes are applied as soon as practical.

| Version | Supported |
| ------- | --------- |
| main / latest | :white_check_mark: |
| older branches or tags | :x: |

## Reporting a Vulnerability

Please report security issues privately by emailing the maintainer or opening a confidential report through the repository security tab.

When reporting a vulnerability, include:

- a description of the issue
- the affected file or endpoint
- reproduction steps
- the impact and severity
- any suggested remediation

We will acknowledge the report within 5 business days and keep you informed as the fix is validated and released.

## Security Expectations

- do not commit secrets, API keys, or Firebase credentials
- rotate exposed credentials immediately if they were accidentally published
- keep dependencies updated and review security advisories regularly
- validate access rules before enabling production data access
