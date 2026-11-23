"""Copy only source files to the existing isolated Git checkout; fail before any push."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
namespace={'__file__':str(root/'scripts/package-deliverables.py')}
definition=(root/'scripts/package-deliverables.py').read_text(encoding='utf-8').split('for name,private_pdf in ')[0]
exec(definition,namespace)
stage=root/'tmp/github-source'
stage.mkdir(parents=True,exist_ok=True)
files=list(namespace['source_files'](False))
files.extend([root/'.gitattributes',root/'scripts/stage-github-source.py'])
for file in files:
    destination=stage/file.relative_to(root)
    destination.parent.mkdir(parents=True,exist_ok=True)
    try: shutil.copyfile(file,destination)
    except OSError as error: raise RuntimeError('Could not stage '+str(file.relative_to(root))) from error
for required in ['.github/workflows/ipad-ipa.yml','NgaNgo.Web/wwwroot/js/app.js','NgaNgo.Web/wwwroot/images/hello-kitty-study.png','NgaNgo.App/src/native-entry.js','tests/native-providers.test.mjs']:
    assert (stage/required).is_file(),required
assert not (stage/'NgaNgo.Web/App_Data').exists()
assert not (stage/'NgaNgo.Web/appsettings.Local.json').exists()
print(f'Staged {len(files)} source files; required assets verified.')
