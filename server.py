from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen
import ssl

HOST = "localhost"
PORT = 8443

PULSESYNC_URL = "http://127.0.0.1:2007/get_track"

CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):

        # Главная страница и index.html
        if self.path == "/" or self.path == "/index.html":
            self.send_file(
                "index.html",
                "text/html; charset=utf-8"
            )
            return

        # Данные текущего трека
        if self.path == "/track":

            try:
                request = Request(
                    PULSESYNC_URL,
                    headers={
                        "Accept": "*/*"
                    }
                )

                with urlopen(request, timeout=3) as response:
                    data = response.read()

                self.send_response(200)
                self.send_header(
                    "Content-Type",
                    "application/json; charset=utf-8"
                )
                self.send_header(
                    "Cache-Control",
                    "no-store"
                )
                self.send_header(
                    "Access-Control-Allow-Origin",
                    "*"
                )
                self.end_headers()

                self.wfile.write(data)

            except Exception as error:

                message = (
                    '{"track":null,"error":"'
                    + str(error).replace('"', '\\"')
                    + '"}'
                ).encode("utf-8")

                self.send_response(502)
                self.send_header(
                    "Content-Type",
                    "application/json; charset=utf-8"
                )
                self.end_headers()

                self.wfile.write(message)

            return

        # Всё остальное
        self.send_response(404)
        self.end_headers()

    def send_file(self, filename, content_type):

        try:

            with open(filename, "rb") as file:
                data = file.read()

            self.send_response(200)
            self.send_header(
                "Content-Type",
                content_type
            )
            self.send_header(
                "Content-Length",
                str(len(data))
            )
            self.end_headers()

            self.wfile.write(data)

        except FileNotFoundError:

            self.send_response(404)
            self.end_headers()

            self.wfile.write(
                b"index.html not found"
            )


server = ThreadingHTTPServer(
    (HOST, PORT),
    Handler
)

context = ssl.SSLContext(
    ssl.PROTOCOL_TLS_SERVER
)

context.load_cert_chain(
    certfile=CERT_FILE,
    keyfile=KEY_FILE
)

server.socket = context.wrap_socket(
    server.socket,
    server_side=True
)

print()
print("======================================")
print(" PulseSync Twitch Overlay")
print("======================================")
print()
print(f"HTTPS server: https://{HOST}:{PORT}/")
print()
print("Остановка: Ctrl+C")
print()

server.serve_forever()