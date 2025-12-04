

import { SolutionData, User, FixedCostItem } from './types';

// --- USERS ---
export const USERS: User[] = [
  {
    id: 'u0',
    username: 'Leandro',
    password: '123',
    name: 'Leandro',
    role: 'Diretor Comercial',
    bio: 'Especialista em estratégias de crescimento e soluções de RH de alto impacto.',
    email: 'leandro@metarh.com.br',
    phone: '(11) 99999-8888',
    linkedin: 'linkedin.com/in/leandro-metarh',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    isAdmin: true
  },
  {
    id: 'u1',
    username: 'admin',
    password: '123',
    name: 'Consultor METARH',
    role: 'Consultor Sênior',
    bio: 'Especialista em soluções estratégicas de RH com foco em inovação e cultura organizacional.',
    email: 'comercial@metarh.com.br',
    phone: '(11) 99999-9999',
    linkedin: 'linkedin.com/company/metarh',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359-7014db8778f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'u2',
    username: 'julia.silva',
    password: 'metarh2025',
    name: 'Júlia Silva',
    role: 'Consultora de Negócios',
    bio: 'Apaixonada por conectar talentos e transformar organizações através de pessoas.',
    email: 'julia.silva@metarh.com.br',
    phone: '(11) 98765-4321',
    linkedin: 'linkedin.com/in/juliasilva',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'u3',
    username: 'marcos.souza',
    password: 'metarh2025',
    name: 'Marcos Souza',
    role: 'Especialista Tech Recruiter',
    bio: 'Focado em recrutamento de alta performance para tecnologia e inovação.',
    email: 'marcos.souza@metarh.com.br',
    phone: '(11) 91234-5678',
    linkedin: 'linkedin.com/in/marcossouza'
  }
];

