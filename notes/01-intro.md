# Ansible 101 -- Episode 1: Introduction

Playlist: https://youtube.com/playlist?list=PL2_OBreMn7FqZkvMYt6ATmgC0KAGGJNAN

## What is Ansible? [(7:51)](https://youtu.be/5J8kMEnLBEo?t=471)

- Configuration management tool -- clear, fast, efficient, secure
- Replaces manual server admin and complex shell scripts
- Name from Ender's Game (fictional communication device)
- Acquired by Red Hat in 2015
- DevOps philosophy: bridges dev and operations, not just a job title

## How Ansible works [(25:49)](https://youtu.be/5J8kMEnLBEo?t=1549)

- **Agentless** -- no daemon or agent on target servers, connects via SSH
- **Push model** -- pushes configs from control node to managed servers
- **Requirement** -- managed servers only need Python to run modules

## Installation [(17:43)](https://youtu.be/5J8kMEnLBEo?t=1063)

```
pip3 install ansible
ansible --version
```

## Inventory basics [(23:23)](https://youtu.be/5J8kMEnLBEo?t=1403)

INI-style file listing managed hosts in groups:

```ini
[example]
192.168.1.1
```

## ansible.cfg [(26:50)](https://youtu.be/5J8kMEnLBEo?t=1610)

Overrides defaults -- most commonly the inventory path:

```ini
[defaults]
inventory = inventory
```

## Ad-hoc command syntax [(28:57)](https://youtu.be/5J8kMEnLBEo?t=1737)

```
ansible [group] -m [module] -a [arguments]
```

Examples:
- `ansible example -m ping -u centos` -- ping servers as centos user
- `ansible example -a "free -h"` -- check memory (defaults to command module)

## CentOS 7 gotchas (from practice)

The tutorial uses CentOS 7, but it is **EOL since June 2024**. Key issues:

- **`mirrorlist.centos.org` no longer resolves** -- `yum install` fails on guests.
- **Python 2 only** -- Modern Ansible generates Python 3 code with type annotations. Python 2 crashes on `zip_data: str` syntax errors.
- **Fix:** Use `bento/ubuntu-24.04` box + `apt` module + `service` with Ubuntu service names.

In the Vagrantfile, you must install Python 3 **before** the Ansible provisioner runs:

```ruby
config.vm.provision "shell", inline: "yum install -y python3"
config.vm.provision "ansible" do |ansible|
  ansible.playbook = "playbook.yml"
  ansible.extra_vars = {
    ansible_python_interpreter: "/usr/bin/python3"
  }
end
```

The shell provisioner must be at the top level of `config`, not nested inside the ansible block.

## Ansible version compatibility

Ansible 2.9 (used in the tutorial) **does not run on Python 3.13+**. The old `six.moves` compatibility shim is missing, causing:

```
ModuleNotFoundError: No module named 'ansible.module_utils.six.moves'
```

Use a modern version with Python 3.13:
```bash
uv add "ansible-core>=2.15,<2.17"
```

## Playbooks & idempotence [(45:24)](https://youtu.be/5J8kMEnLBEo?t=2724)

- **Playbooks** -- YAML files defining a sequence of tasks
- Key components: `hosts`, `become` (sudo), `tasks`
- **Idempotence** -- running a task multiple times produces the same result as once
- Prefer Ansible modules over raw shell scripts for idempotency

```yaml
- hosts: all
  become: yes
  tasks:
    - name: Ensure NTP is installed
      yum:
        name: ntp
        state: present
    - name: Ensure NTP is running
      service:
        name: ntpd
        state: started
        enabled: yes
```

## Vagrant integration [(33:36)](https://youtu.be/5J8kMEnLBEo?t=2016)

- Vagrant builds local VMs for testing Ansible configs
- `vagrant init [box]` -- initialize a Vagrant project
- `vagrant up` -- start the VM
- `vagrant provision` -- run the Ansible playbook against the VM
