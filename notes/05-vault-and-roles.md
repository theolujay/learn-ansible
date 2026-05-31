# Ansible Vault & Roles — Ansible 101 (Jeff Geerling)

Video: [Ansible 101 - Episode 6](https://www.youtube.com/watch?v=JFweg2dUvqM)

## Ansible Vault [(10:51)](https://youtu.be/JFweg2dUvqM?t=651)

Encrypts sensitive data (passwords, API keys) so they can be safely stored in version control.

- **`ansible-vault encrypt <file>`** — encrypt an existing file
- **`ansible-vault decrypt <file>`** — permanently decrypt
- **`ansible-vault edit <file>`** — edit without permanently decrypting
- **`ansible-vault rekey`** — change the encryption password
- **`--ask-vault-pass`** — prompt for password at runtime
- **`--vault-password-file`** — use a local text file with the password (for automation)

## Conditionals and tags [(21:33)](https://youtu.be/JFweg2dUvqM?t=1293)

- **`when:`** — conditional execution based on variables or facts
```yaml
- name: Run if RedHat
  command: /bin/false
  when: ansible_os_family == "RedHat"
```
- **`tags:`** — run subsets of tasks
```yaml
- name: API Task
  debug:
    msg: "Configuring API"
  tags: [api]
```
Run tagged tasks: `ansible-playbook main.yml --tags "api"`

## Blocks [(25:54)](https://youtu.be/JFweg2dUvqM?t=1554)

Group tasks with try/except/always-style error handling:

```yaml
- block:
    - debug: msg="This runs first"
  rescue:
    - debug: msg="Runs if block fails"
  always:
    - debug: msg="Always runs"
```

## Includes and imports [(30:05)](https://youtu.be/JFweg2dUvqM?t=1805)

| Directive | Type | When processed |
|-----------|------|----------------|
| `import_tasks` | Static | Playbook parse time (default preference) |
| `include_tasks` | Dynamic | Runtime (use if task depends on runtime vars) |
| `import_playbook` | Static | Include entire external playbooks |

**Caution** [(35:13)](https://youtu.be/JFweg2dUvqM?t=2113): Dynamic tasks with `include_tasks` can't use `tags` or `notify` the same way — prefer `import_tasks` unless you need runtime variables.

## Roles [(46:06)](https://youtu.be/JFweg2dUvqM?t=2766)

Standard directory structure for reusable automation:

```
roles/
└── <role_name>/
    ├── tasks/main.yml     # Entry point for tasks
    ├── handlers/main.yml  # Restart tasks
    ├── vars/main.yml      # Hardcoded variables
    ├── defaults/main.yml  # Default variables (easily overridden)
    └── meta/main.yml      # Role metadata and dependencies
```

Include in a playbook:

```yaml
- hosts: all
  roles:
    - nodejs
```

- Roles are searched in `roles/` relative to the playbook or system paths.
- `ansible-galaxy init <role_name>` generates the boilerplate structure.
