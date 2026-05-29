# learn-ansible

Learning Ansible via [Jeff Geerling's Ansible 101 playlist](https://youtube.com/playlist?list=PL2_OBreMn7FqZkvMYt6ATmgC0KAGGJNAN&si=VpW2HNxQcB3D3YjO) to manage infrastructure for [Appa](https://github.com/theolujay/appa) -- a self-hostable deployment platform.

## Appa architecture overview

```
[ PROVISION ] --> [ INSTALL ] --> [ DEPLOY ]
   Ubuntu VPS      appa.dev/install    Git URL in
   (any host)      (one-command)       (zero-config build)
```

Three layers:
- **Network Boundary** -- Caddy (TLS, routing on ports 80/443)
- **Platform** -- Go API, PostgreSQL, BuildKit, React UI (Docker Compose, internal `appa_net`)
- **Pipeline** -- Source -> Railpack plan -> BuildKit image -> Docker start -> Caddy route

Ansible will handle OS hardening, firewall (UFW), and SSH security for production VPS provisioning.

See full architecture at [github.com/theolujay/appa](https://github.com/theolujay/appa).
