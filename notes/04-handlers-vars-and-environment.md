# Handlers, Environment Variables & Variables — Ansible 101 (Jeff Geerling)

Video: [Ansible 101 - Episode 5](https://www.youtube.com/watch?v=HU-dkXBCPdU)

## Playbook handlers [(11:33)](https://youtu.be/HU-dkXBCPdU?t=693)

Handlers are tasks that run only when notified by another task (on change).

- **`notify`** triggers a handler by name when a task reports `changed`. If the task is `ok`, the handler doesn't run.
- **Execution:** Handlers run once, at the end of the play.
- **`meta: flush_handlers`** — runs handlers immediately, before subsequent tasks.
- **`--force-handlers`** — runs handlers even if the play fails midway.
- **Chaining:** Handlers can notify other handlers.

```yaml
handlers:
  - name: restart apache
    service:
      name: apache2
      state: restarted

tasks:
  - name: Copy config
    copy:
      src: test.conf
      dest: /etc/apache2/
    notify: restart apache
```

## Environment variables [(23:45)](https://youtu.be/HU-dkXBCPdU?t=1425)

- **Task/play level:** Use the `environment` keyword for specific tasks or the entire play (e.g. setting `http_proxy` for a download).
- **Persistent shell vars:** Use `lineinfile` to add to `.bash_profile` or `.profile`.

```yaml
- name: Download file with proxy
  get_url:
    url: http://example.com/file
    dest: /tmp/
  environment:
    http_proxy: http://proxy.example.com:80
```

## Dynamic variable files for multi-OS [(35:43)](https://youtu.be/HU-dkXBCPdU?t=2143)

Avoid hardcoding OS-specific values. Use `include_vars` with `with_first_found`:

```yaml
- name: Load OS-specific vars
  include_vars: "{{ item }}"
  with_first_found:
    - "vars/{{ ansible_os_family }}.yml"
    - "vars/default.yml"
```

Structure: `vars/Debian.yml` (catches Ubuntu), `vars/RedHat.yml`, `vars/default.yml`.

## Ansible facts & setup module [(48:40)](https://youtu.be/HU-dkXBCPdU?t=2920)

Facts are system properties gathered automatically (default: `gather_facts: yes`).

- List all facts: `ansible host -m setup`
- Common facts: `ansible_os_family` (Debian), `ansible_distribution` (Ubuntu), `ansible_distribution_version` (24.04), `ansible_memtotal_mb`, `ansible_fqdn`

## Registered variables [(50:48)](https://youtu.be/HU-dkXBCPdU?t=3048)

Capture task output into a variable with `register`:

```yaml
- name: Check something
  shell: echo "hello"
  register: my_output

- debug:
    msg: "{{ my_output.stdout }}"
```

Access subfields with `.` notation: `my_output.stdout`, `my_output.rc`.

## Facter and Ohai [(54:56)](https://youtu.be/HU-dkXBCPdU?t=3296)

If **Facter** (Puppet) or **Ohai** (Chef) are installed on the target, Ansible automatically merges their data into facts, prefixed with `facter_` or `ohai_`.
