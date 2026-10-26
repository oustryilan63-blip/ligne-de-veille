"""Offline regressions for request reuse, article images and network failures."""
import concurrent.futures
import io
import threading
import unittest
from unittest import mock
import contextlib
import datetime as dt
import importlib.util
import json
from pathlib import Path
import tempfile

from news_http import NewsHTTP
from news_images import find_article_image


class FakeResponse:
    def __init__(self, url, data=b'<html>article</html>', content_type='text/html',
                 status=200, fail_after_first_read=False):
        self.url = url
        self.data = io.BytesIO(data)
        self.status = status
        self.headers = {'Content-Type': content_type}
        self.reads = 0
        self.fail_after_first_read = fail_after_first_read

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def read(self, size):
        self.reads += 1
        if self.fail_after_first_read and self.reads > 1:
            raise TimeoutError('body interrupted')
        return self.data.read(size)


class NewsProcessTests(unittest.TestCase):

    def test_item_language_beats_feed_default(self):
        import xml.etree.ElementTree as ET
        spec=importlib.util.spec_from_file_location('language_test',Path(__file__).with_name('update-news.py'))
        news=importlib.util.module_from_spec(spec);spec.loader.exec_module(news)
        source={'language':'fr','languageCategories':{'Conflits in English':'en'}}
        self.assertEqual(news.article_language(ET.fromstring('<item/>'),['Conflits in English'],source),'en')
        self.assertEqual(news.article_language(ET.fromstring('<item xml:lang="en-GB"/>'),[],source),'en')
        self.assertEqual(news.article_language(ET.fromstring('<item><language>en-US</language></item>'),[],source),'en')
        self.assertEqual(news.article_language(ET.fromstring('<item/>'),[],source),'fr')


    def test_unverified_new_links_keep_articles_and_allow_dossiers(self):
        spec = importlib.util.spec_from_file_location('news_update_regression', Path(__file__).with_name('update-news.py'))
        news = importlib.util.module_from_spec(spec); spec.loader.exec_module(news)
        temporary_root = Path(__file__).resolve().parent.parent / 'test-results'
        temporary_root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=temporary_root) as folder:
            root = Path(folder)
            self.assertEqual(root.resolve().parent, temporary_root.resolve())
            (root/'scripts').mkdir()
            sources = [{'name':'Officiel','type':'Source officielle'}, {'name':'Presse','type':'Presse spécialisée'}]
            (root/'scripts/news-sources.json').write_text(json.dumps(sources),encoding='utf-8')
            stamp = dt.datetime.now(dt.timezone.utc).isoformat()
            old = {'title':'Publication déjà vérifiée','url':'https://example.test/old','date':stamp[:10],'publishedAt':stamp,'source':'Presse'}
            candidate = {**old,'title':'Lien momentanément inaccessible','url':'https://example.test/new'}
            output = root/'actualites.json'
            output.write_text(json.dumps({'items':[old]}),encoding='utf-8')
            with mock.patch.object(news,'ROOT',root), mock.patch.object(news,'collect',side_effect=lambda s,n:(s,[candidate],None)), mock.patch.object(news,'verify_link',return_value=False), mock.patch.object(news,'enrich_images'), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                news.main()
            result = json.loads(output.read_text(encoding='utf-8'))
            self.assertEqual(result['items'],[old])
            self.assertEqual(result['automation']['newItems'],0)
            self.assertTrue(result['checkedAt'])
            self.assertTrue(all(s['ok'] for s in result['automation']['sources']))
            # A genuinely insufficient feed collection must still stop before writing.
            before = output.read_text(encoding='utf-8')
            with mock.patch.object(news,'ROOT',root), mock.patch.object(news,'collect',side_effect=lambda s,n:(s,[],None if s['name']=='Presse' else 'timeout')), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                with self.assertRaises(RuntimeError): news.main()
            self.assertEqual(output.read_text(encoding='utf-8'),before)

    def test_same_image_and_credit_with_one_article_download(self):
        article = 'https://www.opex360.com/2026/10/14/example/'
        image = 'https://www.opex360.com/wp-content/uploads/example.jpg'
        page = ('<html><meta property="og:image" content="' + image + '">'
                '<figure><img src="' + image + '" alt="Photo documentaire">'
                '<figcaption>Photo : Auteur du document</figcaption></figure></html>').encode()
        calls = []

        def opener(request, **kwargs):
            calls.append(request.full_url)
            data = page if request.full_url == article else b'\xff\xd8\xffimage'
            return FakeResponse(request.full_url, data,
                                'text/html' if request.full_url == article else 'image/jpeg')

        client = NewsHTTP({}, None, opener=opener)
        item = {'url': article, 'title': 'Un engin documenté'}
        clean = lambda text: ' '.join((text or '').split())
        clip = lambda text, limit=140: text[:limit]
        self.assertTrue(client.verify_article(article))
        optimized = find_article_image(item, client.request, clean, clip)
        self.assertEqual(calls.count(article), 1)
        self.assertEqual(calls.count(image), 1)
        baseline = find_article_image(item, lambda url, max_bytes=2_000_000:
                                      page if url == article else b'\xff\xd8\xffimage', clean, clip)
        self.assertEqual(optimized, baseline)
        self.assertEqual(optimized['credit'], 'Auteur du document')
        self.assertGreater(client.stats()['cacheHits'], 0)

    def test_invalid_types_and_insecure_redirects_remain_rejected(self):
        wrong = NewsHTTP({}, None, opener=lambda request, **kw:
                         FakeResponse(request.full_url, b'pdf', 'application/pdf'))
        self.assertFalse(wrong.verify_article('https://example.test/article'))
        redirected = NewsHTTP({}, None, opener=lambda request, **kw:
                              FakeResponse('http://example.test/article'))
        self.assertFalse(redirected.verify_article('https://example.test/article'))
        with self.assertRaises(ValueError):
            redirected.request('http://example.test/article')

    def test_size_limits_hold_when_reusing_a_larger_response(self):
        client = NewsHTTP({}, None, opener=lambda request, **kw:
                          FakeResponse(request.full_url, b'x' * 100))
        self.assertEqual(len(client.request('https://example.test/a', max_bytes=100)), 100)
        with self.assertRaises(ValueError):
            client.request('https://example.test/a', max_bytes=99)
        oversized = NewsHTTP({}, None, opener=lambda request, **kw:
                             FakeResponse(request.full_url, b'x' * 3_000_001))
        self.assertTrue(oversized.verify_article('https://example.test/large'))
        self.assertEqual(len(oversized._cache), 0)
        with self.assertRaises(ValueError):
            oversized.request('https://example.test/large', max_bytes=3_000_000)

    def test_partial_body_and_temporary_failure_do_not_poison_cache(self):
        calls = []

        def opener(request, **kw):
            calls.append(request.full_url)
            if len(calls) == 1:
                raise TimeoutError('temporarily unavailable')
            return FakeResponse(request.full_url, fail_after_first_read=len(calls) == 2)

        client = NewsHTTP({}, None, opener=opener)
        url = 'https://example.test/article'
        self.assertFalse(client.verify_article(url))
        self.assertTrue(client.verify_article(url))
        self.assertEqual(len(client._cache), 0)
        self.assertEqual(client.request(url), b'<html>article</html>')
        self.assertEqual(len(calls), 3)

    def test_cache_is_bounded_and_isolated_between_runs(self):
        calls = []

        def opener(request, **kw):
            calls.append(request.full_url)
            return FakeResponse(request.full_url, b'x' * 8)

        client = NewsHTTP({}, None, opener=opener, cache_bytes=16, cache_entries=2)
        for suffix in ('a', 'b', 'c'):
            client.request('https://example.test/' + suffix)
        self.assertLessEqual(client._bytes, 16)
        self.assertLessEqual(len(client._cache), 2)
        client.request('https://example.test/a')
        fresh = NewsHTTP({}, None, opener=opener)
        fresh.request('https://example.test/a')
        self.assertEqual(calls.count('https://example.test/a'), 3)

    def test_concurrent_duplicate_requests_share_one_download(self):
        entered = threading.Event()
        release = threading.Event()

        def opener(request, **kw):
            entered.set()
            if not release.wait(3):
                raise TimeoutError('test did not release request')
            return FakeResponse(request.full_url)

        client = NewsHTTP({}, None, opener=opener)
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            first = pool.submit(client.request, 'https://example.test/article')
            self.assertTrue(entered.wait(3))
            second = pool.submit(client.request, 'https://example.test/article')
            release.set()
            self.assertEqual(first.result(), second.result())
        self.assertEqual(client.stats()['requests'], 1)
        self.assertEqual(client.stats()['cacheHits'] + client.stats()['sharedRequests'], 1)


if __name__ == '__main__':
    unittest.main()
