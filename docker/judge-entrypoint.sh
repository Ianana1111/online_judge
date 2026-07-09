#!/bin/sh
# Sets up cgroup v2 delegation for `isolate` and then execs the judge worker.
#
# isolate's default config expects a systemd-managed cgroup handed to it via
# /run/isolate/cgroup (written by the isolate-cg-keeper daemon). We don't run
# systemd in this container, so instead we point isolate at a plain cgroup
# subtree we delegate to ourselves on every start (cgroup state doesn't
# persist across container restarts, so this must run each time, not just at
# image build time).
set -e

CG_ROOT=/sys/fs/cgroup/isolate

# The container's own root cgroup normally already contains this process (and
# its siblings) as direct members. cgroup v2 refuses to enable controllers in
# cgroup.subtree_control while a cgroup has member processes of its own (the
# "no internal process" constraint) — so first relocate everything running
# here into a sibling leaf cgroup, then enable delegation at the root.
if [ -w /sys/fs/cgroup/cgroup.subtree_control ]; then
  mkdir -p /sys/fs/cgroup/leaf
  for p in $(cat /sys/fs/cgroup/cgroup.procs 2>/dev/null || true); do
    echo "$p" > /sys/fs/cgroup/leaf/cgroup.procs 2>/dev/null || true
  done
  echo "+cpuset +cpu +io +memory +pids" > /sys/fs/cgroup/cgroup.subtree_control 2>/dev/null || true
fi

mkdir -p "$CG_ROOT"
echo "+cpuset +cpu +io +memory +pids" > "$CG_ROOT/cgroup.subtree_control" 2>/dev/null || true

exec "$@"
