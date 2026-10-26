import datetime as dt
import importlib.util
import json
from pathlib import Path
import unittest
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('updater', ROOT / 'scripts/update-conflicts.py')
updater = importlib.util.module_from_spec(spec)
spec.loader.exec_module(updater)
NOW = dt.datetime(2026, 10, 21, 16, 30, tzinfo=dt.timezone.utc)


class ConflictTests(unittest.TestCase):
    def setUp(self):
        self.sources = [{'name':'Officiel', 'type':'Source officielle', 'domains':['gov.example']},
                        {'name':'Presse', 'type':'Presse spécialisée', 'domains':['press.example']}]
        self.news = {'checkedAt': NOW.isoformat(), 'automation':{'sources':[
            {'source':'Officiel', 'ok':True}, {'source':'Presse', 'ok':True}]}, 'items':[]}

    def add(self, title, index=0, source='Presse', age=1, url=None):
        self.news['items'].append({'title':title, 'source':source, 'autoCollected':True,
            'url':url or f'https://press.example/{index}',
            'publishedAt':(NOW - dt.timedelta(days=age)).isoformat(), 'language':'fr'})

    def result(self, previous=None):
        return updater.refresh(self.news, self.sources, previous or {}, NOW)

    def test_geography_and_false_positives(self):
        for i, title in enumerate(['L’armée ukrainienne', 'Taïwan : les tensions', 'Pratas',
                                  'Israël et Gaza', 'Yémen et Bab el-Mandeb', 'Iran : entretien',
                                  'La Russie et l’Arctique', 'La Chine et le commerce mondial']):
            self.add(title, i, age=i / 10)
        topics = self.result()['topics']
        self.assertEqual([len(t['items']) for t in topics.values()], [1, 2, 2])

    def test_recent_verified_trusted_items_only(self):
        self.add('Ukraine ancienne', 1, age=15)
        self.add('Ukraine future', 2, age=-1)
        self.add('Ukraine domaine inconnu', 3, url='https://evil.example/3')
        self.add('Ukraine identifiants', 4, url='https://name:secret@press.example/4')
        self.add('Ukraine correcte', 5)
        self.add('Ukraine non collectée', 6)
        self.news['items'][-1]['autoCollected'] = False
        self.assertEqual([i['title'] for i in self.result()['topics']['ukraine-guerre-enjeux']['items']], ['Ukraine correcte'])

    def test_deduplicate_and_publisher_limit(self):
        for i in range(8): self.add(f'Ukraine : nouvelle {i}', i, age=i / 10)
        self.add('Ukraine : nouvelle 0', 20, age=1)
        items = self.result()['topics']['ukraine-guerre-enjeux']['items']
        self.assertEqual([i['title'] for i in items], ['Ukraine : nouvelle 0', 'Ukraine : nouvelle 1'])

    def test_stale_future_and_failed_collection_do_not_write(self):
        for checked in [NOW - dt.timedelta(hours=2), NOW + dt.timedelta(hours=1)]:
            self.news['checkedAt'] = checked.isoformat()
            with self.assertRaises(ValueError): self.result()
        self.news['checkedAt'] = NOW.isoformat()
        self.news['automation']['sources'][0]['ok'] = False
        with self.assertRaises(ValueError): self.result()

    def test_unchanged_selection_keeps_change_date(self):
        self.add('Ukraine : annonce')
        first = self.result()
        self.news['checkedAt'] = (NOW + dt.timedelta(minutes=5)).isoformat()
        second = self.result(first)
        self.assertNotEqual(first['checkedAt'], second['checkedAt'])
        self.assertEqual(first['topics'], second['topics'])

    def test_empty_topic_is_explicit_and_partial_failure_is_visible(self):
        self.sources.append({'name':'Autre', 'type':'Presse spécialisée', 'domains':['other.example']})
        self.news['automation']['sources'].append({'source':'Autre', 'ok':False})
        result = self.result()
        self.assertEqual(result['coverage'], {'ok':2, 'total':3, 'unavailable':['Autre']})
        self.assertEqual(result['topics']['taiwan-detroit-tensions']['items'], [])

    def test_verified_translation_prefers_french_without_merging_other_angles(self):
        self.sources[1]['domains']=['press.example','revueconflits.com']
        group=updater.TRANSLATIONS[0]
        english=next(m['url'] for m in group['members'] if m['language']=='en')
        self.add('How much has France given to Ukraine?',url=english,age=1)
        self.news['items'][-1]['language']='en'
        self.add('Combien la France a-t-elle donné à l’Ukraine ?',url=group['preferredUrl'],age=2)
        self.add('Ukraine : un autre éclairage',url='https://press.example/other',age=1.5)
        items=self.result()['topics']['ukraine-guerre-enjeux']['items']
        self.assertEqual({i['url'] for i in items},{group['preferredUrl'],'https://press.example/other'})
        self.news['items']=[i for i in self.news['items'] if i['url']!=group['preferredUrl']]
        self.assertIn(english,{i['url'] for i in self.result()['topics']['ukraine-guerre-enjeux']['items']})

    def test_cli_failure_preserves_last_good_file(self):
        temporary_root = ROOT / 'test-results'
        temporary_root.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=temporary_root) as folder:
            self.assertEqual(Path(folder).resolve().parent, temporary_root.resolve())
            output, news = Path(folder) / 'suivi.json', Path(folder) / 'news.json'
            output.write_text('{"previous":"last good version"}', encoding='utf-8')
            self.news['checkedAt'] = '2020-01-01T00:00:00Z'
            news.write_text(json.dumps(self.news), encoding='utf-8')
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/update-conflicts.py'),
                                     '--news', str(news), '--output', str(output)], capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(output.read_text(encoding='utf-8'), '{"previous":"last good version"}')
            self.assertFalse(output.with_suffix('.json.tmp').exists())


if __name__ == '__main__':
    unittest.main()
