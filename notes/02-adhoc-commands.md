# Ad-Hoc Commands -- Ansible 101 (Jeff Geerling)

Video: [https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE)

## Why ad-hoc?

One-off tasks without writing a full playbook. Great for debugging,
quick checks, and emergencies. Not for repeatable work -- that's what
playbooks are for.

## Why clock sync matters [(35:18)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2118)

Jeff stresses keeping server clocks in sync because:

- **Distributed consistency** -- mismatched timestamps across servers
  make logs and events impossible to chronologically align.
- **Database/search integrity** -- transactions and indexing rely on
  precise timestamps; even a second of drift causes failures.
- **Automation surprises** -- Jeff's hosting providers kept reverting
  his timezone to local despite setting UTC, breaking his scripts.
  Always set timezone explicitly in provisioning.

## --ask-become-pass / -K [(47:04)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2824)

Prompts for the sudo password when the remote user doesn't have
passwordless sudo. Used with the `-b` (become) flag.

| Flag | What it's for                        |
|------|--------------------------------------|
| `-K` | Become/sudo password (capital K)     |
| `-k` | SSH connection password (lowercase k)|

Without `-K`, Ansible assumes passwordless sudo. If sudo requires a
password and you omit `-K`, the task fails.

## service module [(49:00)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2940)

Controls and manages services on remote hosts. Idempotent -- checks
current state and only acts if it doesn't match the desired state.

Jeff uses it to start NTP after installation:

```
ansible multi -i inventory -b -m service \
    -a "name=ntpd state=started enabled=yes"
```

Key features:
- **Cross-platform** -- auto-detects systemd, init.v, etc. [(48:31)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2911)
- `state=started` -- ensures the service is running immediately
- `enabled=yes` -- ensures it starts on boot [(48:54)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2934)

## Finding module docs [(49:09)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2949)

Two ways to look up module parameters and examples:

1. **Web search** (recommended) -- search "Ansible [module] module"
   (e.g. "Ansible service module"). Nicely formatted, easy to share
   links, and you can submit doc fixes from the page [(49:09-49:50)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2949).
2. **ansible-doc** -- `ansible-doc [module_name]` from the terminal.
   Same info, different formatting. Useful when offline [(50:01-50:55)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=3001).

## setup module -- gathering facts

`ansible db -i inventory -m setup` collects system information (OS,
IP, memory, disks, etc.) from target hosts. Facts are stored in
`ansible_facts` and can be used in playbooks for conditional logic
(e.g. `when: ansible_facts['os_family'] == "RedHat"`).

## command module (default)

When you omit `-m`, Ansible uses the `command` module by default.
It runs a command on the remote host via shell.

**Not idempotent** -- running it repeatedly has no safety net. Use
specialized modules (`yum`, `service`, `copy`) instead for anything
that modifies the system.

## idempotency [(0:53:11)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=3191)

A module is idempotent if running it multiple times produces the same
result as running it once. Ansible checks the current state first and
only makes changes if needed.

| Module    | Idempotent? | Why                                 |
|-----------|-------------|-------------------------------------|
| `yum`     | Yes         | Checks if package is already installed |
| `service` | Yes         | Checks if service is already started/enabled |
| `command` | No          | Runs the command every time, no state check |
| `shell`   | No          | Same as command                     |

The takeaway: **prefer modules that declare desired state** over raw
commands. Your playbooks become safe to re-run.

## Syntax

```
ansible [target] -i [inventory] -m [module] -a "[arguments]"
```

## Common flags

| Flag  | Meaning                          | Example                     |
|-------|----------------------------------|-----------------------------|
| `-i`  | Inventory file path              | `-i inventory.ini`          |
| `-m`  | Module to use (default: command) | `-m setup`                  |
| `-a`  | Arguments to the module          | `-a "hostname"`             |
| `-b`  | Become (sudo)                    | `-b -m yum -a "name=ntp"`   |
| `-f`  | Forks/parallelism (default 5)    | `-f 10`                     |
| `--limit` | Run on a subset of hosts     | `--limit 192.168.60.4`      |

## Key examples

| What                          | Command                                                     |
|-------------------------------|-------------------------------------------------------------|
| Check hostname                | `ansible multi -i inventory -a "hostname"`                  |
| Check memory                  | `ansible multi -i inventory -a "free -h"`                   |
| Gather system facts (db only) | `ansible db -i inventory -m setup`                          |
| Install package               | `ansible multi -i inventory -b -m yum -a "name=ntp state=present"` |
| Start service                 | `ansible multi -i inventory -b -m service -a "name=ntpd state=started enabled=yes"` |

## SSH & connectivity

On first connection to new VMs, Ansible fails without `host_key_checking = False`:

```
ssh_askpass: exec(/usr/bin/ssh-askpass): No such file or directory
Host key verification failed.
```

Fix in `ansible.cfg`:
```ini
[defaults]
host_key_checking = False
```

Vagrant VMs use the insecure private key. Set it in the inventory:
```ini
[all:vars]
ansible_user=vagrant
ansible_ssh_private_key_file=~/.vagrant.d/insecure_private_key
```

## /var/log/syslog vs /var/log/messages

The tutorial uses CentOS where system logs live in `/var/log/messages`. Ubuntu uses `/var/log/syslog` instead. Running `tail /var/log/messages` on Ubuntu fails:

```
tail: cannot open '/var/log/messages' for reading: No such file or directory
```

Always check the OS before hardcoding log paths.

## Targeting

| Target | Runs on                        |
|--------|--------------------------------|
| `app`  | app1, app2                     |
| `db`   | db                             |
| `multi`| app1, app2, db (group of groups) |

## Best practices

- **Prefer official modules** (`yum`, `apt`, `service`, `copy`) over
  raw shell commands -- they're idempotent (safe to run repeatedly).
  See [(0:53:11)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=3191).
- Use `--limit` to test a command on a single host first.
- Ad-hoc is handy, but **playbooks** are the standard for repeatable,
  auditable automation [(0:37:14)](https://www.youtube.com/live/7kVfqmGtDL8?si=gLmq7HbYdjqJyoqE&t=2234).
