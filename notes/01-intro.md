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
