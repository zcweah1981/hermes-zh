#!/usr/bin/env python3
"""Submit up to 10 Hermes Chinese site URLs to Baidu URL Push API.

Secrets are loaded from environment variables first. Optionally set
HERMES_ZH_ENV_FILE to point at a local env file; the committed default path is
only a location contract and never contains secret values in source control.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
from typing import Any, Iterable

import requests

PROJECT_ROOT = Path(os.environ.get("HERMES_ZH_PROJECT_ROOT", "/opt/projects/hermes-zh"))
CONTENT_CACHE = PROJECT_ROOT / "content-cache"
ROUTES_MANIFEST = CONTENT_CACHE / "generated" / "routes-manifest.json"
SECRETS_FILE = Path(os.environ.get("HERMES_ZH_ENV_FILE", "/root/.hermes/secrets/hermes-zh-v3.env"))

URL_POOL_FILE = CONTENT_CACHE / "baidu-url-pool.json"
HISTORY_FILE = CONTENT_CACHE / "baidu-submit-history.jsonl"
RETRY_QUEUE_FILE = CONTENT_CACHE / "baidu-retry-queue.json"
DAILY_LIMIT = 10


def load_env_file() -> None:
    if not SECRETS_FILE.exists():
        return

    for raw_line in SECRETS_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def base_url() -> str:
    return os.environ.get("BAIDU_SITE", "https://hermes-zh.com").rstrip("/")


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def load_manifest() -> list[dict[str, Any]]:
    data = load_json(ROUTES_MANIFEST, [])
    return data if isinstance(data, list) else []


def load_history() -> set[str]:
    submitted: set[str] = set()
    if not HISTORY_FILE.exists():
        return submitted

    for line in HISTORY_FILE.read_text(encoding="utf-8").splitlines():
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        if entry.get("success"):
            submitted.update(entry.get("urls", []))
    return submitted


def load_retry_queue() -> list[str]:
    data = load_json(RETRY_QUEUE_FILE, [])
    return [item for item in data if isinstance(item, str)] if isinstance(data, list) else []


def save_retry_queue(queue: Iterable[str]) -> None:
    RETRY_QUEUE_FILE.write_text(json.dumps(sorted(set(queue)), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def log_history(urls: list[str], success: bool, response: dict[str, Any]) -> None:
    entry = {
        "timestamp": dt.datetime.now(dt.UTC).isoformat(),
        "urls": urls,
        "success": success,
        "response": response,
    }
    with HISTORY_FILE.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False) + "\n")


def manifest_urls(manifest: list[dict[str, Any]]) -> list[str]:
    site = base_url()
    urls: list[str] = []
    for item in manifest:
        slug = item.get("slug")
        if not isinstance(slug, str):
            continue
        urls.append(site if slug == "/" else f"{site}{slug}")
    return urls


def select_urls(manifest: list[dict[str, Any]], history: set[str], retry_queue: list[str]) -> list[str]:
    site = base_url()
    core_urls = [site, f"{site}/docs-overview", f"{site}/start"]

    sorted_manifest = sorted(manifest, key=lambda item: item.get("updated", ""), reverse=True)
    recent_urls = [
        f"{site}{item['slug']}"
        for item in sorted_manifest
        if isinstance(item.get("slug"), str) and f"{site}{item['slug']}" not in core_urls
    ]
    all_urls = manifest_urls(manifest)
    unsubmitted = [url for url in all_urls if url not in history and url not in core_urls]

    selected: list[str] = []

    if retry_queue:
        selected.append(retry_queue.pop(0))
        save_retry_queue(retry_queue)

    for url in core_urls:
        if len(selected) < 4 and url not in selected:
            selected.append(url)

    recent_count = 0
    for url in recent_urls:
        if recent_count >= 3 or len(selected) >= 7:
            break
        if url not in selected:
            selected.append(url)
            recent_count += 1

    for url in unsubmitted:
        if len(selected) >= DAILY_LIMIT:
            break
        if url not in selected:
            selected.append(url)

    return selected[:DAILY_LIMIT]


def submit(urls: list[str], dry_run: bool) -> None:
    site = os.environ.get("BAIDU_SITE", base_url())
    token = os.environ.get("BAIDU_PUSH_TOKEN")

    print(f"Candidate URLs: {len(urls)}")
    print("Today's 10 URLs:")
    for index, url in enumerate(urls, 1):
        print(f"[{index}] {url}")

    if dry_run:
        print("\n[DRY RUN] No actual submission.")
        return

    if not site or not token:
        raise SystemExit("Error: BAIDU_SITE or BAIDU_PUSH_TOKEN not found in environment.")

    endpoint = f"http://data.zz.baidu.com/urls?site={site}&token={token}"
    try:
        response = requests.post(
            endpoint,
            data="\n".join(urls),
            headers={"Content-Type": "text/plain"},
            timeout=15,
        )
        try:
            payload: dict[str, Any] = response.json()
        except ValueError:
            payload = {"status_code": response.status_code, "text": response.text[:500]}

        success = response.status_code == 200 and "success" in payload
        safe_payload = {key: value for key, value in payload.items() if key.lower() not in {"token", "secret"}}
        print(f"\nResponse: {safe_payload}")
        log_history(urls, success, safe_payload)

        if not success:
            retry_queue = load_retry_queue()
            retry_queue.extend(urls)
            save_retry_queue(retry_queue)
            raise SystemExit(1)
    except requests.RequestException as exc:
        log_history(urls, False, {"error": str(exc)})
        retry_queue = load_retry_queue()
        retry_queue.extend(urls)
        save_retry_queue(retry_queue)
        raise SystemExit(f"Error during submission: {exc}") from exc


def main() -> None:
    parser = argparse.ArgumentParser(description="Submit Hermes Chinese site URLs to Baidu URL Push API")
    parser.add_argument("--run", action="store_true", help="Perform actual submission; default is dry-run")
    args = parser.parse_args()

    load_env_file()
    manifest = load_manifest()
    history = load_history()
    retry_queue = load_retry_queue()

    URL_POOL_FILE.write_text(json.dumps(manifest_urls(manifest), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    selected = select_urls(manifest, history, retry_queue)
    submit(selected, dry_run=not args.run)


if __name__ == "__main__":
    main()
