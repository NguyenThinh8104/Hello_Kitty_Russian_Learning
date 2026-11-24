"""Package explicit source allowlists; never include local secrets or dependency caches."""
from pathlib import Path
import zipfile
import hashlib
import sys

root=Path(__file__).resolve().parents[1]
output=root/'artifacts'
output.mkdir(exist_ok=True)
top=['README.md','CAI-IPAD-MAC-M1.md','BUILD-IPA-TREN-WINDOWS.md','CHUAN-BI-IPAD.command','.gitignore','.gitattributes','global.json','Nga_Ngo_Cung_Toi.sln','Dockerfile','.dockerignore']
trees=['NgaNgo.App','NgaNgo.Web','tests','.github']
skip={'node_modules','bin','obj','dist','Pods','xcuserdata','.build','build','DerivedData','capacitor-cordova-ios-plugins','.vs','.git','.dotnet','.cache','tmp','artifacts','__pycache__'}
def source_files(private_pdf):
    for name in top:
        yield root/name
    for name in ['build-ios-unsigned.sh','package-deliverables.py','create-icons.py','hello-kitty-background-prompt.txt','audit-app-language.mjs','verify-ios-artifact.py','vocabulary-source.json','vocabulary-reviewed.tsv','build-vocabulary.py','build-i18n.mjs','english-translations.json','download-vocabulary-art.mjs','merge-selected-vocabulary.mjs']:
        yield root/'scripts'/name
    for tree in trees:
        for file in (root/tree).rglob('*'):
            if not file.is_file(): continue
            relative=file.relative_to(root)
            if any(part in skip for part in relative.parts): continue
            if file.name=='appsettings.Local.json' or file.suffix=='.user': continue
            if 'App_Data' in relative.parts:
                if not private_pdf or relative.as_posix()!='NgaNgo.Web/App_Data/2017-a1.pdf': continue
            if relative.as_posix().startswith('NgaNgo.App/ios/App/App/public/'): continue
            if relative.as_posix() in ['NgaNgo.App/ios/App/App/config.xml','NgaNgo.App/ios/App/App/capacitor.config.json']: continue
            yield file

for name,private_pdf in [('Aymi-Russian-iPad-Source.zip',True),('Aymi-Russian-GitHub-Source.zip',False)]:
    with zipfile.ZipFile(output/name,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as bundle:
        for file in sorted(source_files(private_pdf)):
            bundle.write(file,Path('Aymi-Russian')/file.relative_to(root))
    with zipfile.ZipFile(output/name) as bundle:
        names=bundle.namelist()
        assert not any('/node_modules/' in name or name.endswith('/appsettings.Local.json') for name in names)
        assert 'Aymi-Russian/.github/workflows/ipad-ipa.yml' in names
        if not private_pdf: assert not any('/App_Data/' in name for name in names)
    print(f'{name}: {(output/name).stat().st_size:,} bytes')

native=output/'aymi-native'/'win-unpacked'
if '--source-only' not in sys.argv and (native/'Aymi Russian.exe').is_file():
    with zipfile.ZipFile(output/'Aymi-Russian-Windows.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as bundle:
        for file in sorted(native.rglob('*')):
            if file.is_file(): bundle.write(file,Path('Aymi-Russian-Windows')/file.relative_to(native))
    print(f'Aymi-Russian-Windows.zip: {(output/"Aymi-Russian-Windows.zip").stat().st_size:,} bytes')

with (output/'SHA256SUMS.txt').open('w',encoding='utf-8') as hashes:
    for file in sorted(output.glob('Aymi-Russian-*.zip')):
        hashes.write(hashlib.file_digest(file.open('rb'),'sha256').hexdigest()+'  '+file.name+'\n')
