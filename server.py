#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import re
import time
import threading
import subprocess
import urllib.parse

PORT = 8080
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
LETTERS_FILE = os.path.join(DATA_DIR, 'community_letters.json')
MEMORIES_FILE = os.path.join(DATA_DIR, 'custom_memories.json')
TUNNEL_FILE = os.path.join(DATA_DIR, 'public_tunnel.json')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(LETTERS_FILE):
    with open(LETTERS_FILE, 'w') as f:
        json.dump([], f)

# Global tunnel state
tunnel_state = {
    "publicUrl": None,
    "localWifiIp": "192.168.0.6",
    "port": PORT,
    "status": "starting",
    "updatedAt": time.time()
}

# Try loading existing saved tunnel URL if any
if os.path.exists(TUNNEL_FILE):
    try:
        with open(TUNNEL_FILE, 'r') as f:
            saved_tunnel = json.load(f)
            if saved_tunnel.get('publicUrl'):
                tunnel_state['publicUrl'] = saved_tunnel['publicUrl']
                tunnel_state['status'] = 'online'
    except Exception:
        pass

def save_tunnel_state(url):
    tunnel_state["publicUrl"] = url
    tunnel_state["status"] = "online"
    tunnel_state["updatedAt"] = time.time()
    try:
        with open(TUNNEL_FILE, 'w') as f:
            json.dump(tunnel_state, f, indent=2)
        print(f"\n[Tunnel] 🟢 Worldwide Public Link Active: {url}\n")
    except Exception as e:
        print(f"Error saving tunnel state: {e}")

def run_tunnel_manager():
    """Continuously runs and monitors a public HTTPS tunnel (pinggy.io with automatic reconnect)"""
    while True:
        try:
            print("[Tunnel] Starting public SSH reverse tunnel (pinggy.io)...")
            cmd = [
                "ssh",
                "-p", "443",
                "-R0:localhost:8080",
                "-o", "StrictHostKeyChecking=no",
                "-o", "ServerAliveInterval=20",
                "-o", "ServerAliveCountMax=3",
                "-o", "TCPKeepAlive=yes",
                "a.pinggy.io"
            ]
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            for line in proc.stdout:
                line_str = line.strip()
                match = re.search(r'https://[a-zA-Z0-9\.\-]+\.(?:free\.pinggy\.net|pinggy-free\.link|pinggy\.net)', line_str)
                if match:
                    public_url = match.group(0).rstrip('.')
                    save_tunnel_state(public_url)

            proc.wait()
            print("[Tunnel] Pinggy tunnel closed, restarting in 2 seconds...")
        except Exception as e:
            print(f"[Tunnel] Pinggy error: {e}")

        time.sleep(2)

def read_letters():
    try:
        if os.path.exists(LETTERS_FILE):
            with open(LETTERS_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading letters: {e}")
    return []

def save_letters(letters):
    try:
        with open(LETTERS_FILE, 'w') as f:
            json.dump(letters, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving letters: {e}")
        return False

def read_memories():
    try:
        if os.path.exists(MEMORIES_FILE):
            with open(MEMORIES_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading memories: {e}")
    return []

def save_memories(memories):
    try:
        with open(MEMORIES_FILE, 'w') as f:
            json.dump(memories, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving memories: {e}")
        return False

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable caching for real-time updates
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # 1. Letters API Endpoint
        if parsed.path == '/api/letters':
            letters = read_letters()
            body = json.dumps(letters).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # 2. Memories API Endpoint
        
        if parsed.path == '/api/sync_state':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                dump = json.loads(post_data.decode('utf-8'))
                with open(os.path.join(DATA_DIR, 'local_storage_dump.json'), 'w') as f:
                    json.dump(dump, f, indent=2)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"success": true}')
                return
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                return

        if parsed.path == '/api/memories':
            memories = read_memories()
            body = json.dumps(memories).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # 3. Public Tunnel Info Endpoint
        if parsed.path == '/api/tunnel':
            body = json.dumps(tunnel_state).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # Fallback to serving static files
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/letters':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                letter_payload = json.loads(post_data.decode('utf-8'))
                letters = read_letters()
                letter_id = letter_payload.get('id') or f"let-user-{int(time.time() * 1000)}"
                letter_payload['id'] = letter_id

                # Update existing or prepend new
                existing_idx = next((i for i, l in enumerate(letters) if l.get('id') == letter_id), -1)
                if existing_idx >= 0:
                    letters[existing_idx] = letter_payload
                else:
                    letters.insert(0, letter_payload)

                save_letters(letters)

                response_body = json.dumps(letter_payload).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_body)))
                self.end_headers()
                self.wfile.write(response_body)
                return
            except Exception as e:
                err_body = json.dumps({"error": str(e)}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
                return

        
        if parsed.path == '/api/sync_state':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                dump = json.loads(post_data.decode('utf-8'))
                with open(os.path.join(DATA_DIR, 'local_storage_dump.json'), 'w') as f:
                    json.dump(dump, f, indent=2)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"success": true}')
                return
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                return

        if parsed.path == '/api/memories':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                memory_payload = json.loads(post_data.decode('utf-8'))
                memories = read_memories()
                memory_id = memory_payload.get('id') or f"mem-{int(time.time() * 1000)}"
                memory_payload['id'] = memory_id

                existing_idx = next((i for i, m in enumerate(memories) if m.get('id') == memory_id), -1)
                if existing_idx >= 0:
                    memories[existing_idx] = memory_payload
                else:
                    memories.insert(0, memory_payload)

                save_memories(memories)

                response_body = json.dumps(memory_payload).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_body)))
                self.end_headers()
                self.wfile.write(response_body)
                return
            except Exception as e:
                err_body = json.dumps({"error": str(e)}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
                return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api/letters'):
            query = urllib.parse.parse_qs(parsed.query)
            letter_id = query.get('id', [None])[0]

            # Also support /api/letters/<id>
            if not letter_id:
                parts = parsed.path.strip('/').split('/')
                if len(parts) > 2:
                    letter_id = parts[2]

            if letter_id:
                letters = read_letters()
                filtered = [l for l in letters if l.get('id') != letter_id]
                save_letters(filtered)

                response_body = json.dumps({"success": True, "deletedId": letter_id}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_body)))
                self.end_headers()
                self.wfile.write(response_body)
                return
            else:
                err_body = json.dumps({"error": "Missing letter id"}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
                return

        if parsed.path.startswith('/api/memories'):
            query = urllib.parse.parse_qs(parsed.query)
            memory_id = query.get('id', [None])[0]

            if not memory_id:
                parts = parsed.path.strip('/').split('/')
                if len(parts) > 2:
                    memory_id = parts[2]

            if memory_id:
                memories = read_memories()
                filtered = [m for m in memories if m.get('id') != memory_id]
                save_memories(filtered)

                response_body = json.dumps({"success": True, "deletedId": memory_id}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_body)))
                self.end_headers()
                self.wfile.write(response_body)
                return
            else:
                err_body = json.dumps({"error": "Missing memory id"}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
                return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    # Start the tunnel manager thread in background
    tunnel_thread = threading.Thread(target=run_tunnel_manager, daemon=True)
    tunnel_thread.start()

    # Bind to 0.0.0.0 so local network & tunnels can connect
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
        print(f"Serving at http://0.0.0.0:{PORT} with API persistence enabled")
        httpd.serve_forever()