export const SOLUTIONS_DATA: SolutionData[] = [
  {
    id: 'business-hunting',
    code: 'Hunting',
    solutionPackage: 'Business',
    name: 'Hunting',
    description: 'Processo conduzido por consultores especializados, com busca ativa de profissionais qualificados para vagas estratégicas. Envolve entrevistas, análise de currículos e avaliação de aderência à cultura organizacional e às necessidades do cliente.',
    benefits: ['Identifica talentos de alto desempenho que dificilmente seriam encontrados em processos tradicionais.', 'Aumenta a assertividade na contratação de profissionais estratégicos.', 'Alinha candidatos à cultura e às expectativas da empresa.', 'Reduz o tempo necessário para preencher posições críticas.'],
    publicNeeds: ['Acesso a Talentos Estratégicos e Escasso.', 'O RH interno pode não ter tempo ou a rede de contatos necessária.', 'Erros na contratação de um profissional estratégico são extremamente caros.'],
    areasInvolved: ['Time de Recrutamento e Seleção', 'Liderança para gestão do projeto.'],
    toolsUsed: ['Sistema de Recrutamento e Seleção.', 'Linkedin Recruiter', 'PowerBi (performance e indicadores).'],
    laborType: 'Não se aplica',
    sla: 'O SLA dependerá da posição e seu nível estratégico.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental, garantindo contratações que agregam valor estratégico e resultados concretos para a empresa.'
  },
  {
    id: 'business-assessment',
    code: 'Assessment',
    solutionPackage: 'Business',
    name: 'Assessment',
    description: 'Assessment é uma ferramenta de mapeamento que apoia profissionais em momentos de recolocação ou mudança de carreira. Por meio de avaliações técnicas e comportamentais, oferece clareza sobre pontos fortes, competências a desenvolver e potenciais caminhos de atuação.',
    benefits: ['Apoia profissionais em momentos de transição e recolocação de carreira.', 'Proporciona autoconhecimento para decisões mais assertivas.', 'Identifica pontos fortes e oportunidades de desenvolvimento.', 'Oferece clareza e direcionamento para próximos passos profissionais.'],
    publicNeeds: ['Autoconhecimento profissional.', 'Direcionamento de carreira.', 'Tomada de decisão mais segura.', 'Alinhamento com o mercado.', 'Planejamento estratégico.'],
    areasInvolved: ['R&S'],
    toolsUsed: ['DISC Extended', 'Entrevista por Competência'],
    laborType: 'Não se aplica',
    sla: 'Essencial: 5 a 7 dias. Completo: 10 a 12 dias. Executivo: 12 a 15 dias.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental, garantindo contratações que agregam valor estratégico e resultados concretos para a empresa.'
  },
  {
    id: 'business-map',
    code: 'Mapeamento de Mercado',
    solutionPackage: 'Business',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento e seleção, por meio de análises qualitativas e quantitativas da densidade e distribuição de profissionais em determinada função ou segmento dentro de uma localidade específica.',
    benefits: ['Permite prever e planejar a melhor estratégia de atração.', 'Auxilia na identificação de mercados com maior disponibilidade de talentos.', 'Oferece um diagnóstico da capacidade da empresa em absorver e reter profissionais qualificados.', 'Traz mais assertividade para decisões estratégicas de contratação.'],
    publicNeeds: ['Entender o que os concorrentes diretos e indiretos estão buscando.', 'Para empresas é crucial entender a densidade de clientes potenciais.', 'Otimizar os canais de recrutamento.', 'Obter inteligência de mercado acionável.'],
    areasInvolved: ['Recursos Humanos (RH) / Aquisição de Talentos.', 'Estratégia Corporativa / Planejamento de Negócios.', 'Comercial / Vendas e Marketing.', 'Inteligência de Mercado.'],
    toolsUsed: ['Plataformas de Inteligência de Talentos.', 'Sistemas de ATS e Ferramentas de Sourcing.', 'Ferramentas de Web Scraping e Análise de Dados.', 'Bancos de Dados Setoriais e Relatórios de Consultorias.'],
    laborType: 'Não se Aplica',
    sla: 'Mapeamento Inicial: 4 a 8 semanas. Vagas: Contínuo.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental, garantindo contratações que agregam valor estratégico e resultados concretos para a empresa.'
  },
  {
    id: 'business-rs',
    code: 'R&S',
    solutionPackage: 'Business',
    name: 'R&S',
    description: 'Processo estruturado para identificar, avaliar e contratar candidatos qualificados, alinhados às necessidades da organização. Envolve a definição de perfil pelo responsável da posição, a busca de talentos no mercado, a avaliação de competências e a escolha do profissional.',
    benefits: ['Atrai profissionais mais aderentes ao perfil da vaga e à cultura organizacional.', 'Garante maior assertividade nas contratações, reduzindo turnover.', 'Alinha as contratações às estratégias e objetivos do negócio.', 'Otimiza tempo e recursos do RH interno.'],
    publicNeeds: ['Assertividade no perfil', 'Acesso a mais talentos', 'Processo estruturado e objetivo', 'Agilidade sem perder qualidade', 'Avaliação técnica e comportamental mais profunda'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D / Desenvolvimento', 'Marketing / Employer Branding', 'Tecnologia / TI', 'Jurídico / Compliance', 'Gestores das áreas requisitantes'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs, LinkedIn...', 'Triagem e Avaliação: ATS, Testes comportamentais...', 'Dinâmicas e Entrevistas: Zoom, Teams...', 'PowerBi: indicadores e gestão da performance.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental, garantindo contratações que agregam valor estratégico e resultados concretos para a empresa.'
  },
  {
    id: 'pharma-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Pharma Recruiter',
    name: 'Gestão Terceiros',
    description: 'Permite às empresas contar com os benefícios da terceirização sem assumir a gestão direta dos funcionários. Oferece duas modalidades contratuais: tempo indeterminado e tempo determinado.',
    benefits: ['Redução da responsabilidade direta sobre a gestão de pessoas.', 'Flexibilidade para atender demandas temporárias ou contínuas.', 'Adequação ao tipo de necessidade da empresa.', 'Agilidade na contratação de profissionais qualificados.'],
    publicNeeds: ['Redução da carga administrativa e burocrática do RH.', 'Manter um serviço contínuo sem o vínculo empregatício direto.', 'Atender a demandas específicas, picos de produção ou projetos pontuais.'],
    areasInvolved: ['Recrutamento e Seleção.', 'Admissão e Contratação.', 'Departamento Pessoal.', 'Departamento Jurídico.', 'Customer Service e Experience.'],
    toolsUsed: ['Software de gestão administrativa de pessoas.', 'ATS.', 'Plataformas de Recrutamento e Seleção.', 'PowerBi.', 'Softwares de Admissão Digital.', 'Ferramentas de Controle de Ponto.'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'pharma-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Pharma Recruiter',
    name: 'Gestão Temporários',
    description: 'Modalidade de contratação em que o trabalhador atua para reforçar o quadro de profissionais em situações extraordinárias ou na substituição de efetivos, como em coberturas de férias ou licenças.',
    benefits: ['Garante continuidade das atividades sem prejuízo operacional.', 'Atende demandas temporárias de forma ágil e segura.', 'Possibilidade de contratação por até 270 dias, com extensão.'],
    publicNeeds: ['Cobertura de ausências.', 'Reforço em períodos de pico.', 'Agilidade de contratação.', 'Flexibilidade contratual.', 'Redução de risco trabalhista.', 'Testar o profissional antes de efetivar.'],
    areasInvolved: ['Recrutamento e Seleção.', 'Admissão e Contratação.', 'Departamento Pessoal.', 'Departamento Jurídico.', 'Customer Service e Experience.'],
    toolsUsed: ['Software de gestão administrativa de pessoas.', 'ATS.', 'Plataformas de Recrutamento e Seleção.', 'PowerBi.', 'Softwares de Admissão Digital.', 'Ferramentas de Controle de Ponto.'],
    laborType: 'Temporários',
    sla: 'Não se Aplica',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'pharma-rs',
    code: 'R&S',
    solutionPackage: 'Pharma Recruiter',
    name: 'R&S',
    description: 'Processo estruturado para identificar, avaliar e contratar candidatos qualificados, alinhados às necessidades da organização. Envolve a definição de perfil, busca, avaliação e escolha do profissional.',
    benefits: ['Atrai profissionais mais aderentes ao perfil da vaga.', 'Garante maior assertividade nas contratações.', 'Alinha as contratações às estratégias.', 'Otimiza tempo e recursos do RH interno.'],
    publicNeeds: ['Assertividade no perfil', 'Acesso a mais talentos', 'Processo estruturado e objetivo', 'Agilidade sem perder qualidade', 'Avaliação técnica e comportamental mais profunda'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D / Desenvolvimento', 'Marketing / Employer Branding', 'Tecnologia / TI', 'Jurídico / Compliance'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs...', 'Triagem e Avaliação: ATS, Testes comportamentais...', 'Dinâmicas e Entrevistas: Zoom, Teams...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'pharma-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Pharma Recruiter',
    name: 'Célula Dedicada',
    description: 'Estratégia que consiste em transferir parte ou todo o processo de recrutamento da empresa para uma equipe especializada, especialmente em projetos de médio e grande porte, com longa duração.',
    benefits: ['Apoio especializado para projetos complexos e de longo prazo.', 'Aumento da eficiência e produtividade.', 'Redução de custos operacionais.', 'Melhoria na experiência e satisfação dos colaboradores.', 'Liberação da equipe interna de RH.'],
    publicNeeds: ['Volume de vagas acima da capacidade interna', 'Necessidade de especialização', 'Escalabilidade e velocidade', 'Padronização e melhoria de processo', 'Redução de custos de turnover'],
    areasInvolved: ['Liderança da Célula', 'Equipe de Recrutamento e Seleção', 'Time de Sourcing / Hunting', 'People Analytics'],
    toolsUsed: ['Ferramentas ATS (Gupy, Selecty).', 'Ferramentas de Hunting (Vagas.com, Pandapé, Linkedin Recruiter).', 'PowerBi.', 'CRM.', 'Avaliações comportamentais.'],
    laborType: 'Não se Aplica',
    sla: 'Acordo composto por SLA de prazo e SLA de performance.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'pharma-map',
    code: 'Mapeamento de Mercado',
    solutionPackage: 'Pharma Recruiter',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento e seleção, por meio de análises qualitativas e quantitativas da densidade e distribuição de profissionais em determinada função ou segmento dentro de uma localidade específica.',
    benefits: ['Permite prever e planejar a melhor estratégia de atração.', 'Auxilia na identificação de mercados com maior disponibilidade.', 'Oferece um diagnóstico da capacidade da empresa.', 'Traz mais assertividade para decisões estratégicas.'],
    publicNeeds: ['Entender o que os concorrentes diretos e indiretos estão buscando.', 'Entender a densidade de clientes potenciais.', 'Otimizar os canais de recrutamento.', 'Obter inteligência de mercado acionável.'],
    areasInvolved: ['RH / Aquisição de Talentos.', 'Estratégia Corporativa.', 'Comercial / Vendas e Marketing.', 'Inteligência de Mercado.'],
    toolsUsed: ['Plataformas de Inteligência de Talentos.', 'Sistemas de ATS e Sourcing.', 'Web Scraping.', 'Bancos de Dados Setoriais.'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'pharma-marketing',
    code: 'Marketing Dedicado',
    solutionPackage: 'Pharma Recruiter',
    name: 'Marketing Dedicado',
    description: 'Conjunto de estratégias de marketing voltadas para atração, treinamento e retenção de talentos, incluindo desenvolvimento da marca empregadora (employer branding), publicidade em mídias sociais e criação de conteúdo.',
    benefits: ['Aumenta a atratividade da empresa para candidatos qualificados.', 'Fortalece a marca empregadora.', 'Facilita a captação e retenção de talentos estratégicos.', 'Melhora a comunicação e o engajamento.'],
    publicNeeds: ['Reforçar um processo de atração', 'Reverberar sua marcar empregadora', 'Continuidade de Branding e identidade visual nos processo'],
    areasInvolved: ['Marketing', 'Redatora (terceirizada)'],
    toolsUsed: ['RDStation', 'Adobe Creative Cloud', 'Linkedin Ads', 'Meta Ads', 'Google Ads', 'Gravação (estúdio)'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'pharma-rpo',
    code: 'RPO',
    solutionPackage: 'Pharma Recruiter',
    name: 'RPO',
    description: 'Serviço em que a empresa transfere parte ou todo o processo de recrutamento e seleção para uma consultoria especializada. O RPO atua como uma extensão do RH, assumindo atividades como triagem de currículos, entrevistas e alocação.',
    benefits: ['Garante processos seletivos de alto nível com maior assertividade.', 'Reduz custos operacionais.', 'Oferece velocidade e agilidade.', 'Libera o RH interno para atuar em ações mais estratégicas.'],
    publicNeeds: ['Escala e agilidade no recrutamento', 'Foco estratégico do RH', 'Consistência e padronização do processo', 'Acesso a talentos e mercados especializados', 'Redução de custos e riscos'],
    areasInvolved: ['RH / Talent Acquisition', 'Tecnologia / TI', 'Jurídico / Compliance', 'Gestores das áreas requisitantes', 'Equipe RPO (Externa)'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs...', 'Triagem e Avaliação: ATS, Testes...', 'Dinâmicas e Entrevistas: Zoom, Teams...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Depende do volume e complexidade da vaga.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo que as empresas contem com os talentos certos para impulsionar resultados e manter a excelência operacional.'
  },
  {
    id: 'staffing-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Staffing',
    name: 'Gestão Terceiros',
    description: 'Permite às empresas contar com os benefícios da terceirização sem assumir a gestão direta dos funcionários.',
    benefits: ['Redução da responsabilidade direta sobre a gestão de pessoas.', 'Flexibilidade para atender demandas temporárias ou contínuas.', 'Adequação ao tipo de necessidade da empresa.', 'Agilidade na contratação.'],
    publicNeeds: ['Redução da carga administrativa.', 'Manter serviço contínuo sem vínculo direto.', 'Atender demandas específicas e picos.'],
    areasInvolved: ['Recrutamento e Seleção.', 'Admissão e Contratação.', 'Departamento Pessoal.', 'Departamento Jurídico.', 'Customer Service.'],
    toolsUsed: ['Software de gestão administrativa.', 'ATS.', 'Plataformas de Recrutamento.', 'PowerBi.', 'Softwares de Admissão Digital.', 'Ferramentas de Controle de Ponto.'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais em volume até cargos especialistas, garantindo assertividade técnica e comportamental, além de flexibilidade para escalar equipes conforme a demanda do negócio.'
  },
  {
    id: 'staffing-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Staffing',
    name: 'Gestão Temporários',
    description: 'Modalidade de contratação em que o trabalhador atua para reforçar o quadro de profissionais em situações extraordinárias ou na substituição de efetivos.',
    benefits: ['Garante continuidade das atividades.', 'Atende demandas temporárias de forma ágil.', 'Possibilidade de contratação por até 270 dias, com extensão.'],
    publicNeeds: ['Cobertura de ausências.', 'Reforço em períodos de pico.', 'Agilidade de contratação.', 'Flexibilidade contratual.', 'Redução de risco.', 'Testar profissional.'],
    areasInvolved: ['Recrutamento e Seleção.', 'Admissão e Contratação.', 'Departamento Pessoal.', 'Departamento Jurídico.', 'Customer Service.'],
    toolsUsed: ['Software de gestão administrativa.', 'ATS.', 'Plataformas de Recrutamento.', 'PowerBi.', 'Softwares de Admissão Digital.', 'Ferramentas de Controle de Ponto.'],
    laborType: 'Temporários',
    sla: 'Não se Aplica',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais em volume até cargos especialistas, garantindo assertividade técnica e comportamental, além de flexibilidade para escalar equipes conforme a demanda do negócio.'
  },
  {
    id: 'staffing-rs',
    code: 'R&S',
    solutionPackage: 'Staffing',
    name: 'R&S',
    description: 'Processo estruturado para identificar, avaliar e contratar candidatos qualificados, alinhados às necessidades da organização.',
    benefits: ['Atrai profissionais mais aderentes.', 'Garante maior assertividade.', 'Alinha as contratações às estratégias.', 'Otimiza tempo e recursos do RH interno.'],
    publicNeeds: ['Assertividade no perfil', 'Acesso a mais talentos', 'Processo estruturado e objetivo', 'Agilidade sem perder qualidade'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D / Desenvolvimento', 'Marketing / Employer Branding', 'Tecnologia / TI', 'Jurídico / Compliance'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs...', 'Triagem e Avaliação: ATS, Testes...', 'Dinâmicas e Entrevistas: Zoom, Teams...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 5 a 7 dias úteis para a entrega dos perfis.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais em volume até cargos especialistas, garantindo assertividade técnica e comportamental, além de flexibilidade para escalar equipes conforme a demanda do negócio.'
  },
  {
    id: 'staffing-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Staffing',
    name: 'Célula Dedicada',
    description: 'Estratégia que consiste em transferir parte ou todo o processo de recrutamento da empresa para uma equipe especializada.',
    benefits: ['Apoio especializado para projetos complexos.', 'Aumento da eficiência.', 'Redução de custos operacionais.', 'Melhoria na experiência do colaborador.', 'Liberação do RH interno.'],
    publicNeeds: ['Volume de vagas acima da capacidade.', 'Necessidade de especialização.', 'Escalabilidade e velocidade.', 'Padronização de processo.', 'Redução de custos de turnover.'],
    areasInvolved: ['Liderança da Célula', 'Equipe de R&S', 'Time de Sourcing', 'People Analytics'],
    toolsUsed: ['Ferramentas ATS.', 'Ferramentas de Hunting.', 'PowerBi.', 'CRM.', 'Avaliações comportamentais.'],
    laborType: 'Não se Aplica',
    sla: 'Acordo composto por SLA de prazo e SLA de performance.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais em volume até cargos especialistas, garantindo assertividade técnica e comportamental, além de flexibilidade para escalar equipes conforme a demanda do negócio.'
  },
  {
    id: 'staffing-map',
    code: 'Mapeamento de Mercado',
    solutionPackage: 'Staffing',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento e seleção, por meio de análises qualitativas e quantitativas.',
    benefits: ['Permite prever e planejar estratégia de atração.', 'Auxilia na identificação de mercados.', 'Oferece diagnóstico da capacidade da empresa.', 'Traz assertividade para decisões estratégicas.'],
    publicNeeds: ['Entender concorrência e vagas.', 'Entender densidade de clientes.', 'Otimizar canais de recrutamento.', 'Obter inteligência de mercado.'],
    areasInvolved: ['RH / Aquisição de Talentos.', 'Estratégia Corporativa.', 'Comercial / Marketing.', 'Inteligência de Mercado.'],
    toolsUsed: ['Plataformas de Inteligência de Talentos.', 'Sistemas de ATS e Sourcing.', 'Web Scraping.', 'Bancos de Dados Setoriais.'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais em volume até cargos especialistas, garantindo assertividade técnica e comportamental, além de flexibilidade para escalar equipes conforme a demanda do negócio.'
  },
  {
    id: 'staffing-rpo',
    code: 'RPO',
    solutionPackage: 'Staffing',
    name: 'RPO',
    description: 'Serviço em que a empresa transfere parte ou todo o processo de recrutamento e seleção para uma consultoria especializada.',
    benefits: ['Garante processos seletivos de alto nível.', 'Reduz custos operacionais.', 'Oferece velocidade e agilidade.', 'Libera o RH interno.'],
    publicNeeds: ['Escala e agilidade.', 'Foco estratégico do RH.', 'Consistência e padronização.', 'Acesso a talentos especializados.', 'Redução de custos e riscos.'],
    areasInvolved: ['RH / Talent Acquisition', 'Tecnologia / TI', 'Jurídico / Compliance', 'Gestores', 'Equipe RPO'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs...', 'Triagem e Avaliação: ATS, Testes...', 'Dinâmicas e Entrevistas...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Depende do volume e complexidade da vaga.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais em volume até cargos especialistas, garantindo assertividade técnica e comportamental, além de flexibilidade para escalar equipes conforme a demanda do negócio.'
  },
  {
    id: 'talent-estagio',
    code: 'Vagas pontuais de Estágio',
    solutionPackage: 'Talent',
    name: 'Vagas pontuais de Estágio',
    description: 'Serviço de recrutamento e seleção de estagiários para empresas que buscam estudantes de ensino superior ou cursos tecnólogos.',
    benefits: ['Permite acessar talentos em formação de forma rápida.', 'Garante candidatos alinhados ao perfil.', 'Reduz tempo e esforço do RH.', 'Facilita a integração de jovens talentos.'],
    publicNeeds: ['Atrair talentos qualificados e diversos.', 'Fortalecer marca empregadora.', 'Processo estruturado.', 'Agilidade e volume.', 'Construir pipeline de talento estratégico.'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D / Desenvolvimento', 'Marketing / Employer Branding', 'Tecnologia / TI', 'Jurídico / Compliance'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs, CIEE...', 'Triagem e Avaliação: ATS, Testes...', 'Dinâmicas e Entrevistas...'],
    laborType: 'Estágio',
    sla: '15 a 25 dias entre a abertura e o fechamento.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos que buscam sua primeira oportunidade e conecta-os às empresas de forma estruturada e estratégica. Conta com profissionais especializados nesse tipo de recrutamento.'
  },
  {
    id: 'talent-trainee',
    code: 'Vagas pontuais Trainee',
    solutionPackage: 'Talent',
    name: 'Vagas pontuais Trainee',
    description: 'Serviço de recrutamento e seleção de trainees, voltado a pessoas no último ano da graduação ou formadas há até 3 anos.',
    benefits: ['Identifica jovens talentos com potencial para cargos estratégicos.', 'Alinha candidatos às necessidades e trilhas.', 'Aumenta assertividade nas contratações.', 'Fortalece sucessão e planejamento de carreira.'],
    publicNeeds: ['Atrair talentos qualificados e diversos.', 'Fortalecer marca empregadora.', 'Processo estruturado.', 'Agilidade e volume.', 'Pipeline de talento estratégico.'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D / Desenvolvimento', 'Marketing / Employer Branding', 'Tecnologia / TI', 'Jurídico / Compliance'],
    toolsUsed: ['Atração e Divulgação: Gupy, 99Jobs...', 'Triagem e Avaliação: ATS, Testes...', 'Dinâmicas e Entrevistas...'],
    laborType: 'CLT',
    sla: '15 a 25 dias entre a abertura e o fechamento.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos que buscam sua primeira oportunidade e conecta-os às empresas de forma estruturada e estratégica. Conta com profissionais especializados nesse tipo de recrutamento.'
  },
  {
    id: 'talent-map',
    code: 'Mapeamento de Mercado',
    solutionPackage: 'Talent',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento e seleção, por meio de análises qualitativas e quantitativas.',
    benefits: ['Permite prever e planejar estratégia.', 'Auxilia na identificação de mercados.', 'Oferece diagnóstico da capacidade.', 'Traz assertividade.'],
    publicNeeds: ['Entender concorrência.', 'Entender densidade de clientes.', 'Otimizar canais.', 'Inteligência de mercado acionável.'],
    areasInvolved: ['RH / Aquisição de Talentos.', 'Estratégia Corporativa.', 'Comercial / Marketing.', 'Inteligência de Mercado.'],
    toolsUsed: ['Plataformas de Inteligência.', 'ATS e Sourcing.', 'Web Scraping.', 'Bancos de Dados.'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos que buscam sua primeira oportunidade e conecta-os às empresas de forma estruturada e estratégica. Conta com profissionais especializados nesse tipo de recrutamento.'
  },
  {
    id: 'talent-programas',
    code: 'Programas de Estágio/Trainee',
    solutionPackage: 'Talent',
    name: 'Programas de Estágio/Trainee',
    description: 'Programa de estágio/trainee que envolve atração de candidatos, employer branding, triagem e avaliação, além do acompanhamento dos aprovados.',
    benefits: ['Atrai candidatos qualificados e alinhados à cultura.', 'Fortalece a marca empregadora.', 'Permite acompanhar desempenho e desenvolvimento.', 'Proporciona documentação estruturada de feedbacks.'],
    publicNeeds: ['Formar futuros talentos e lideranças.', 'Atrair perfis qualificados e conectados à marca.', 'Garantir processo justo e inclusivo.', 'Acompanhamento pós-contratação.'],
    areasInvolved: ['RH / Atração & Seleção', 'BP', 'Gestores', 'Diretoria', 'Marketing', 'Jurídico', 'DHO', 'Financeiro', 'TI'],
    toolsUsed: ['Gestão do Programa: LinkedIn, CIEE, Gupy, Google Forms, Testes soft skills, Lógica, Inglês.', 'Gestão pós-contratação: PDI, Feedback 360, Jornadas de aprendizagem.'],
    laborType: 'Estágio / Trainee (CLT)',
    sla: 'Processo seletivo: 8 a 12 semanas. Acompanhamento: 6 a 12 meses.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos que buscam sua primeira oportunidade e conecta-os às empresas de forma estruturada e estratégica. Conta com profissionais especializados nesse tipo de recrutamento.'
  },
  {
    id: 'tech-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Tech Recruiter',
    name: 'Gestão Terceiros',
    description: 'Permite às empresas terceirizar a contratação de profissionais especializados em tecnologia sem assumir a gestão direta da equipe.',
    benefits: ['Permite terceirizar a contratação de profissionais de tecnologia.', 'Atende demandas contínuas.', 'Ideal para projetos com prazo definido.', 'Garante rapidez e assertividade.'],
    publicNeeds: ['Redução da carga administrativa.', 'Manter serviço contínuo sem vínculo direto.', 'Atender demandas específicas e skills de TI.'],
    areasInvolved: ['Recrutamento e Seleção.', 'Admissão e Contratação.', 'Departamento Pessoal.', 'Departamento Jurídico.', 'Customer Service.'],
    toolsUsed: ['Software de gestão.', 'ATS.', 'Plataformas de Recrutamento.', 'PowerBi.', 'Softwares de Admissão.', 'Controle de Ponto.'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental. Focada em atrair e selecionar profissionais de TI e áreas correlatas, garante assertividade e velocidade nos processos de contratação.'
  },
  {
    id: 'tech-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Tech Recruiter',
    name: 'Gestão Temporários',
    description: 'Modalidade de contratação temporária que permite reforçar rapidamente o quadro de profissionais de tecnologia em situações extraordinárias.',
    benefits: ['Permite reforçar rapidamente o quadro de TI.', 'Ideal para substituição de colaboradores ou demandas pontuais.', 'Garante candidatos com perfil técnico adequado.', 'Assegura rapidez e eficiência.'],
    publicNeeds: ['Cobertura de ausências.', 'Reforço em períodos de pico.', 'Agilidade de contratação.', 'Flexibilidade.', 'Redução de risco.', 'Testar profissional.'],
    areasInvolved: ['Recrutamento e Seleção.', 'Admissão e Contratação.', 'Departamento Pessoal.', 'Departamento Jurídico.', 'Customer Service.'],
    toolsUsed: ['Software de gestão.', 'ATS.', 'Plataformas de Recrutamento.', 'PowerBi.', 'Softwares de Admissão.', 'Controle de Ponto.'],
    laborType: 'Temporários',
    sla: 'Não se Aplica',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental. Focada em atrair e selecionar profissionais de TI e áreas correlatas, garante assertividade e velocidade nos processos de contratação.'
  },
  {
    id: 'tech-rs',
    code: 'R&S',
    solutionPackage: 'Tech Recruiter',
    name: 'R&S',
    description: 'Processo especializado para atrair, avaliar e selecionar profissionais de tecnologia e áreas correlatas, garantindo alinhamento com as necessidades técnicas.',
    benefits: ['Atrai profissionais qualificados de TI de forma ágil.', 'Avalia competências técnicas e comportamentais.', 'Facilita contratação de candidatos ideais.', 'Reduz tempo e esforço do cliente.'],
    publicNeeds: ['Assertividade no perfil', 'Acesso a mais talentos', 'Processo estruturado e objetivo', 'Agilidade sem perder qualidade', 'Avaliação técnica profunda'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D / Desenvolvimento', 'Marketing / Employer Branding', 'Tecnologia / TI', 'Jurídico / Compliance'],
    toolsUsed: ['Atração e Divulgação: Gupy, LinkedIn...', 'Triagem: ATS, Testes técnicos, Gamificação...', 'Entrevistas: Zoom, Teams...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental. Focada em atrair e selecionar profissionais de TI e áreas correlatas, garante assertividade e velocidade nos processos de contratação.'
  },
  {
    id: 'tech-map',
    code: 'Mapeamento de Mercado',
    solutionPackage: 'Tech Recruiter',
    name: 'Mapeamento de Mercado',
    description: 'Prática estratégica que integra planejamento de talentos com recrutamento especializado, utilizando análises qualitativas e quantitativas para mapear profissionais de tecnologia.',
    benefits: ['Permite decisões de contratação precisas.', 'Identifica lacunas e oportunidades em TI.', 'Oferece visibilidade sobre densidade de profissionais.', 'Auxilia no planejamento estratégico.'],
    publicNeeds: ['Entender concorrência e skills em alta.', 'Densidade de talentos tech.', 'Otimizar canais de recrutamento.', 'Inteligência de mercado.'],
    areasInvolved: ['RH / Aquisição de Talentos.', 'Estratégia Corporativa.', 'Comercial / Marketing.', 'Inteligência de Mercado.'],
    toolsUsed: ['Plataformas de Inteligência.', 'ATS e Sourcing.', 'Web Scraping.', 'Bancos de Dados.'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental. Focada em atrair e selecionar profissionais de TI e áreas correlatas, garante assertividade e velocidade nos processos de contratação.'
  },
  {
    id: 'tech-marketing',
    code: 'Marketing Dedicado',
    solutionPackage: 'Tech Recruiter',
    name: 'Marketing Dedicado',
    description: 'Conjunto de estratégias de marketing voltadas para atrair, engajar e reter profissionais de tecnologia, envolvendo fortalecimento da marca empregadora.',
    benefits: ['Aumenta alcance e visibilidade da marca empregadora.', 'Atrai profissionais de TI qualificados.', 'Engaja candidatos potenciais.', 'Melhora qualidade das candidaturas.'],
    publicNeeds: ['Reforçar processo de atração', 'Reverberar marca empregadora', 'Branding consistente'],
    areasInvolved: ['Marketing', 'Redatora (terceirizada)'],
    toolsUsed: ['RDStation', 'Adobe Creative Cloud', 'Linkedin Ads', 'Meta Ads', 'Google Ads', 'Gravação (estúdio)'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental. Focada em atrair e selecionar profissionais de TI e áreas correlatas, garante assertividade e velocidade nos processos de contratação.'
  },
  {
    id: 'tech-hunting',
    code: 'Hunting',
    solutionPackage: 'Tech Recruiter',
    name: 'Hunting',
    description: 'Processo conduzido por consultores especializados em tecnologia, que realizam busca ativa de profissionais qualificados para posições estratégicas.',
    benefits: ['Identificação rápida de profissionais qualificados.', 'Avaliação completa do fit técnico e cultural.', 'Redução do tempo de contratação.', 'Maior assertividade na escolha do candidato ideal.'],
    publicNeeds: ['Acesso a Talentos Tech Escassos.', 'RH interno sem tempo ou rede de contatos.', 'Erros na contratação custam caro.', 'Fit cultural e técnico.'],
    areasInvolved: ['Time de Recrutamento e Seleção', 'Liderança'],
    toolsUsed: ['Sistema de Recrutamento e Seleção.', 'Linkedin Recruiter', 'PowerBi.'],
    laborType: 'Não se aplica',
    sla: 'Definir com time de seleção.',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental. Focada em atrair e selecionar profissionais de TI e áreas correlatas, garante assertividade e velocidade nos processos de contratação.'
  },
  {
    id: 'trilhando-tecnico',
    code: 'Testes Técnicos',
    solutionPackage: 'Trilhando +',
    name: 'Testes Técnicos',
    description: 'Ferramentas e métodos utilizados para avaliar habilidades e conhecimentos técnicos dos candidatos.',
    benefits: ['Verifica conhecimentos necessários para a função.', 'Aumenta assertividade na seleção.', 'Reduz riscos de contratação inadequada.', 'Permite comparação objetiva.'],
    publicNeeds: ['Confirma conhecimento técnico.', 'Avalia proficiência em ferramentas.', 'Reduz risco de erro.', 'Simula situações reais.', 'Base para treinamento.'],
    areasInvolved: ['RH Externo (Consultoria).', 'RH interno.'],
    toolsUsed: ['Teste propriamente dito (presencial ou online).'],
    laborType: 'Não se aplica',
    sla: 'Não se aplica',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'trilhando-psico',
    code: 'Testes Psicológicos',
    solutionPackage: 'Trilhando +',
    name: 'Testes Psicológicos',
    description: 'Testes utilizados para avaliar aspectos cognitivos e de personalidade de candidatos, permitindo prever o desempenho em determinada função.',
    benefits: ['Identifica candidatos com maior potencial.', 'Alinha perfil à cultura.', 'Reduz riscos de incompatibilidade.', 'Complementa avaliação técnica.'],
    publicNeeds: ['Avaliar competências comportamentais.', 'Identificar traços de personalidade.', 'Medir habilidades cognitivas.', 'Prever comportamento sob pressão.', 'Diminuir turnover.'],
    areasInvolved: ['RH Externo (Consultoria).', 'RH interno.', 'Psicóloga com CRP ativo.'],
    toolsUsed: ['Teste propriamente dito (presencial ou online).'],
    laborType: 'Não se aplica',
    sla: 'Não se aplica',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'trilhando-inventario',
    code: 'Inventários Comportamentais',
    solutionPackage: 'Trilhando +',
    name: 'Inventários Comportamentais',
    description: 'Serviço que avalia e descreve o comportamento de um profissional em diferentes situações. Permite identificar o perfil comportamental e motivações.',
    benefits: ['Visão completa do comportamento.', 'Ajuda a prever desempenho e integração.', 'Decisões de contratação mais assertivas.', 'Complementa avaliações técnicas.'],
    publicNeeds: ['Evitar contratações desalinhadas.', 'Garantir função motivadora.', 'Entender dinâmicas de equipe.', 'Identificar potencial de liderança.'],
    areasInvolved: ['Recrutamento e Seleção', 'Gestão de Desempenho', 'Desenvolvimento e Treinamento', 'RH Externo'],
    toolsUsed: ['DISC Extended', 'Testes e Inventários Comportamentais'],
    laborType: 'Não se Aplica',
    sla: 'Aplicação rápida. Análise em 2 a 5 dias úteis.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'trilhando-workshop',
    code: 'Workshop',
    solutionPackage: 'Trilhando +',
    name: 'Workshop',
    description: 'Ações pontuais e interativas que capacitam lideranças e equipes em temas estratégicos de desenvolvimento humano e organizacional.',
    benefits: ['Aprendizado prático e imediato.', 'Desenvolvimento de soft skills.', 'Fortalecimento da cultura.', 'Promoção de DEIP.', 'Resultados rápidos.'],
    publicNeeds: ['Ajustar comportamentos.', 'Engajar e sensibilizar.', 'Gerar resultado rápido.', 'Mobilizar times.', 'Fortalecer Cultura.'],
    areasInvolved: ['RH / Gente & Gestão', 'Liderança', 'T&D', 'Comunicação Interna', 'Tecnologia', 'Jurídico'],
    toolsUsed: ['Mentimeter, Kahoot, Forms.', 'Miro / Mural.', 'PowerPoint / Canva.', 'Teams / Zoom.', 'Planos de ação.'],
    laborType: 'Não se Aplica',
    sla: '20 a 40 dias (customizado). 7 a 15 dias (prateleira).',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'trilhando-trilhas',
    code: 'Trilhas',
    solutionPackage: 'Trilhando +',
    name: 'Trilhas de Aprendizagem',
    description: 'Programas contínuos de aprendizado estruturados para desenvolver competências ao longo do tempo.',
    benefits: ['Desenvolvimento contínuo e consistente.', 'Fortalecimento da cultura.', 'Aprendizado estruturado.', 'Promoção de DEIP.', 'Resultados duradouros.'],
    publicNeeds: ['Desenvolvimento de competências essenciais.', 'Evolução gradual.', 'Engajamento e retenção.', 'Alinhamento cultural.', 'Resultados sustentáveis.'],
    areasInvolved: ['RH / Desenvolvimento', 'Lideranças', 'Equipe de Treinamento', 'TI', 'Gestão Estratégica'],
    toolsUsed: ['Avaliação 360, DISC.', 'Gamificação.', 'People Analytics.', 'LMS corporativo.'],
    laborType: 'Não se Aplica',
    sla: 'Planejamento: 2-4 semanas. Entrega conforme cronograma.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'trilhando-treinamento',
    code: 'Treinamento',
    solutionPackage: 'Trilhando +',
    name: 'Treinamento',
    description: 'Sessões planejadas para capacitar lideranças e equipes em habilidades essenciais de gestão de pessoas, cultura organizacional e engajamento.',
    benefits: ['Capacitação prática.', 'Reforço contínuo de cultura.', 'Desenvolvimento comportamental.', 'Promoção de DEIP.', 'Melhoria consistente.'],
    publicNeeds: ['Desenvolver habilidades específicas.', 'Aplicação prática.', 'Alinhar equipe à cultura.', 'Melhoria de resultados.', 'Suporte à evolução do RH.'],
    areasInvolved: ['RH / T&D', 'Lideranças', 'Facilitadores', 'TI', 'Comunicação Interna'],
    toolsUsed: ['Avaliação 360, DISC.', 'Gamificação.', 'People Analytics.', 'LMS corporativo.'],
    laborType: 'Não se Aplica',
    sla: 'Planejamento: 2 semanas. Entrega conforme cronograma.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'trilhando-censo',
    code: 'Censo / Diagnóstico',
    solutionPackage: 'Trilhando +',
    name: 'Censo / Diagnóstico',
    description: 'Serviço estruturado para mapear o perfil e o comportamento das equipes, identificando competências, gaps, clima organizacional e necessidades de desenvolvimento.',
    benefits: ['Identificação precisa de competências e gaps.', 'Insights estratégicos.', 'Compreensão do clima organizacional.', 'Promoção de DEIP.', 'Suporte baseado em dados.'],
    publicNeeds: ['Mapear população interna.', 'Definição de metas de diversidade.', 'Diagnóstico antes da intervenção.', 'Clareza sobre competências.', 'Mapear insatisfações.'],
    areasInvolved: ['RH Externo', 'Time de BI', 'Liderança do projeto', 'Trilhando+'],
    toolsUsed: ['Ferramenta de Pesquisa (Survey).', 'PowerBi.'],
    laborType: 'Não se Aplica',
    sla: '20 a 60 dias dependendo do volume de pessoas.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP). Além de apoiar o desenvolvimento e engajamento de talentos, também amplia o alcance de processos já realizados sob a perspectiva inclusiva.'
  },
  {
    id: 'varejo-pro-rs',
    code: 'R&S',
    solutionPackage: 'Varejo Pro',
    name: 'R&S',
    description: 'Processo estruturado para identificar, avaliar e contratar candidatos qualificados, alinhados às necessidades da organização e com foco em volume e velocidade.',
    benefits: ['Atrai profissionais aderentes.', 'Garante assertividade.', 'Alinha contratações às estratégias.', 'Otimiza tempo e recursos.'],
    publicNeeds: ['Assertividade no perfil', 'Acesso a mais talentos', 'Processo estruturado', 'Agilidade e volume'],
    areasInvolved: ['RH / Talent Acquisition', 'T&D', 'Marketing', 'Tecnologia', 'Jurídico', 'Gestores'],
    toolsUsed: ['Gupy, 99Jobs, LinkedIn...', 'ATS, Testes...', 'Entrevistas...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, a solução tem como foco velocidade, alto volume e assertividade na contratação. Ideal para momentos de grande movimentação.'
  },
  {
    id: 'varejo-pro-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Varejo Pro',
    name: 'Célula Dedicada',
    description: 'Estratégia de transferir o recrutamento para equipe especializada, focada em alto volume e velocidade.',
    benefits: ['Apoio especializado para alto volume.', 'Aumento da eficiência.', 'Redução de custos.', 'Melhoria na experiência.', 'Foco estratégico.'],
    publicNeeds: ['Volume de vagas alto.', 'Necessidade de especialização.', 'Escalabilidade.', 'Padronização.', 'Redução de custos.'],
    areasInvolved: ['Liderança', 'Equipe R&S', 'Sourcing', 'People Analytics'],
    toolsUsed: ['ATS.', 'Hunting.', 'PowerBi.', 'CRM.', 'Avaliações.'],
    laborType: 'Não se Aplica',
    sla: 'Acordo composto por SLA de prazo e SLA de performance.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, a solução tem como foco velocidade, alto volume e assertividade na contratação. Ideal para momentos de grande movimentação.'
  },
  {
    id: 'varejo-pro-map',
    code: 'Mapeamento de Mercado',
    solutionPackage: 'Varejo Pro',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento e seleção, mapeando profissionais do varejo.',
    benefits: ['Prever estratégia de atração.', 'Identificar disponibilidade de talentos.', 'Diagnóstico da capacidade.', 'Decisões assertivas.'],
    publicNeeds: ['Entender concorrentes.', 'Densidade de talentos.', 'Otimizar canais.', 'Inteligência de mercado.'],
    areasInvolved: ['RH', 'Estratégia', 'Comercial', 'Inteligência'],
    toolsUsed: ['Plataformas de Inteligência.', 'ATS.', 'Web Scraping.', 'Bancos de Dados.'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, a solução tem como foco velocidade, alto volume e assertividade na contratação. Ideal para momentos de grande movimentação.'
  },
  {
    id: 'varejo-pro-marketing',
    code: 'Marketing Dedicado',
    solutionPackage: 'Varejo Pro',
    name: 'Marketing Dedicado',
    description: 'Estratégias de marketing para atração em massa e fortalecimento da marca empregadora no varejo.',
    benefits: ['Aumenta atratividade em volume.', 'Fortalece marca.', 'Facilita captação.', 'Melhora comunicação.'],
    publicNeeds: ['Atração em volume', 'Marca empregadora forte', 'Branding consistente'],
    areasInvolved: ['Marketing', 'Redatora'],
    toolsUsed: ['RDStation', 'Adobe', 'Ads (Social/Google)', 'Gravação'],
    laborType: 'Não se Aplica',
    sla: 'Sob consulta',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, a solução tem como foco velocidade, alto volume e assertividade na contratação. Ideal para momentos de grande movimentação.'
  },
  {
    id: 'varejo-pro-rpo',
    code: 'RPO',
    solutionPackage: 'Varejo Pro',
    name: 'RPO',
    description: 'Serviço de terceirização do recrutamento especializado em varejo e alto volume.',
    benefits: ['Processos seletivos ágeis.', 'Custos reduzidos.', 'Velocidade.', 'Liberação do RH interno.'],
    publicNeeds: ['Escala.', 'Foco estratégico.', 'Padronização.', 'Acesso a talentos.', 'Redução de riscos.'],
    areasInvolved: ['RH', 'TI', 'Jurídico', 'Gestores', 'Equipe RPO'],
    toolsUsed: ['Gupy...', 'ATS...', 'Entrevistas...', 'PowerBi.'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Depende do volume.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, a solução tem como foco velocidade, alto volume e assertividade na contratação. Ideal para momentos de grande movimentação.'
  }
];

// --- PROJECT PRICING CALCULATOR DATA ---

export const WEIGHT_TABLES = {
  roles: [
    { label: 'Diretoria', value: 2.0 },
    { label: 'Gerência', value: 1.75 },
    { label: 'Supervisão', value: 1.75 },
    { label: 'Analista Sr', value: 1.5 },
    { label: 'Analista Pl/Jr', value: 1.25 },
    { label: 'Assistente', value: 1.0 },
    { label: 'Operacional', value: 1.0 },
    { label: 'Técnico', value: 1.25 }
  ],
  complexity: [
    { label: 'Alto', value: 2.0 },
    { label: 'Médio', value: 1.5 },
    { label: 'Baixo', value: 1.0 }
  ],
  urgency: [
    { label: 'Alto', value: 2.0 },
    { label: 'Médio', value: 1.5 },
    { label: 'Baixo', value: 1.0 }
  ],
  volume: [
    { label: 'Mais de 200', value: 2.0 },
    { label: 'De 100 a 199', value: 2.0 },
    { label: 'De 21 a 99', value: 1.5 },
    { label: 'Até 20', value: 1.0 }
  ]
};

export const HOURLY_RATES = {
  consultant2: 27.00,
  consultant1: 22.00,
  assistant: 15.00
};

export const DEFAULT_FIXED_ITEMS: FixedCostItem[] = [
  { id: 'item-1', name: '', cost: 0, quantity: 1 }
];

export const PROFIT_MARGINS = [
  { label: 'Sem margem (1.00)', value: 1.00 },
  { label: 'Mínimo (1.15)', value: 1.15 },
  { label: 'Ajustada (1.25)', value: 1.25 },
  { label: 'Máximo (1.50)', value: 1.50 }
];

// ISS fixo para São Paulo
export const TAX_RATES = {
  pis: 0.0165, // 1.65%
  cofins: 0.076, // 7.60%
  irrf: 0.015, // 1.50%
  csll: 0.01,  // 1.00%
  // FIX: Replaced the fixed 'iss' property with 'issOptions' to support multiple locations in the calculator.
  issOptions: [
    { city: 'São Paulo - SP', rate: 0.05 },
    { city: 'Barueri - SP', rate: 0.02 },
    { city: 'Osasco - SP', rate: 0.05 },
    { city: 'Guarulhos - SP', rate: 0.05 },
    { city: 'Campinas - SP', rate: 0.05 },
    { city: 'Santo André - SP', rate: 0.05 },
    { city: 'São Bernardo do Campo - SP', rate: 0.05 },
    { city: 'São Caetano do Sul - SP', rate: 0.05 },
    { city: 'Diadema - SP', rate: 0.03 },
    { city: 'Mauá - SP', rate: 0.05 },
    { city: 'Ribeirão Preto - SP', rate: 0.05 },
    { city: 'Sorocaba - SP', rate: 0.05 },
    { city: 'Santos - SP', rate: 0.05 },
    { city: 'Rio de Janeiro - RJ', rate: 0.05 },
    { city: 'Niterói - RJ', rate: 0.05 },
    { city: 'Belo Horizonte - MG', rate: 0.03 },
    { city: 'Curitiba - PR', rate: 0.05 },
    { city: 'Porto Alegre - RS', rate: 0.05 },
    { city: 'Brasília - DF', rate: 0.05 },
    { city: 'Salvador - BA', rate: 0.05 },
    { city: 'Fortaleza - CE', rate: 0.05 },
    { city: 'Recife - PE', rate: 0.05 },
    { city: 'Manaus - AM', rate: 0.05 },
    { city: 'Belém - PA', rate: 0.05 },
    { city: 'Goiânia - GO', rate: 0.05 },
    { city: 'Cuiabá - MT', rate: 0.05 },
    { city: 'Outra Localidade (5%)', rate: 0.05 },
  ],
  retentionIR: 0.015 // 1.5% Retention on Gross
};

// --- LABOR / CLT CALCULATOR CONSTANTS ---

export const MINIMUM_WAGE = 1804.00;

export const LABOR_CHARGES = {
  groupA: {
    inss: 0.20,
    sesi_sesc: 0.015,
    senai_senac: 0.01,
    incra: 0.002,
    sat: 0.036, // Atualizável
    salario_educacao: 0.025,
    sebrae: 0.006,
    fgts: 0.08,
  },
  groupB: {
    ferias_abono: 0.1111,
    inss_ferias: 0.0327,
    fgts_ferias: 0.0133,
    decimo_terceiro: 0.0833,
    inss_decimo_terceiro: 0.0245,
    fgts_decimo_terceiro: 0.01,
    aviso_previo: 0.1178,
    deposito_rescisao: 0.032,
    auxilio_doenca: 0.035,
  }
};

export const LABOR_TAX_RATES = {
  iss: 0.02,
  pis: 0.0165,
  cofins: 0.076,
  irrf: 0.01,
  csll: 0.01
};

export const BENEFIT_OPTIONS = {
  medical: [
    { id: 'med-sul-esp', name: 'SULAMÉRICA ESPECIAL', value: 1117.49 },
    { id: 'med-sul-esp100', name: 'SULAMÉRICA ESPECIAL 100', value: 1445.99 },
    { id: 'med-sul-exec', name: 'SULAMÉRICA EXECUTIVO', value: 3426.20 },
    { id: 'med-sul-exato', name: 'SULAMÉRICA - EXATO', value: 980.92 },
    { id: 'med-sul-class', name: 'SULAMÉRICA CLÁSSICO', value: 1055.95 },
    { id: 'med-brad-enf', name: 'BRADESCO EFETIVO ENFERMARIA', value: 612.30 },
    { id: 'med-brad-apt', name: 'BRADESCO EFETIVO APARTAMENTO', value: 690.27 },
    { id: 'med-brad-flex', name: 'BRADESCO NACIONAL FLEX APARTAMENTO', value: 814.65 },
    { id: 'med-brad-nac2', name: 'BRADESCO NACIONAL 2 APARTAMENTO', value: 975.28 },
    { id: 'med-none', name: 'Sem Plano Médico', value: 0 }
  ],
  dental: [
    { id: 'den-sul-sind', name: 'PLANO ODONTO SULAMÉRICA + SINDICATO', value: 44.25 },
    { id: 'den-none', name: 'Sem Plano Odontológico', value: 0 }
  ],
  wellhub: [
    { id: 'gym-starter', name: 'STARTER', value: 29.90 },
    { id: 'gym-basic', name: 'BASIC', value: 49.90 },
    { id: 'gym-silver', name: 'SILVER', value: 119.90 },
    { id: 'gym-silver-plus', name: 'SILVER+', value: 184.90 },
    { id: 'gym-gold', name: 'GOLD', value: 249.90 },
    { id: 'gym-gold-plus', name: 'GOLD+', value: 379.90 },
    { id: 'gym-platinum', name: 'PLATINUM', value: 499.90 },
    { id: 'gym-diamond', name: 'DIAMOND', value: 629.90 },
    { id: 'gym-diamond-plus', name: 'DIAMOND+', value: 679.90 },
    { id: 'gym-none', name: 'Sem Plano', value: 0 }
  ],
  others: {
    transport: { name: 'Vale Transporte (Diário)', defaultValue: 17.80 },
    meal: { name: 'Vale Refeição (Diário)', defaultValue: 23.30 },
    food: { name: 'Vale Alimentação (Mensal)', defaultValue: 163.83 },
    lifeInsurance: { name: 'Seguro de Vida', defaultValue: 16.01 },
    pharmacy: { name: 'Auxílio Farmácia | Omni', defaultValue: 46.96 },
    healthCare: { name: 'Saúde da Gente', defaultValue: 40.00 },
    gpsPoint: { name: 'Controle de Ponto GPS', defaultValue: 7.63 },
    plr: { name: 'PLR (Provisão Mensal)', defaultValue: 330.88 },
    operationalTeam: { name: 'Time de Operações (hora)', defaultValue: 745.00 },
    adminOperations: { name: 'Operação Administrativa (hora)', defaultValue: 248.05 }
  }
};

export const EXAM_OPTIONS = [
  { id: 'exam-aso', name: 'Exames Clínicos - ASO', value: 62.25 },
  { id: 'exam-comp', name: 'Exames Médicos Complementares', value: 0.00 },
  { id: 'exam-pcmso', name: 'PCMSO', value: 2.30 }
];