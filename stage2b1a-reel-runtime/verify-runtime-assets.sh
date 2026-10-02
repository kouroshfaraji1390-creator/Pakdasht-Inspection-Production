#!/usr/bin/env bash
set -euo pipefail

copy_evidence() {
  if [ -d "${EVID:-}" ]; then
    rm -rf "$PWD/stage2b1a-evidence"
    cp -a "$EVID" "$PWD/stage2b1a-evidence"
  fi
}
trap copy_evidence EXIT

ROOT="${RUNNER_TEMP:-/tmp}/stage2b1a-reel-runtime"
NPMDIR="$ROOT/npm"
ASSETS="$ROOT/assets"
EVID="$ROOT/evidence"
rm -rf "$ROOT"
mkdir -p "$NPMDIR" "$ASSETS" "$EVID"

PKG_B64='H4sICHqBv2oAA3BhY2thZ2UuanNvbgCtU01z2yAUvPtXMBxy6AQkK62TetpODv0jGF5sPOJjACv2ZPzfywORypMcc5HE7r59+wS8rQihVhigW0KfA8DI4iUmMJ0MIJKegO2C0Jbeo3CCELWzqO35I+9ZAOlsTOEkE6iq8UFPIqFfhqFA6eKLv3HqNEKVgd1rCzHDb3mJIZwqoj+/h+/k1/CDZvhapWfvQlpI+fvnbI4c5Z3SMXXaKjhzxXPBfdNogw4fRMdIi+L63irKoP2y1e6kR4WFGI/MdLcHCyEPyUpzbo6R3N2RFCVhHl/Ovug9ly5A7uHsHIQmiCWE9YaEkyXFHCuLOWPIE3x03zi+0LjVwlkYP9ZJP68vhfVfsaZeOhT1FkN91TzVUXhfDOGcaqJGK5huyLxuVEwipBuyII2Wznjxn8eo+XvUMp9IZ7tKswghH8jliPgLtrvgXjP1YUh/EBEe2UxzWXe/7rsCD/lIWKmXR1IcJ3R54kPP+9Yjg+zFBSPKMaEPvOfrxuEkCK43/IE/NTRfJFnhnxnub2CmnFlQi0DT308zPZct6tptGTY892qWuDksygMYwZKru1mmn0Mtxrjl8l3mQ6P8KC6vQe8PtYxv1nlCTLa6rv4BmMIJRDAEAAA='
LOCK_B64='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'

printf '%s' "$PKG_B64" | base64 -d | gzip -dc > "$NPMDIR/package.json"
printf '%s' "$LOCK_B64" | base64 -d | gzip -dc > "$NPMDIR/package-lock.json"

{
  echo "node=$(node --version)"
  echo "npm=$(npm --version)"
} | tee "$EVID/node-npm.txt"

pushd "$NPMDIR"
npm ci 2>&1 | tee "$EVID/npm-ci.log"
popd

python -m pip install --upgrade pip
python -m pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision
python -m pip install 'transformers<5' huggingface_hub safetensors pillow opencv-python-headless onnx onnxruntime einops timm 'piper-tts==1.8.0'

mkdir -p "$ASSETS/florence2-base" "$ASSETS/dinov2-small" "$ASSETS/opencv" "$ASSETS/piper-voice"

export ASSETS
python - <<'PY'
import os, json
from huggingface_hub import HfApi, snapshot_download
root=os.environ['ASSETS']
api=HfApi()
repos={
  'florence':'microsoft/Florence-2-base',
  'dino':'facebook/dinov2-small',
  'piper_voice':'rhasspy/piper-voices',
}
meta={}
for key,repo in repos.items():
    info=api.model_info(repo)
    meta[key]={'repo':repo,'revision':info.sha}
snapshot_download(repos['florence'],revision=meta['florence']['revision'],local_dir=os.path.join(root,'florence2-base'))
snapshot_download(repos['dino'],revision=meta['dino']['revision'],local_dir=os.path.join(root,'dinov2-small'))
snapshot_download(
    repos['piper_voice'],
    revision=meta['piper_voice']['revision'],
    allow_patterns=[
      'fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx',
      'fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx.json',
      'fa/fa_IR/amir/medium/MODEL_CARD',
    ],
    local_dir=os.path.join(root,'piper-voice')
)
with open(os.path.join(root,'hf-revisions.json'),'w',encoding='utf-8') as f:
    json.dump(meta,f,indent=2)
PY

OPENCV_SHA="$(git ls-remote https://github.com/opencv/opencv_zoo.git refs/heads/main | awk '{print $1}')"
echo "$OPENCV_SHA" > "$ASSETS/opencv/opencv-zoo-revision.txt"
curl -L --fail --retry 3 -o "$ASSETS/opencv/face_detection_yunet_2023mar.onnx" "https://github.com/opencv/opencv_zoo/raw/$OPENCV_SHA/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
curl -L --fail --retry 3 -o "$ASSETS/opencv/face_recognition_sface_2021dec.onnx" "https://github.com/opencv/opencv_zoo/raw/$OPENCV_SHA/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

command -v piper | tee "$EVID/piper-binary.txt"
piper --help > "$EVID/piper-help.txt" 2>&1

export FLORENCE2_MODEL_PATH="$ASSETS/florence2-base"
export DINO_MODEL_PATH="$ASSETS/dinov2-small"
export YUNET_MODEL_PATH="$ASSETS/opencv/face_detection_yunet_2023mar.onnx"
export SFACE_MODEL_PATH="$ASSETS/opencv/face_recognition_sface_2021dec.onnx"
export PIPER_FA_MODEL_PATH="$ASSETS/piper-voice/fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx"
export PIPER_FA_CONFIG_PATH="$ASSETS/piper-voice/fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx.json"
export EVID

