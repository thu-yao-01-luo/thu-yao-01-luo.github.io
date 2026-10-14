#!/usr/bin/env python3

import argparse
from datetime import date
from hashlib import sha256
from html import escape, unescape
import json
from pathlib import Path
import re


RUNTIME_FILES = (
    "index.html",
    "styles.css",
    "elr-explorer.css",
    "cma-setup.css",
    "data.js",
    "app.js",
    "elr-explorer.js",
    "cma-setup.js",
    "assets/fonts/LinuxBiolinum-LICENSE.txt",
)
ASSET_PATTERN = re.compile(r"assets/[A-Za-z0-9_./-]+\.(?:svg|png|jpg|jpeg|webp|gif|woff2|pdf)")
NAVIGATION_CSS = """.homepage-breadcrumbs { display: flex; align-items: center; gap: .6rem; min-width: 0; font-size: .875rem; }
.homepage-breadcrumbs a { color: var(--muted); text-decoration: none; white-space: nowrap; }
.homepage-breadcrumbs a:hover { color: var(--link); text-decoration: underline; }
.homepage-breadcrumbs > span { color: var(--muted); }
@media (max-width: 600px) {
  .homepage-breadcrumbs .site-title, .homepage-breadcrumbs__separator { display: none; }
  .header-compact .homepage-breadcrumbs { display: none; }
}
"""


def collect_snapshot(source):
    snapshot = {}
    pending = set(RUNTIME_FILES)
    while pending:
        name = pending.pop()
        relative = Path(name)
        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError(f"Unsafe asset path: {name}")
        file = (source / relative).resolve()
        if not file.is_relative_to(source):
            raise ValueError(f"Asset is outside the source blog: {name}")
        content = file.read_bytes()
        snapshot[name] = content
        if file.suffix in (".html", ".css", ".js", ".svg"):
            for asset in ASSET_PATTERN.findall(content.decode("utf-8")):
                if asset not in snapshot:
                    pending.add(asset)
    for name, content in snapshot.items():
        if (source / name).read_bytes() != content:
            raise RuntimeError("The source blog changed during import. Retry after its build finishes.")
    return snapshot


def integrate_navigation(content, site_url):
    title_pattern = r'<a class="site-title" href="#intro">.*?</a>'
    title = re.search(title_pattern, content)
    if not title:
        raise ValueError("The source blog header changed; review the navigation integration before importing.")
    navigation = (
        '<nav class="homepage-breadcrumbs" aria-label="Website navigation">'
        '<a href="../../">Kairong Luo</a><span aria-hidden="true">/</span>'
        '<a href="../">Blog</a><span class="homepage-breadcrumbs__separator" aria-hidden="true">/</span>'
        + title.group() + '</nav>'
    )
    content = content[:title.start()] + navigation + content[title.end():]
    canonical = escape(site_url.rstrip("/") + "/blog/prom-technical-report/", quote=True)
    additions = (
        '  <link rel="stylesheet" href="homepage.css">\n'
        '  <link rel="icon" type="image/svg+xml" href="../../images/favicon.svg">\n'
        f'  <link rel="canonical" href="{canonical}">\n'
        f'  <meta property="og:url" content="{canonical}">\n'
    )
    if content.count("</head>") != 1:
        raise ValueError("The source blog must contain exactly one document head.")
    return content.replace("</head>", additions + "</head>", 1)


def update_post_titles(content, snapshot):
    heading = re.search(
        r'<h1\b[^>]*>\s*<span\b[^>]*\bdata-copy="([^"]+)"',
        snapshot["index.html"].decode("utf-8"),
    )
    frontmatter = re.match(r"\A---\n(.*?)\n---\n", content, re.DOTALL)
    if not heading or not frontmatter:
        raise ValueError("The article heading or post metadata changed; review title synchronization.")
    data_script = snapshot["data.js"].decode("utf-8").strip()
    translations = json.loads(data_script.removeprefix("window.PURO_DATA = ").removesuffix(";"))
    metadata = frontmatter.group(1)
    for field, language in (("title", "en"), ("title_zh", "zh")):
        markup = translations.get(language, {}).get(heading.group(1))
        if not isinstance(markup, str):
            raise ValueError(f"Missing {language} article title in the generated blog.")
        title = " ".join(unescape(re.sub(r"<[^>]*>", "", markup)).split())
        if not title:
            raise ValueError(f"Empty {language} article title in the generated blog.")
        metadata, replacements = re.subn(
            rf"^{field}:[^\n]*$",
            lambda match: f"{field}: {json.dumps(title, ensure_ascii=False)}",
            metadata,
            flags=re.MULTILINE,
        )
        if replacements != 1:
            raise ValueError(f"Expected exactly one {field} field in the blog post metadata.")
    return content[:frontmatter.start(1)] + metadata + content[frontmatter.end(1):]


