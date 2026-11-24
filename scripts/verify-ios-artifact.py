from pathlib import Path
import hashlib,io,json,plistlib,struct,zipfile,sys
root=Path(__file__).resolve().parents[1]
folder=root/'artifacts/ios'
with zipfile.ZipFile(folder/'Aymi-Russian-iPad-unsigned.zip') as artifact:
    assert artifact.testzip() is None
    ipa_name='Aymi-Russian-unsigned.ipa'
    ipa=artifact.read(ipa_name)
    checksum=artifact.read(ipa_name+'.sha256').decode().split()[0]
    assert hashlib.sha256(ipa).hexdigest()==checksum,'IPA checksum mismatch'
    for name in [ipa_name,ipa_name+'.sha256','INSTALL.txt']:
        (folder/name).write_bytes(artifact.read(name))
with zipfile.ZipFile(io.BytesIO(ipa)) as app:
    assert app.testzip() is None
    base='Payload/AymiRussian.app/'
    info=plistlib.loads(app.read(base+'Info.plist'))
    assert info['CFBundleDisplayName']=='Aymi Russian'
    executable=app.read(base+info['CFBundleExecutable'])
    assert executable[:4]==bytes.fromhex('cffaedfe'),'Expected a 64-bit Mach-O executable'
    assert struct.unpack_from('<I',executable,4)[0]==0x0100000c,'Expected arm64'
    assert 'NSMicrophoneUsageDescription' in info and 'NSSpeechRecognitionUsageDescription' in info
    names=app.namelist()
    assert base+'public/index.html' in names
    assert 'lang="en"' in app.read(base+'public/index.html').decode()
    bundle=json.loads(app.read(base+'public/bundle-info.json'))
    assert bundle['textbook'] is False,'Cloud build must not include the private book'
    frameworks=sorted(n for n in names if n.startswith(base+'Frameworks/') and n.endswith('.framework/Info.plist'))
    result={'name':info['CFBundleDisplayName'],'bundleId':info['CFBundleIdentifier'],
      'minimumOS':info['MinimumOSVersion'],'architecture':'arm64','format':'Mach-O 64-bit',
      'ipaBytes':len(ipa),'sha256':checksum,'privateTextbookBundled':False,
      'nativeFrameworks':frameworks,'codeSignaturePresent':any('/_CodeSignature/' in n for n in names),
      'buildRun':sys.argv[1] if len(sys.argv)>1 else None}
(folder/'verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
