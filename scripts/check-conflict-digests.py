import datetime as dt
import unittest
from conflict_digests import parse_feed, compose, excerpt, clean

NOW = dt.datetime(2026,10,21,18,0,tzinfo=dt.timezone.utc)
UK = 'ukraine-guerre-enjeux'
TW = 'taiwan-detroit-tensions'
SOURCE = {'id':'test','name':'Source','domains':['press.example'], 'topics':[UK,TW]}


def item(title, summary, date='Wed, 21 Oct 2026 12:00:00 GMT', url='https://press.example/article'):
    return f'<rss><channel><item><title>{title}</title><description><![CDATA[{summary}]]></description><pubDate>{date}</pubDate><link>{url}</link></item></channel></rss>'.encode()


class DigestTests(unittest.TestCase):
    def test_summary_not_headline_and_uncertainty_preserved(self):
        summary = 'Selon les autorités ukrainiennes, une nouvelle attaque aurait endommagé plusieurs infrastructures civiles dans le pays. Les opérations de secours se poursuivent.'
        parsed = parse_feed(item('Ukraine : infrastructures touchées',summary),SOURCE,NOW)
        self.assertEqual(len(parsed),1)
        self.assertNotEqual(parsed[0]['text'],parsed[0]['title'])
        self.assertIn('Selon les autorités',parsed[0]['text'])
        self.assertIn('aurait',parsed[0]['text'])

    def test_clean_and_limit_without_translation(self):
        summary = 'Selon les autorités, plusieurs infrastructures civiles ukrainiennes auraient été touchées au cours de la nuit. Les services de secours poursuivent leurs interventions dans les quartiers concernés et vérifient les informations disponibles. Aucun bilan définitif ne peut encore être établi à ce stade.'
        text,truncated = excerpt('<p>'+summary+'</p>')
        self.assertEqual(text,summary); self.assertFalse(truncated)
        self.assertGreater(len(text.split()),25); self.assertLessEqual(len(text.split()),90)
        self.assertNotIn('…',text); self.assertIn('Selon les autorités',text)
        self.assertEqual(clean('<p>Un texte.</p><p>Une suite.</p><script>secret</script>'),'Un texte. Une suite.')
        self.assertEqual(clean('Une visite de '+chr(92)*3+'"solidarité'+chr(92)*3+'".'),'Une visite de "solidarité".')
        self.assertIsNone(excerpt('Un résumé très court.'))
        self.assertIsNone(excerpt('Un résumé incomplet contient quelques mots mais ne livre pas vraiment toute la phrase…'))

    def test_trailing_reservation_is_preserved_in_full_sentence(self):
        summary='Plusieurs infrastructures militaires situées dans les différentes régions du pays ont été endommagées lors de la nouvelle attaque menée pendant la nuit de lundi à mardi, selon des informations non confirmées.'
        self.assertEqual(excerpt(summary),(summary,False))

    def test_complete_sentences_and_publisher_cut_tail(self):
        complete='M. Dupont a indiqué que près de 3,8 millions de personnes avaient regagné leur logement en Ukraine.'
        self.assertEqual(excerpt(complete+' Une partie du résumé transmis par le flux est coupée…'),(complete,False))
        self.assertEqual(excerpt(complete+' Les explications de Paul Dupont, correspondant à France 24.'),(complete,False))
        self.assertIsNone(excerpt('Un long résumé sans aucune ponctuation terminale qui ne permet pas de savoir si la phrase fournie est complète'))
        self.assertIsNone(excerpt('En Ukraine, '+'des infrastructures civiles importantes '*30+'.'))
        first='Les représentants ukrainiens et leurs partenaires discutent des conditions de sécurité et des perspectives de paix.'
        too_long='Les discussions portent sur '+'la protection des infrastructures civiles '*20+'.'
        self.assertEqual(excerpt(first+' '+too_long),(first,False))

    def test_wrong_topic_and_nonsecurity_story_rejected(self):
        self.assertEqual(parse_feed(item('Taïwan cuisine','Les visiteurs découvrent les traditions culinaires locales dans un nouveau restaurant ouvert au centre de la ville.'),SOURCE,NOW),[])
        self.assertEqual(parse_feed(item('Japon : défense','Le gouvernement japonais annonce une nouvelle politique de défense concernant les exercices militaires dans le pays.'),SOURCE,NOW),[])

    def test_old_future_unsafe_and_xml_rejected(self):
        summary='En Ukraine, les autorités signalent une attaque militaire contre plusieurs infrastructures énergétiques du pays.'
        for date in ['Wed, 30 Sep 2026 12:00:00 GMT','Thu, 22 Oct 2026 12:00:00 GMT','date inconnue']:
            self.assertEqual(parse_feed(item('Ukraine : attaque',summary,date),SOURCE,NOW),[])
        for url in ['https://evil.example/article','http://press.example/article','https://user:secret@press.example/article']:
            self.assertEqual(parse_feed(item('Ukraine : attaque',summary,url=url),SOURCE,NOW),[])
        with self.assertRaises(ValueError): parse_feed(b'<!DOCTYPE rss><rss/>',SOURCE,NOW)

    def test_failed_link_cannot_enter_text(self):
        parsed=parse_feed(item('Ukraine : diplomatie','Les représentants ukrainiens et leurs partenaires discutent des conditions de sécurité et des perspectives de paix.'),SOURCE,NOW)
        result=compose({},[(SOURCE,parsed,None)],NOW,lambda url:False)
        self.assertEqual(result[UK]['status'],'empty'); self.assertEqual(result[UK]['paragraphs'],[])

    def test_failure_retains_last_text_and_update_date(self):
        parsed=parse_feed(item('Ukraine : diplomatie','Les représentants ukrainiens et leurs partenaires discutent des conditions de sécurité et des perspectives de paix.'),SOURCE,NOW)
        first=compose({},[(SOURCE,parsed,None)],NOW,lambda url:True)
        previous={slug:{'digest':digest} for slug,digest in first.items()}
        later=NOW+dt.timedelta(hours=10)
        failed=compose(previous,[(SOURCE,[],'timeout')],later,lambda url:False)
        self.assertEqual(failed[UK]['status'],'retained')
        self.assertEqual(failed[UK]['updatedAt'],first[UK]['updatedAt'])
        self.assertEqual(failed[UK]['paragraphs'],first[UK]['paragraphs'])
        self.assertFalse(failed[UK]['sources'][0]['ok'])
        self.assertNotEqual(failed[UK]['checkedAt'],first[UK]['checkedAt'])

    def test_failure_cannot_restore_old_truncated_summary(self):
        previous={UK:{'digest':{'updatedAt':NOW.isoformat(),'paragraphs':[
            {'text':'Un ancien extrait qui se termine au milieu de la phrase avec une coupure…','truncated':True}]}}}
        failed=compose(previous,[(SOURCE,[],'timeout')],NOW,lambda url:False)
        self.assertEqual(failed[UK]['status'],'empty');self.assertEqual(failed[UK]['paragraphs'],[])

    def test_unchanged_and_corrected_summary(self):
        parsed=parse_feed(item('Ukraine : diplomatie','Les représentants ukrainiens et leurs partenaires discutent des conditions de sécurité et des perspectives de paix.'),SOURCE,NOW)
        first=compose({},[(SOURCE,parsed,None)],NOW,lambda url:True)
        previous={slug:{'digest':digest} for slug,digest in first.items()}
        later=NOW+dt.timedelta(hours=10)
        same=compose(previous,[(SOURCE,parsed,None)],later,lambda url:True)
        self.assertEqual(same[UK]['status'],'unchanged');self.assertEqual(same[UK]['updatedAt'],first[UK]['updatedAt'])
        parsed[0]['text']='Les autorités ukrainiennes ont corrigé leur communiqué sur les discussions diplomatiques et les conditions de sécurité.'
        changed=compose(previous,[(SOURCE,parsed,None)],later,lambda url:True)
        self.assertEqual(changed[UK]['status'],'updated');self.assertEqual(changed[UK]['updatedAt'],later.isoformat())

    def test_no_duplicates_and_publisher_limit(self):
        parsed=[]
        for i in range(5): parsed.extend(parse_feed(item('Ukraine : diplomatie '+str(i),'Les représentants ukrainiens et leurs partenaires discutent des conditions de sécurité et des perspectives de paix.',url='https://press.example/'+str(i)),SOURCE,NOW))
        parsed+=parsed
        result=compose({},[(SOURCE,parsed,None)],NOW,lambda url:True)
        self.assertEqual(len(result[UK]['paragraphs']),2)


if __name__=='__main__':unittest.main()
