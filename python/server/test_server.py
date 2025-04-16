from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class SimpleHandler(BaseHTTPRequestHandler):
    def _set_headers(self, content_type="application/json"):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
        
    def do_GET(self):
        self._set_headers()
        
        response = {"message": "API server is running"}
        
        if self.path == "/api/videos":
            response = [
                {"id": "1", "title": "测试视频1", "url": "https://example.com/video1.mp4"}, 
                {"id": "2", "title": "测试视频2", "url": "https://example.com/video2.mp4"}
            ]
            
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        self._set_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
            
        response = {"message": "Unknown request"}
        
        if self.path == "/api/login":
            response = {"token": "fake-token", "message": "登录成功"}
        elif self.path == "/api/register":
            response = {"token": "fake-token", "message": "注册成功"}
            
        self.wfile.write(json.dumps(response).encode())

def run(server_class=HTTPServer, handler_class=SimpleHandler, port=8081):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting HTTP server on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
