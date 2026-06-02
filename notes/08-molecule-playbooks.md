# Molecule with Playbooks — Ansible 101 (Jeff Geerling)

Video: [Ansible 101 - Episode 8](https://www.youtube.com/watch?v=...)

## Using Molecule with Playbooks (not Roles) [(15:41)](https://youtu.be/...)

Molecule works with standalone playbooks too. Create a scenario inside the playbook directory:

```bash
mkdir myplaybook && cd myplaybook
molecule init scenario
```

Since Molecule defaults to expecting a role structure, modify `converge.yml` to use `import_playbook` instead of `include_role`:

```yaml
- name: Converge
  hosts: all
  tasks:
    - name: Update apt cache
      ansible.builtin.apt:
        update_cache: true
        cache_valid_time: 3600
      when: ansible_facts['os_family'] == 'Debian'

- name: Import main playbook
  import_playbook: ../../main.yml
```

Add an explicit apt cache update task for Debian/Ubuntu to prevent package failures.

## Configuration

### Systemd in Docker [(24:06)](https://youtu.be/...)

Managing services (`service: state=started`) requires systemd inside the container:

```yaml
platforms:
  - name: instance
    image: geerlingguy/docker-${MOLECULE_DISTRO:-ubuntu2404}-ansible:latest
    pre_build_image: true
    privileged: true
    cgroupns_mode: host
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    command: /sbin/init
```

- **`privileged: true`** — required for systemd; bypasses resource isolation, use only with trusted images
- **`cgroupns_mode: host`** — needed for cgroup v2 (note: it's `cgroupns_mode`, not `cgroupns`)
- **Volume `rw` vs `ro`** — `ro` causes systemd to fail and the container to exit with code 255, surfacing as a misleading `Failed to create temporary directory` error. Use `rw`.
- **`$MOLECULE_DISTRO`** — environment variable to swap distros (e.g., `ubuntu2404`, `centos8`)

### `remote_tmp` — no writable home directory

The container image has no writable home directory for root:

```yaml
provisioner:
  env:
    ANSIBLE_REMOTE_TMP: /tmp/.ansible
```

### Linting [(41:03)](https://youtu.be/...)

```yaml
lint: |
  yamllint .
  ansible-lint
```

### Full `molecule.yml`

```yaml
---
dependency:
  name: galaxy

driver:
  name: docker

platforms:
  - name: instance
    image: geerlingguy/docker-${MOLECULE_DISTRO:-ubuntu2404}-ansible:latest
    pre_build_image: true
    privileged: true
    cgroupns_mode: host
    volumes:
      - /sys/fs/cgroup:/sys/fs/cgroup:rw
    command: /sbin/init

provisioner:
  name: ansible
  playbooks:
    converge: converge.yml
    verify: verify.yml
  env:
    ANSIBLE_REMOTE_TMP: /tmp/.ansible

lint: |
  yamllint .
  ansible-lint
```

### `create.yml` / `destroy.yml` stubs

The `molecule init scenario` command generates these as placeholders. If they exist, Molecule uses them instead of the built-in driver logic. **Delete them** to restore default behavior:

```bash
rm molecule/default/create.yml molecule/default/destroy.yml
```

## Key Commands [(18:42)](https://youtu.be/...)

| Command | Purpose |
|---------|---------|
| `molecule converge` | Create + run the playbook (leaves container up) |
| `molecule verify` | Run the verification playbook against a running container |
| `molecule test` | Full lifecycle: lint → destroy → create → converge → idempotence → verify → destroy |
| `molecule login` | SSH/exec into the running container for manual debugging |
| `molecule destroy` | Tear down containers |
| `molecule list` | Show instance status |

## Idempotence Testing [(33:18)](https://youtu.be/...)

`molecule test` automatically runs the playbook a second time after the initial converge. If any task reports `changed` on the second run, idempotence fails — the playbook isn't idempotent.

## Verification [(34:30)](https://youtu.be/...)

Replace weak default assertions with meaningful checks in `verify.yml`:

```yaml
- name: Verify Apache is running
  hosts: all
  tasks:
    - name: Check HTTP status
      ansible.builtin.uri:
        url: http://localhost
        status_code: 200
```

## CI/CD Tips [(55:29)](https://youtu.be/...)

Enable color output in CI (e.g., GitHub Actions):

```yaml
env:
  PY_COLORS: '1'
  ANSIBLE_FORCE_COLOR: '1'
```

## Gotchas

- **`ansible_os_family` deprecation** — Ansible ≥2.24 no longer auto-injects facts. Use `ansible_facts['os_family']`.
- **Save files before running** — unsaved changes cause silent failures [(29:17)](https://youtu.be/...)