def find_stale_imports(destination, previous_hashes, imported_names):
    stale_files = []
    for name in sorted(previous_hashes.keys() - imported_names):
        target = destination / name
        if not target.resolve().is_relative_to(destination.resolve()):
            raise ValueError(f"Unsafe previous import path: {name}")
        if not target.exists():
            continue
        if not target.is_file() or sha256(target.read_bytes()).hexdigest() != previous_hashes[name]:
            raise ValueError(f"An obsolete imported file has local changes; review it before syncing: {name}")
        stale_files.append(target)
    return stale_files


def main():
    parser = argparse.ArgumentParser(description="Import only the public runtime of the Puro-2B blog.")
    parser.add_argument("source", type=Path, help="Path to Prom-Technical-Report/blog")
    parser.add_argument("--site-url", default="https://kairong.me")
    parser.add_argument("--noto-license", type=Path, default=Path("/usr/share/doc/fonts-noto-cjk/copyright"))
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    project = Path(__file__).resolve().parents[1]
    destination = project / "blog" / "prom-technical-report"
    snapshot = collect_snapshot(source)
    post_path = project / "_posts" / "2026-10-14-puro-2b.md"
    post_content = update_post_titles(post_path.read_text(encoding="utf-8"), snapshot)
    imported = dict(snapshot)
    imported["index.html"] = integrate_navigation(snapshot["index.html"].decode("utf-8"), args.site_url).encode("utf-8")
    imported["homepage.css"] = NAVIGATION_CSS.encode("utf-8")
    license_path = args.noto_license
    if not license_path.is_file():
        license_path = destination / "assets/fonts/NotoSansCJK-LICENSE.txt"
    imported["assets/fonts/NotoSansCJK-LICENSE.txt"] = license_path.read_bytes()
    manifest_path = project / "_data" / "prom_blog_import.json"
    previous_hashes = {}
    if manifest_path.is_file():
        previous_hashes = json.loads(manifest_path.read_text(encoding="utf-8")).get("imported_sha256", {})
    stale_files = find_stale_imports(destination, previous_hashes, imported.keys())
    manifest = {
        "source_project": "Prom-Technical-Report/blog",
        "imported_on": date.today().isoformat(),
        "article_url": "/blog/prom-technical-report/",
        "source_sha256": {name: sha256(content).hexdigest() for name, content in sorted(snapshot.items())},
        "imported_sha256": {name: sha256(content).hexdigest() for name, content in sorted(imported.items())},
    }
    for name, content in imported.items():
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_name(target.name + ".import-tmp")
        temporary.write_bytes(content)
        temporary.replace(target)
    for target in stale_files:
        target.unlink()
    temporary_post = post_path.with_name(post_path.name + ".import-tmp")
    temporary_post.write_text(post_content, encoding="utf-8")
    temporary_post.replace(post_path)
    temporary_manifest = manifest_path.with_name(manifest_path.name + ".import-tmp")
    temporary_manifest.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    temporary_manifest.replace(manifest_path)
    print(f"Imported {len(imported)} public files ({sum(map(len, imported.values())) / 1024 / 1024:.2f} MiB).")
    if stale_files:
        print(f"Removed {len(stale_files)} obsolete files from the previous import.")
    print("Post titles refreshed from the generated Chinese and English article headings.")
    print("Article: /blog/prom-technical-report/")
    print("Original source is unchanged. Rebuild the homepage to refresh its preview.")


if __name__ == "__main__":
    main()
