(function script() {
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
  changeDarkBgColor('rgb(32, 32, 40)');
  changeTextures('data:image/PNG;base64,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');
})()