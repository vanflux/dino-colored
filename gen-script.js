
const imageDataURI = require('image-data-uri');
const fs = require('fs');

const config = {
  texture1xFile: './texture-1x.png',
  lightBgColor: 'rgb(240, 240, 180)',
  darkBgColor: 'rgb(32, 32, 40)',
}

function generate(config) {
  console.log('Generating texture encoded data...');
  let textureBuffer = fs.readFileSync(config.texture1xFile, null);
  let textureEncodedData = imageDataURI.encode(textureBuffer, 'PNG');

  console.log('Generating script...');
  let scriptCode = '(' + script.toString() + ')()';
  scriptCode = scriptCode.replace(/\{__TEX_ENCODED_DATA__\}/, textureEncodedData)
  scriptCode = scriptCode.replace(/\{__LIGHT_BG_COLOR__\}/, config.lightBgColor)
  scriptCode = scriptCode.replace(/\{__DARK_BG_COLOR__\}/, config.darkBgColor)

  console.log('Saving...');
  fs.writeFileSync('script.js', scriptCode);
}

function script() {
  const detour = (fnName, detour) => {
    const originalFn = Runner.prototype[fnName];
    Runner.prototype[fnName] = function (...args) {
      if (detour.call(this, args)) {
        return originalFn.call(this, args)
      }
    }
  }

  const removeOutlineStyle = () => {
    document.getElementsByClassName('runner-canvas')[0].parentElement.style.outline = 'none';
  }

  const changeLightBgColor = (newColor) => {
    Array.from(document.styleSheets).forEach(sheet => {
      const rules = sheet.cssRules || sheet.rules;
      Array.from(rules).forEach(rule => {
        if (rule.media && rule.conditionText == '(prefers-color-scheme: dark)') {
          const subRules = rule.cssRules || rule.rules;
          Array.from(subRules).forEach(subRule => {
            if (subRule.selectorText == '.offline.inverted body') {
              subRule.style.setProperty('background-color', newColor);
            }
          })
        }
      });
    });
  }

  const changeDarkBgColor = (newColor) => {
    Array.from(document.styleSheets).forEach(sheet => {
      const rules = sheet.cssRules || sheet.rules;
      Array.from(rules).forEach(rule => {
        if (rule.selectorText == 'body') {
          rule.style.setProperty('--google-gray-900', newColor);
        }
      });
    });
  }

  const changeTextures = (newTextureData) => {
    const offlineResources1x = document.getElementById('offline-resources-1x');
    const customTexture = newTextureData;
    offlineResources1x.src = customTexture;
    let generated = false;
    offlineResources1x.onload = () => {
      if (generated) return;
      generated = true;
      const canvas = document.createElement('canvas');
      let { width, height } = offlineResources1x;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(offlineResources1x, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i];
        imageData.data[i + 1] = 255 - imageData.data[i + 1];
        imageData.data[i + 2] = 255 - imageData.data[i + 2];
      }
      ctx.putImageData(imageData, 0, 0);
      offlineResources1x.src = canvas.toDataURL();
    }
  }

  // Bypass gameover
  //detour('gameOver', () => console.log('Gameover call prevented...'));
  removeOutlineStyle();
  changeLightBgColor('{__LIGHT_BG_COLOR}');
  changeDarkBgColor('{__DARK_BG_COLOR__}');
  changeTextures('{__TEX_ENCODED_DATA__}');
}

generate(config);