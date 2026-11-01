import importlib.util
import json
import os
from pathlib import Path
import signal
import socket
import tempfile
import time
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('openobec_stack',ROOT/'scripts/dev/stack.py')
stack=importlib.util.module_from_spec(spec);spec.loader.exec_module(stack)

class ProcessLifecycleTest(unittest.TestCase):
 def test_renamed_node_process_is_stopped_and_releases_its_port(self):
  with socket.socket()as probe:
   probe.bind(('127.0.0.1',0));port=probe.getsockname()[1]
  with tempfile.TemporaryDirectory(prefix='openobec-process-')as directory:
   run=Path(directory)
   with patch.object(stack,'RUN',run),patch.object(stack,'MANIFEST',run/'processes.json'),patch.dict(stack.PORTS,{'probe':port}):
    body=f"process.title='next-server (OpenObec lifecycle test)';require('node:http').createServer((q,r)=>r.end('ready')).listen({port},'127.0.0.1');"
    stack.start('probe',['node','-e',body],os.environ.copy());row=json.loads(stack.MANIFEST.read_text())['probe']
    try:
     deadline=time.monotonic()+5
     while time.monotonic()<deadline:
      with socket.socket()as client:
       if client.connect_ex(('127.0.0.1',port))==0:break
      time.sleep(.05)
     self.assertTrue(stack.owned_process(row),'A title change must not orphan a process launched by this stack')
     stack.stop_manual()
     with socket.socket()as client:self.assertNotEqual(client.connect_ex(('127.0.0.1',port)),0)
     self.assertFalse(stack.MANIFEST.exists())
    finally:
     try:os.killpg(row['pid'],signal.SIGTERM)
     except ProcessLookupError:pass

if __name__=='__main__':unittest.main()

class ReusablePortTest(unittest.TestCase):
 def test_closed_reusable_listener_does_not_block_immediate_restart(self):
  listener=socket.socket();listener.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);listener.bind(('127.0.0.1',0));port=listener.getsockname()[1];listener.listen()
  client=socket.create_connection(('127.0.0.1',port));server,_=listener.accept();listener.close();server.shutdown(socket.SHUT_WR);client.recv(1);client.close();server.close()
  with tempfile.TemporaryDirectory(prefix='openobec-port-')as directory:
   with patch.object(stack,'MANIFEST',Path(directory)/'processes.json'),patch.dict(stack.PORTS,{'probe':port},clear=True):
    stack.preflight('manual')
