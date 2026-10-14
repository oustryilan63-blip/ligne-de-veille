"""Bounded HTTP reuse within one news run; no persistent or stale cache.

The original HTTPS, timeout, size and article-type checks remain in force.
At most two requests contact the same host at once, even when several
publishers are processed concurrently.
"""
from collections import OrderedDict
from concurrent.futures import Future
from dataclasses import dataclass
import threading
import urllib.parse
import urllib.request


@dataclass(frozen=True)
class Response:
    data: bytes
    status: int
    content_type: str
    complete: bool


class NewsHTTP:
    def __init__(self, headers, context, *, opener=None, cache_bytes=12_000_000,
                 cache_entries=64, per_host=2):
        self.headers = headers
        self.context = context
        self.opener = opener or urllib.request.urlopen
        self.cache_bytes = cache_bytes
        self.cache_entries = cache_entries
        self.per_host = per_host
        self._lock = threading.Lock()
        self._cache = OrderedDict()
        self._bytes = 0
        self._pending = {}
        self._hosts = {}
        self._stats = {'requests': 0, 'cacheHits': 0, 'sharedRequests': 0}

    def _fetch(self, url, limit, timeout=25, verify=False):
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError('URL non HTTPS ou non admissible')
        key = (url, limit, verify)
        with self._lock:
            cached = self._cache.get(url)
            if cached is not None:
                self._cache.move_to_end(url)
                self._stats['cacheHits'] += 1
                return cached
            pending = self._pending.get(key)
            if pending is None:
                pending = Future()
                self._pending[key] = pending
                owner = True
            else:
                self._stats['sharedRequests'] += 1
                owner = False
            gate = self._hosts.setdefault(parsed.hostname, threading.BoundedSemaphore(self.per_host))
        if not owner:
            return pending.result()
        try:
            with gate:
                with self._lock:
                    self._stats['requests'] += 1
                request = urllib.request.Request(url, headers=self.headers)
                with self.opener(request, timeout=timeout, context=self.context) as response:
                    if urllib.parse.urlsplit(response.url).scheme != 'https':
                        raise ValueError('Redirection non HTTPS')
                    content_type = response.headers.get('Content-Type', '')
                    if verify:
                        data = response.read(1024)
                        complete = False
                        if response.status == 200 and 'text/html' in content_type:
                            try:
                                data += response.read(limit + 1 - len(data))
                                complete = len(data) <= limit
                            except Exception:
                                # The former verifier needed only the first
                                # 1 KiB. A later body failure must not remove
                                # an otherwise valid article from the news.
                                pass
                    else:
                        data = response.read(limit + 1)
                        complete = len(data) <= limit
                    result = Response(data, response.status, content_type, complete)
            with self._lock:
                if result.complete and result.status == 200 and len(data) <= self.cache_bytes:
                    previous = self._cache.pop(url, None)
                    if previous is not None:
                        self._bytes -= len(previous.data)
                    self._cache[url] = result
                    self._bytes += len(data)
                    while self._bytes > self.cache_bytes or len(self._cache) > self.cache_entries:
                        _, removed = self._cache.popitem(last=False)
                        self._bytes -= len(removed.data)
                pending.set_result(result)
                self._pending.pop(key, None)
            return result
        except BaseException as exc:
            with self._lock:
                pending.set_exception(exc)
                self._pending.pop(key, None)
            raise

    def request(self, url, max_bytes=2_000_000):
        result = self._fetch(url, max_bytes)
        if not result.complete or len(result.data) > max_bytes:
            raise ValueError('Réponse trop volumineuse')
        return result.data

    def verify_article(self, url):
        try:
            result = self._fetch(url, 3_000_000, timeout=20, verify=True)
            # An oversized article is still a valid link. Only complete pages
            # enter the cache; image extraction retains its own size limit.
            return result.status == 200 and 'text/html' in result.content_type
        except Exception:
            return False

    def stats(self):
        with self._lock:
            return dict(self._stats)
