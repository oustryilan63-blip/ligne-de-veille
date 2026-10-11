import fs from 'node:fs';
const policy=JSON.parse(fs.readFileSync(new URL('./news-image-policy.json',import.meta.url),'utf8'));
const secure=(raw,hosts,prefixes=['/'])=>{const u=new URL(raw);return u.protocol==='https:'&&hosts.includes(u.hostname)&&!u.username&&!u.password&&(!u.port||u.port==='443')&&prefixes.some(p=>u.pathname.startsWith(p))};
const wpAsset=raw=>{const u=new URL(raw);u.search='';u.hash='';u.pathname=u.pathname.replace(/-(?:\d+x\d+|scaled)(?=\.(?:jpg|jpeg|png|webp)$)/i,'');return u.href};
export function validateImage(item){
  const image=item.image;if(!image)return;
  if(image.kind!=='article'||image.sourceUrl!==item.url)throw new Error('La photo doit appartenir à la publication');
  for(const k of ['alt','credit','license'])if(typeof image[k]!=='string'||!image[k].trim()||image[k].length>240)throw new Error('Métadonnées de photo invalides');
  const provider=image.provider||'gov-uk',article=new URL(item.url);
  if(provider==='publisher-permission'){
    const grant=policy.publisherPermission;
    if(!grant||!grant.articleHosts.includes(article.hostname)||!secure(image.src,grant.imageHosts)||!secure(image.assetUrl,grant.imageHosts)||image.license!==grant.license||image.licenseUrl!==grant.licenseUrl||image.rightsUrl!==item.url||image.evidence!=='user-confirmed-publisher-permission'||image.permissionConfirmedAt!==grant.confirmedAt||wpAsset(image.assetUrl)!==wpAsset(image.src)||/logo|avatar|placeholder|site-default|default[-_]image|social[-_]share/i.test(new URL(image.src).pathname))throw new Error('Autorisation de l’éditeur ou image principale invalide');
  }else if(provider==='verified-asset'){
    const proof=policy.verifiedLicensedAssets?.[image.src];
    if(!proof||!proof.articleHosts.includes(article.hostname)||image.assetUrl!==image.src||image.sha256!==proof.sha256||image.credit!==proof.credit||image.license!==proof.license||image.licenseUrl!==proof.licenseUrl||image.rightsUrl!==proof.rightsUrl||image.evidence!=='verified-source-license')throw new Error('Licence ou identité du fichier non vérifiée');
  }else if(provider==='specific-permission'){
    const grant=policy.explicitPermissions?.[image.src];
    if(!grant||!grant.articleHosts.includes(article.hostname)||image.credit!==grant.credit||image.license!==grant.license||image.licenseUrl!==grant.licenseUrl||image.rightsUrl!==item.url||image.evidence!=='user-confirmed-specific-photo'||!image.assetUrl||wpAsset(image.assetUrl)!==wpAsset(image.src)||image.sha256!==grant.sha256)throw new Error('Autorisation spécifique absente ou différente');
  }else if(provider==='individual-cc'){
    const license=new URL(image.licenseUrl);
    if(!policy.individualLicenseHosts.includes(article.hostname)||!secure(image.src,[article.hostname,...policy.individualImageHosts])||license.protocol!=='https:'||license.hostname!=='creativecommons.org'||!policy.creativeCommonsPaths.includes(license.pathname)||image.evidence!=='image-specific-license'||image.rightsUrl!==item.url)throw new Error('Licence individuelle non vérifiée');
  }else{
    const rule=policy.providers[provider];
    if(!rule||!rule.articleHosts.includes(article.hostname)||!secure(image.src,rule.imageHosts,rule.imagePathPrefixes)||image.license!==rule.license||image.licenseUrl!==rule.licenseUrl)throw new Error('Source ou licence de photo invalide');
    if(provider==='nato'){
      if(image.credit!=='© NATO'||!secure(image.rightsUrl,rule.articleHosts)||!['explicit-image-rights','verified-individual-asset'].includes(image.evidence))throw new Error('Crédit ou droit OTAN manquant');
      if(image.evidence==='explicit-image-rights'&&image.rightsUrl!==item.url)throw new Error('Droit OTAN associé à une autre publication');
      if(image.evidence==='verified-individual-asset'){
        const src=new URL(image.src);src.search='';const known=policy.knownNatoMedia[src.href];
        if(!known||known.rightsUrl!==image.rightsUrl)throw new Error('Preuve individuelle OTAN absente');
      }
    }
  }
}
