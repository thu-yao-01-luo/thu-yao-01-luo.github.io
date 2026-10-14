#!/usr/bin/env python3

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        original_path = self.path
        request_url = urlsplit(self.path)
        requested_file = Path(self.translate_path(request_url.path))
        if not requested_file.exists() and not requested_file.suffix:
            if requested_file.with_suffix(".html").is_file():
                self.path = urlunsplit(request_url._replace(path=request_url.path + ".html"))
        try:
            return super().send_head()
        finally:
            self.path = original_path

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description="Preview the built site without taking an existing port.")
    parser.add_argument("--port", type=int, default=0, help="Port number; 0 lets the OS allocate a free port.")
    args = parser.parse_args()
    directory = Path(__file__).resolve().parents[1] / "_site"
    if not (directory / "index.html").is_file():
        parser.error("Build the site first with: bundle exec jekyll build")
    handler = partial(PreviewHandler, directory=str(directory))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Preview: http://127.0.0.1:{server.server_port}/", flush=True)
        print("Only _site is served. Press Ctrl+C to stop this preview.", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
