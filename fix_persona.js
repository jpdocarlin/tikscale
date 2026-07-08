const fs = require('fs');
const file = 'src/pages/CriarPersona.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const incResult = await incrementUsage\('personas'\);/,
  `let usedPaidForThisGen = false;
    if (!isAdmin) {
      const incResult = await incrementUsage('personas');
      if (!incResult.allowed) {
        setIsGenerating(false);
        if (incResult.reason === 'no_credits') {
          setShowBuyModal(true);
        } else {
          toast({ title: "Limite atingido", description: "Sem gerações disponíveis.", variant: "destructive" });
        }
        return;
      }
      usedPaidForThisGen = incResult.usedPaid;
    }`
);

// Remove the old checks that we just replaced
content = content.replace(
  /if \(!incResult\.allowed\) \{[\s\S]*?return;\n    \}\n    const usedPaidForThisGen = incResult\.usedPaid;/,
  ''
);

// Fix 401 continue bug
content = content.replace(
  /if \(freshToken\) currentToken = freshToken;\n\s+lastError = "Sessão expirada";\n\s+continue;/,
  `if (freshToken) currentToken = freshToken;
            lastError = "Sessão expirada";
            if (attempt === maxRetries) throw new Error(lastError);
            continue;`
);

// Fix refund logic
content = content.replace(
  /await refundCredit\('personas', usedPaidForThisGen\);/,
  `if (!isAdmin) await refundCredit('personas', usedPaidForThisGen);`
);

fs.writeFileSync(file, content);
