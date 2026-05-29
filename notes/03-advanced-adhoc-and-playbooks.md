# Advanced Ad-Hoc Commands & Playbook Fundamentals

## Asynchronous tasks [(12:47)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=767)

For long-running commands that would otherwise timeout:

```
ansible [group] -B [seconds] -P [poll_interval] -a '[command]'
```

| Flag | Meaning |
|------|---------|
| `-B` | Background -- max time (seconds) to let the job run |
| `-P` | Polling interval -- how often to check status (`-P 0` = fire-and-forget) |

**async_status module** -- check a background job's progress:

```
ansible [group] -m async_status -a 'jid=[job_id]'
```

> **Gotcha**: `async_status` requires key=value syntax (`jid=...`). Passing the job ID as a raw param (`-a "j651725469135.3396"`) fails because async_status does not support raw params.

Once the job finishes, re-running async_status returns the full command output (stdout, stderr, rc, timing):

```bash
ansible db -b -m async_status -a 'jid=j651725469135.3533'
# Returns CHANGED with stdout/stdout_lines once complete
```

Real example:

```bash
# Fire-and-forget: run apt update in background, never poll
ansible multi -b -B 3600 -P 0 -a "apt update -y"

# Check status later by job ID
ansible db -b -m async_status -a "jid=j651725469135.3533"
```

## Shell vs Command module [(19:02)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=1142)

| Module | Supports pipes/redirects? | Use case |
|--------|--------------------------|----------|
| `command` (default) | No | Simple commands, no shell interpretation |
| `shell` | Yes | Pipes (`\|`), redirects (`>`), env vars |

Examples:

```bash
# FAILS -- command module cannot use pipes
ansible multi -b -a "tail /var/log/syslog | grep ansible | wc -l"

# WORKS -- shell module handles pipes/redirects
ansible multi -b -m shell -a "tail /var/log/syslog | grep ansible | wc -l"
```

> **Note**: Ubuntu nodes use `/var/log/syslog` (not `/var/log/messages` which is typical on RHEL). The command module treats the entire string as the executable name, so shell metacharacters like `|` break it.

## Additional modules [(20:00)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=1200)

**cron** -- manage scheduled jobs:

```
-m cron -a 'name=[job_name] minute=[val] job=[path_to_script]'
```

**git** -- clone/update repos:

```
-m git -a 'repo=[URL] dest=[path] update=yes version=[tag]'
```

**file** -- manage files, directories, and symlinks:

```yaml
- name: Enable virtual host
  file:
    src: /etc/apache2/sites-available/default.conf
    dest: /etc/apache2/sites-enabled/default.conf
    state: link
```

- `state: link` creates a symlink at `dest` pointing to `src`
- The `a2ensite` command on Ubuntu does the same thing

**copy** -- with `with_items` for multiple files:

```yaml
- name: Copy configuration files
  copy:
    src: "{{ item.src }}"
    dest: "{{ item.dest }}"
    mode: 0644
  with_items:
    - src: apache2.conf
      dest: /etc/apache2/apache2.conf
    - src: vhosts.conf
      dest: /etc/apache2/sites-available/default.conf
  notify: Restart Apache
```

## Playbook fundamentals [(24:38)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=1478)

- YAML-based, version-controllable, idempotent
- Structure: `---`, `hosts:`, `become:`, `tasks:`

Basic skeleton:

```yaml
---
- name: Description
  hosts: group_name
  become: true
  tasks:
    - name: Task description
      module_name:
        key: value
```
- **Jinja2 templating** -- `{{ variable }}` for dynamic values [(46:14)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=2774)
- **Loops** -- `with_items` to iterate over a list [(44:26)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=2666)
- **Handlers** -- tasks that run only when notified (triggered via `notify:`), and only once at the end of the play. Classic use case: restart a service when its config changes.

Handlers must be defined under a `handlers:` block and referenced by name:

```yaml
handlers:
  - name: Restart Apache
    service:
      name: apache2
      state: restarted

tasks:
  - name: Copy Apache config
    copy:
      src: apache2.conf
      dest: /etc/apache2/apache2.conf
    notify: Restart Apache  # only queues if copy actually changed something
```

If no task triggers the handler, it never runs. If multiple tasks trigger it, it runs once.

Key flags:
- `-b` / `--become` -- run as root
- `--limit` -- restrict to specific hosts [(56:24)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=3384)

## Performance tip [(22:15)](https://www.youtube.com/live/WNmKjtWtqIc?si=q4dLJBPh2EH7ttLD&t=1335)

In `ansible.cfg`, enable SSH pipelining to reuse connections:

```ini
[ssh_connection]
pipelining = true
```