python - <<'PY'
import os, json, hashlib, platform, sys, gc, subprocess, importlib.metadata as md
from pathlib import Path
import torch
import cv2
from transformers import AutoProcessor, AutoModelForCausalLM, AutoImageProcessor, AutoModel
from piper import PiperVoice

def sha256(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for c in iter(lambda:f.read(1024*1024),b''): h.update(c)
    return h.hexdigest()

def file_info(p):
    p=Path(p)
    return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha256(p)}

evid=Path(os.environ['EVID'])
hfmeta=json.loads((Path(os.environ['ASSETS'])/'hf-revisions.json').read_text())
report={
  'stage':'STAGE 2B.1A',
  'actualUserCost':0,
  'environment':{
    'platform':platform.platform(),
    'python':sys.version.split()[0],
    'node':subprocess.check_output(['node','--version'],text=True).strip(),
    'npm':subprocess.check_output(['npm','--version'],text=True).strip(),
    'torch':torch.__version__,
    'transformers':md.version('transformers'),
    'huggingface_hub':md.version('huggingface_hub'),
    'opencv':cv2.__version__,
    'piper_tts':md.version('piper-tts'),
  },
  'checks':{},
  'sources':{
    'florence':hfmeta['florence'],
    'dino':hfmeta['dino'],
    'piper_voice':hfmeta['piper_voice'],
    'opencv_zoo':{'repo':'opencv/opencv_zoo','revision':(Path(os.environ['ASSETS'])/'opencv/opencv-zoo-revision.txt').read_text().strip()},
    'piper_runtime':{'package':'piper-tts','version':md.version('piper-tts'),'source':'PyPI / OHF-Voice/piper1-gpl'}
  }
}

# Florence exact application-compatible loader
fp=os.environ['FLORENCE2_MODEL_PATH']
processor=AutoProcessor.from_pretrained(fp,trust_remote_code=True,local_files_only=True)
model=AutoModelForCausalLM.from_pretrained(fp,trust_remote_code=True,local_files_only=True,attn_implementation='eager').eval()
report['checks']['florence']={
  'status':'PASS','model':'microsoft/Florence-2-base','path':fp,
  'processor_class':processor.__class__.__name__,'model_class':model.__class__.__name__,
  'model_file':file_info(Path(fp)/'model.safetensors')
}
del model, processor
gc.collect()

# DINOv2 exact application-compatible loader
dp=os.environ['DINO_MODEL_PATH']
dproc=AutoImageProcessor.from_pretrained(dp,local_files_only=True)
dmodel=AutoModel.from_pretrained(dp,local_files_only=True).eval()
weights=Path(dp)/'model.safetensors'
if not weights.exists():
    weights=Path(dp)/'pytorch_model.bin'
report['checks']['dinov2']={
  'status':'PASS','model':'facebook/dinov2-small','path':dp,
  'processor_class':dproc.__class__.__name__,'model_class':dmodel.__class__.__name__,
  'model_file':file_info(weights)
}
del dmodel,dproc
gc.collect()

# OpenCV YuNet/SFace parse/load
ym=os.environ['YUNET_MODEL_PATH']; sm=os.environ['SFACE_MODEL_PATH']
det=cv2.FaceDetectorYN.create(ym,'',(320,320),0.8,0.3,5000)
rec=cv2.FaceRecognizerSF.create(sm,'')
report['checks']['yunet']={'status':'PASS','loader':'cv2.FaceDetectorYN.create','file':file_info(ym)}
report['checks']['sface']={'status':'PASS','loader':'cv2.FaceRecognizerSF.create','file':file_info(sm)}
del det,rec

# Piper runtime + voice/config load only (no synthesis in this stage)
pm=os.environ['PIPER_FA_MODEL_PATH']; pc=os.environ['PIPER_FA_CONFIG_PATH']
voice=PiperVoice.load(pm,config_path=pc,use_cuda=False)
report['checks']['piper']={
  'status':'PASS','voice':'fa_IR-amir-medium',
  'runtime':subprocess.check_output(['bash','-lc','command -v piper'],text=True).strip(),
  'model':file_info(pm),'config':file_info(pc),
  'sample_rate':voice.config.sample_rate,
  'phoneme_type':str(voice.config.phoneme_type)
}

# Path resolution used by current project implementation
for k in ['FLORENCE2_MODEL_PATH','DINO_MODEL_PATH','YUNET_MODEL_PATH','SFACE_MODEL_PATH','PIPER_FA_MODEL_PATH','PIPER_FA_CONFIG_PATH']:
    p=Path(os.environ[k])
    if not p.exists():
        raise RuntimeError(f'{k} does not resolve: {p}')
report['checks']['application_path_resolution']={'status':'PASS','env_vars':{k:os.environ[k] for k in ['FLORENCE2_MODEL_PATH','DINO_MODEL_PATH','YUNET_MODEL_PATH','SFACE_MODEL_PATH','PIPER_FA_MODEL_PATH','PIPER_FA_CONFIG_PATH']}}

(evid/'runtime-asset-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
PY

python -m pip freeze > "$EVID/pip-freeze.txt"
sha256sum "$NPMDIR/package-lock.json" > "$EVID/package-lock.sha256"
echo "STAGE2B1A_RUNTIME_ASSET_VERIFY_PASS" | tee "$EVID/final-status.txt"
rm -rf "$PWD/stage2b1a-evidence"
cp -a "$EVID" "$PWD/stage2b1a-evidence"
