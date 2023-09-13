function defineMinProgressBar(largeText) {
  const divAccessibility = document.querySelector(".a11y-levels");

  if (largeText) {
    divAccessibility.classList.add("large-text");
  } else {
    divAccessibility.classList.remove("large-text");
  }
}

function calculateRelativeLuminance(hexValue) {
  const R = parseInt(hexValue.slice(1, 3), 16);
  const G = parseInt(hexValue.slice(3, 5), 16);
  const B = parseInt(hexValue.slice(5, 7), 16);

  const R1 = R / 255;
  const G1 = G / 255;
  const B1 = B / 255;

  const R2 = R1 <= 0.03928 ? R1 / 12.92 : (((R1 + 0.055) / 1.055) ** 2.4);
  const G2 = G1 <= 0.03928 ? G1 / 12.92 : (((G1 + 0.055) / 1.055) ** 2.4);
  const B2 = B1 <= 0.03928 ? B1 / 12.92 : (((B1 + 0.055) / 1.055) ** 2.4);

  const L = R2 * 0.2126 + G2 * 0.7152 + B2 * 0.0722;

  return L;
};

function calculateContrastRatio(bgLuminance, fontLuminance) {
  const maxRatio = 21;

  const boldText = document.querySelector("#bold").checked;
  const fontSize = parseInt(document.querySelector("#size").value, 10) / 1.3333333;
  const largeText = (fontSize >= 18 || (fontSize >= 14 && boldText));
  defineMinProgressBar(largeText);

  const minRatioAA = largeText ? 3 : 4.5;
  const minRatioAAA = largeText ? 4.5 : 7;
  const lighter = bgLuminance > fontLuminance ? bgLuminance : fontLuminance;
  const darker = bgLuminance < fontLuminance ? bgLuminance : fontLuminance;
  const contrastRatio = (lighter + 0.05) / (darker + 0.05);
  const percentAccessible = Math.round(((contrastRatio - 1) / (maxRatio - 1)) * 100);

  return({ 
    contrastAA: contrastRatio >= minRatioAA,
    contrastAAA: contrastRatio >= minRatioAAA,
    percent: percentAccessible
  });
};

function updateContrastRatio() {
  const bgHexColor = document.querySelector("#color-1").value;
  const bgLuminance = calculateRelativeLuminance(bgHexColor);
  const fontHexColor = document.querySelector("#color-2").value;
  const fontLuminance = calculateRelativeLuminance(fontHexColor);
  const accessibilityLevel = document.querySelector("#accessibility-level");
  const contrastRatio = calculateContrastRatio(bgLuminance, fontLuminance);
  
  accessibilityLevel.value = contrastRatio.percent;
  accessibilityLevel.textContent = contrastRatio.percent+"%";

  if (contrastRatio.percent >= 75) {
    accessibilityLevel.classList = ["percent75"];
  } else if (contrastRatio.percent >= 50) {
    accessibilityLevel.classList = ["percent50"];
  } else if (contrastRatio.percent >= 25) {
    accessibilityLevel.classList = ["percent25"];
  } else {
    accessibilityLevel.classList = ["percent0"];
  }
  
  const levelAA = document.querySelector(".a11y-levels #level-aa");
  const levelAAA = document.querySelector(".a11y-levels #level-aaa");

  if (contrastRatio.contrastAAA) {
    levelAA.classList = ["yes"]
    levelAAA.classList = ["yes"]
  } else {
    levelAAA.classList = ["no"]
    
    if (contrastRatio.contrastAA) {
      levelAA.classList = ["yes"]
    } else {
      levelAA.classList = ["no"]
    }
  }
}

function become6digits(hex3) {
  return `${hex3[0]}${hex3[1]}${hex3[1]}${hex3[2]}${hex3[2]}${hex3[3]}${hex3[3]}`;
}

function index() {
  const result = document.querySelector("#result");
  const fontSize = document.querySelector("#size");
  
  fontSize.addEventListener("change", (e) => {
    result.style.fontSize = e.target.value+"px";
    updateContrastRatio();
  });
  
  fontSize.addEventListener("blur", (e) => {
    if (parseInt(e.target.value) < 16) {
      fontSize.value = 16;
      result.style.fontSize = "16px";
    } else if (parseInt(e.target.value) > 30) {
      fontSize.value = 30;
      result.style.fontSize = "30px";
    }
  });

  document.querySelector("#bold").addEventListener("change", (e) => {
    if (e.target.checked) {
      result.style.fontWeight = "bold";
    } else {
      result.style.fontWeight = "normal";
    }
    updateContrastRatio();
  });

  document.querySelector("#color-1").addEventListener("change", (e) => {
    const input = document.querySelector("#color-1-b");

    result.style.backgroundColor = e.target.value;
    input.value = e.target.value;
    updateContrastRatio();
  });

  document.querySelector("#color-2").addEventListener("change", (e) => {
    const input = document.querySelector("#color-2-b");

    result.style.color = e.target.value;
    input.value = e.target.value;
    updateContrastRatio();
  });

  document.querySelector("#color-1-b").addEventListener("keyup", (e) => {
    let color = e.target.value;
    const validColor = !!color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g);
    const colorPicker = document.querySelector("#color-1");
   
    if (validColor) {

      if(color.length < 6) {
        color = become6digits(color);
      }

      colorPicker.value = color;
      result.style.backgroundColor = color;
      updateContrastRatio();
    }
  });

  document.querySelector("#color-2-b").addEventListener("keyup", (e) => {
    let color = e.target.value;
    const validColor = !!color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g);
    const colorPicker = document.querySelector("#color-2");
   
    if (validColor) {

      if(color.length < 6) {
        color = become6digits(color);
      }

      colorPicker.value = color;
      result.style.color = color;
      updateContrastRatio();
    }
  });
};

index();
