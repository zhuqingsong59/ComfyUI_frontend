npm run test
cp -r dist/ comfyui-frontend/
tar -zcvf comfyui.tar.gz comfyui-frontend/
scp comfyui.tar.gz dabi:
rm -rf comfyui-frontend
rm comfyui.tar.gz