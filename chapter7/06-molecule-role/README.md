# Molecule Testing

Molecule is the standard framework for testing Ansible roles. It spins up ephemeral instances (containers or VMs), runs your role against them, runs verification tests, then destroys them.

## Setup

```bash
# Create a new role (molecule init role was removed in v6.0.0)
ansible-galaxy role init myrole
cd myrole

# Create a molecule scenario inside the role
molecule init scenario
```

This generates a `molecule/default/` directory with:

| File | Purpose |
|------|---------|
| `molecule.yml` | Driver, platform, provisioner config |
| `converge.yml` | Playbook that applies the role |
| `verify.yml` | Testinfra or Ansible-based verification |
| `create.yml` / `destroy.yml` | Instance lifecycle (auto-generated) |

## Workflow

| Command | What it does |
|---------|-------------|
| `molecule test` | Full cycle: create -> converge -> verify -> destroy |
| `molecule converge` | Create + converge only (leaves container running for debugging) |
| `molecule login` | SSH into the running instance |
| `molecule verify` | Re-run verification against a running instance |
| `molecule destroy` | Tear down instances |
| `molecule list` | Show instances and their status |

## Debugging

Add a breakpoint in role tasks using `fail`:

```yaml
- name: Breakpoint for debugging
  ansible.builtin.fail:
    msg: "Pausing execution — check the container state"
```

On converge, the playbook stops here and leaves the container running so you can `molecule login` and inspect.

## Common drivers

| Driver | Use case |
|--------|----------|
| `docker` (default) | Fastest, good for most role testing |
| `vagrant` | Full VM testing with systemd |
| `delegated` | Bring your own instance |
| `ec2` / `digitalocean` | Test against real cloud VMs |

Configure in `molecule.yml`:

```yaml
driver:
  name: docker
platforms:
  - name: instance
    image: geerlingguy/docker-ubuntu2404-ansible:latest
    pre_build_image: true
```
