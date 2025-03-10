const fs = require("fs");
const path = require("path");

function checkHuskyPermissions() {
  const huskyPath = path.join(".husky", "pre-commit");

  try {
    if (process.platform === "win32") {
      console.log(
        "Windows detectado - Execute scripts/setup-security.ps1 como administrador se necessário"
      );
    } else {
      fs.chmodSync(huskyPath, "755");
      console.log("Permissões do Husky configuradas para Linux/Mac");
    }
  } catch (error) {
    console.warn(
      "Aviso: Não foi possível configurar permissões automaticamente"
    );
    console.warn("Execute o script de segurança manualmente se necessário");
  }
}

checkHuskyPermissions();
