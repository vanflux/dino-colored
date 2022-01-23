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
  changeLightBgColor('rgb(240, 240, 180)');
  changeDarkBgColor('rgb(32, 32, 40)');
  changeTextures('data:image/PNG;base64,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');
})()