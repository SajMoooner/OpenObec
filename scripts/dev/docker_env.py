#!/usr/bin/env python3
"""Use public-image credentials only for this local project's Docker subprocesses."""
import json
import os
from pathlib import Path
import subprocess
import sys


def environment():
    result = os.environ.copy()
    result['OPENOBEC_DOCKER_ENV_READY'] = '1'
    if result.get('DOCKER_CONFIG'):
        return result
    host = result.get('DOCKER_HOST')
    if not host:
        try:
            host = subprocess.check_output(['docker', 'context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'], text=True, stderr=subprocess.DEVNULL).strip()
        except (OSError, subprocess.CalledProcessError):
            return result
    # Local Unix engines do not require TLS context material. Preserve remote
    # contexts and any explicitly supplied Docker configuration unchanged.
    if host.startswith('unix://'):
        directory = Path(__file__).resolve().parents[2] / '.run/docker-public'
        directory.mkdir(parents=True, exist_ok=True)
        # Docker Desktop installs Compose/Buildx under its configuration path.
        # Retain those public plugin locations without copying credentials.
        plugins = subprocess.run(['docker', 'info', '--format', '{{json .ClientInfo.Plugins}}'], capture_output=True, text=True)
        try:
            plugin_dirs = sorted({str(Path(plugin['Path']).parent) for plugin in json.loads(plugins.stdout) if plugin.get('Path')})
        except (ValueError, TypeError):
            plugin_dirs = []
        config = {'auths': {}, 'cliPluginsExtraDirs': plugin_dirs}
        (directory / 'config.json').write_text(json.dumps(config) + '\n')
        result['DOCKER_CONFIG'] = str(directory)
        result['DOCKER_HOST'] = host
    return result


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Pass the command to execute with the local Docker environment.')
    os.execvpe(sys.argv[1], sys.argv[1:], environment())
