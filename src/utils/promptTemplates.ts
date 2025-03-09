export const SecurityPrompts = {
    sqlInjection: (code: string) => `
        Analise este código em busca de vulnerabilidades SQL Injection:
        ${code}
        
        Forneça uma análise detalhada e sugestões de correção.
    `,
    
    xss: (code: string) => `
        Analise este código em busca de vulnerabilidades XSS (Cross-Site Scripting):
        ${code}
        
        Forneça uma análise detalhada e sugestões de correção.
    `
};

export const CodeGenerationPrompts = {
    pythonFunction: (description: string) => `
        Gere uma função Python que:
        ${description}
        
        Inclua:
        1. Docstring
        2. Tipos de parâmetros
        3. Exemplo de uso
    `
};

export const RefactoringPrompts = {
    extractMethod: (code: string, selection: string) => `
        Refatore este código extraindo a seleção para um método:
        
        Código completo:
        ${code}
        
        Seleção para extrair:
        ${selection}
        
        Forneça:
        1. Nome sugerido para o método
        2. Parâmetros necessários
        3. Código refatorado
    `,

    improveReadability: (code: string) => `
        Melhore a legibilidade deste código:
        ${code}
        
        Foque em:
        1. Nomes de variáveis mais descritivos
        2. Estrutura do código
        3. Documentação inline
    `
};

export const DocumentationPrompts = {
    generateDocs: (code: string) => `
        Gere documentação para este código:
        ${code}
        
        Inclua:
        1. Descrição geral
        2. Parâmetros
        3. Retorno
        4. Exemplos de uso
    `
};
