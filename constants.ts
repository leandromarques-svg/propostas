import { SolutionData, User } from './types';

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
  // --- BUSINESS ---
  {
    id: 'business-hunting',
    code: 'Hunting',
    solutionPackage: 'Business',
    name: 'Hunting',
    description: 'Processo conduzido por consultores especializados, com busca ativa de profissionais qualificados para vagas estratégicas. Envolve entrevistas, análise de currículos e avaliação de aderência à cultura organizacional e às necessidades do cliente.',
    benefits: [
      'Identifica talentos de alto desempenho que dificilmente seriam encontrados em processos tradicionais.',
      'Aumenta a assertividade na contratação de profissionais estratégicos.',
      'Alinha candidatos à cultura e às expectativas da empresa.',
      'Reduz o tempo necessário para preencher posições críticas.'
    ],
    publicNeeds: [
      'Acesso a Talentos Estratégicos e Escasso.',
      'O RH interno pode não ter tempo ou a rede de contatos necessária para conduzir uma busca complexa.',
      'Erros na contratação de um profissional estratégico são extremamente caros.',
      'Crucial que o profissional tenha fit cultural além da competência técnica.'
    ],
    areasInvolved: ['Time de Recrutamento e Seleção', 'Liderança para gestão do projeto'],
    toolsUsed: ['Sistema de Recrutamento e Seleção', 'Linkedin Recruiter', 'PowerBi (performance e indicadores)'],
    laborType: 'Não se aplica',
    sla: 'O SLA dependerá da posição e seu nível estratégico.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental.'
  },
  {
    id: 'business-assessment',
    code: 'Assessment',
    solutionPackage: 'Business',
    name: 'Assessment',
    description: 'Assessment é uma ferramenta de mapeamento que apoia profissionais em momentos de recolocação ou mudança de carreira. Por meio de avaliações técnicas e comportamentais, oferece clareza sobre pontos fortes, competências a desenvolver e potenciais caminhos de atuação.',
    benefits: [
      'Apoia profissionais em momentos de transição e recolocação de carreira.',
      'Proporciona autoconhecimento para decisões mais assertivas.',
      'Identifica pontos fortes e oportunidades de desenvolvimento.',
      'Oferece clareza e direcionamento para próximos passos profissionais.'
    ],
    publicNeeds: [
      'Autoconhecimento profissional: Saber pontos fortes e diferenciais.',
      'Direcionamento de carreira: Entender reposicionamento.',
      'Tomada de decisão mais segura (baseada em dados).',
      'Alinhamento com o mercado e competitividade.',
      'Planejamento estratégico e plano de desenvolvimento.'
    ],
    areasInvolved: ['R&S'],
    toolsUsed: ['DISC Extended', 'Entrevista por Competência'],
    laborType: 'Não se aplica',
    sla: 'Essencial: 5-7 dias. Completo: 10-12 dias. Executivo: 12-15 dias.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental.'
  },
  {
    id: 'business-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Business',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento e seleção, por meio de análises qualitativas e quantitativas da densidade e distribuição de profissionais em determinada função ou segmento dentro de uma localidade específica.',
    benefits: [
      'Permite prever e planejar a melhor estratégia de atração.',
      'Auxilia na identificação de mercados com maior disponibilidade de talentos.',
      'Oferece diagnóstico da capacidade da empresa em absorver profissionais.',
      'Traz mais assertividade para decisões estratégicas de contratação.'
    ],
    publicNeeds: [
      'Entender o que concorrentes diretos e indiretos estão buscando.',
      'Entender densidade de clientes potenciais e concentração geográfica.',
      'Otimizar canais de recrutamento e regiões.',
      'Obter inteligência de mercado acionável para estratégia comercial.'
    ],
    areasInvolved: ['RH / Aquisição de Talentos', 'Estratégia Corporativa', 'Comercial / Vendas', 'Inteligência de Mercado'],
    toolsUsed: ['Plataformas de Inteligência de Talentos', 'Sistemas de ATS e Sourcing', 'Web Scraping', 'Bancos de Dados Setoriais'],
    laborType: 'Não se Aplica',
    sla: 'Mapeamento Inicial: 4 a 8 semanas. Monitoramento contínuo: atualização semanal/mensal.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental.'
  },
  {
    id: 'business-rs',
    code: 'R&S',
    solutionPackage: 'Business',
    name: 'R&S',
    description: 'Processo estruturado para identificar, avaliar e contratar candidatos qualificados, alinhados às necessidades da organização. Envolve a definição de perfil pelo responsável da posição, a busca de talentos no mercado, a avaliação de competências e a escolha do profissional.',
    benefits: [
      'Atrai profissionais mais aderentes ao perfil da vaga e cultura.',
      'Garante maior assertividade nas contratações, reduzindo turnover.',
      'Alinha as contratações às estratégias e objetivos do negócio.',
      'Otimiza tempo e recursos do RH interno.'
    ],
    publicNeeds: [
      'Assertividade no perfil e acesso a mais talentos.',
      'Processo estruturado e objetivo.',
      'Agilidade sem perder qualidade.',
      'Avaliação técnica e comportamental mais profunda.',
      'Confidencialidade de vagas que são sigilosas.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'T&D', 'Marketing', 'Tecnologia', 'Jurídico', 'Gestores'],
    toolsUsed: ['ATS (Gupy/Kenoby/Abler)', 'Testes comportamentais/potencial', 'Dinâmicas e Entrevistas (Zoom/Teams)', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'A solução de contratação de média e alta gestão é voltada para cargos estratégicos que impactam diretamente o sucesso do negócio. O processo combina hunting ativo de talentos, mapeamento de mercado, abordagem consultiva e análise comportamental.'
  },

  // --- PHARMA RECRUITER ---
  {
    id: 'pharma-gestao-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Pharma Recruiter',
    name: 'Gestão de Terceiros',
    description: 'Permite às empresas contar com os benefícios da terceirização sem assumir a gestão direta dos funcionários. Oferece modalidades de tempo indeterminado (atividades contínuas) e determinado (projetos).',
    benefits: [
      'Redução da responsabilidade direta sobre a gestão de pessoas.',
      'Flexibilidade para atender demandas temporárias ou contínuas.',
      'Adequação ao tipo de necessidade da empresa.',
      'Agilidade na contratação de profissionais qualificados.'
    ],
    publicNeeds: [
      'Redução da carga administrativa e burocrática do RH.',
      'Manter serviço contínuo sem vínculo empregatício direto.',
      'Atender demandas específicas, picos ou projetos pontuais.'
    ],
    areasInvolved: ['Recrutamento e Seleção', 'Admissão e Contratação', 'Departamento Pessoal', 'Jurídico'],
    toolsUsed: ['Software de gestão administrativa', 'ATS', 'PowerBi', 'Admissão Digital', 'Ponto e Presença'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },
  {
    id: 'pharma-gestao-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Pharma Recruiter',
    name: 'Gestão de Temporários',
    description: 'Modalidade de contratação para reforçar o quadro em situações extraordinárias ou substituição de efetivos (férias, licenças).',
    benefits: [
      'Garante continuidade das atividades sem prejuízo operacional.',
      'Atende demandas temporárias de forma ágil e segura.',
      'Contratação por até 270 dias (com extensão de 9 meses).',
      'Flexibilidade para testar profissional antes de efetivar.'
    ],
    publicNeeds: [
      'Cobertura de ausências e reforço em picos.',
      'Agilidade de contratação e flexibilidade contratual.',
      'Redução de risco trabalhista.'
    ],
    areasInvolved: ['Recrutamento e Seleção', 'Admissão', 'Departamento Pessoal', 'Jurídico'],
    toolsUsed: ['Software de gestão', 'ATS', 'PowerBi', 'Admissão Digital', 'Ponto e Presença'],
    laborType: 'Temporários',
    sla: 'Não se Aplica',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },
  {
    id: 'pharma-rs',
    code: 'R&S',
    solutionPackage: 'Pharma Recruiter',
    name: 'R&S',
    description: 'Processo estruturado para identificar, avaliar e contratar candidatos qualificados, alinhados às necessidades da organização farmacêutica/saúde.',
    benefits: [
      'Atrai profissionais mais aderentes ao perfil da vaga.',
      'Garante maior assertividade nas contratações.',
      'Otimiza tempo e recursos do RH interno.'
    ],
    publicNeeds: [
      'Assertividade no perfil técnico.',
      'Acesso a mais talentos do setor.',
      'Avaliação técnica e comportamental profunda.',
      'Confidencialidade.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'T&D', 'Marketing', 'Tecnologia', 'Jurídico', 'Gestores'],
    toolsUsed: ['Gupy, 99Jobs, LinkedIn', 'ATS', 'Zoom/Teams', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },
  {
    id: 'pharma-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Pharma Recruiter',
    name: 'Célula Dedicada',
    description: 'Transferência de parte ou todo o processo de recrutamento para uma equipe especializada, ideal para projetos de médio/grande porte e longa duração.',
    benefits: [
      'Apoio especializado para projetos complexos.',
      'Aumento da eficiência e produtividade.',
      'Redução de custos operacionais.',
      'Liberação do RH interno para ações estratégicas.'
    ],
    publicNeeds: [
      'Volume de vagas acima da capacidade interna.',
      'Necessidade de especialização (conhecimento técnico do segmento).',
      'Escalabilidade e velocidade para expansão.',
      'Padronização e melhoria de processo.'
    ],
    areasInvolved: ['Liderança da Célula', 'Equipe R&S', 'Sourcing', 'People Analytics'],
    toolsUsed: ['ATS (Gupy, Selecty)', 'Ferramentas de Hunting', 'PowerBi', 'CRM', 'Avaliações comportamentais'],
    laborType: 'Não se Aplica',
    sla: 'SLA de performance e prazo, baseado em indicadores e previsibilidade.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },
  {
    id: 'pharma-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Pharma Recruiter',
    name: 'Mapeamento de Mercado',
    description: 'Prática que une planejamento da força de trabalho com recrutamento, analisando densidade de profissionais de saúde/farma em localidades específicas.',
    benefits: [
      'Permite prever a melhor estratégia de atração.',
      'Identifica mercados com disponibilidade de talentos.',
      'Diagnóstico da capacidade de absorção de profissionais.'
    ],
    publicNeeds: [
      'Entender concorrência e competências em alta demanda.',
      'Entender densidade de clientes potenciais.',
      'Otimizar canais de recrutamento e inteligência de mercado.'
    ],
    areasInvolved: ['RH', 'Estratégia Corporativa', 'Comercial', 'Inteligência de Mercado'],
    toolsUsed: ['Plataformas de Inteligência', 'ATS', 'Web Scraping', 'Bancos de Dados Setoriais'],
    laborType: 'Não se Aplica',
    sla: 'Variável conforme projeto.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },
  {
    id: 'pharma-marketing',
    code: 'Marketing Dedicado',
    solutionPackage: 'Pharma Recruiter',
    name: 'Marketing Dedicado',
    description: 'Estratégias de marketing para atração, treinamento e retenção, incluindo employer branding, publicidade e criação de conteúdo.',
    benefits: [
      'Aumenta atratividade para candidatos qualificados.',
      'Fortalece a marca empregadora.',
      'Facilita captação e retenção de talentos estratégicos.'
    ],
    publicNeeds: [
      'Reforçar processo de atração.',
      'Reverberar marca empregadora.',
      'Continuidade de Branding e identidade visual.'
    ],
    areasInvolved: ['Marketing'],
    toolsUsed: ['RDStation', 'Adobe Creative Cloud', 'Ads (LinkedIn, Meta, Google)', 'Estúdio de Gravação'],
    laborType: 'Redatora (terceirizada)',
    sla: 'Conforme projeto.',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },
  {
    id: 'pharma-rpo',
    code: 'RPO',
    solutionPackage: 'Pharma Recruiter',
    name: 'RPO',
    description: 'A empresa transfere parte ou todo o processo de R&S para consultoria especializada. O RPO atua como extensão do RH.',
    benefits: [
      'Garante processos seletivos de alto nível.',
      'Reduz custos operacionais comparado ao interno.',
      'Oferece velocidade e agilidade.',
      'Libera o RH interno para estratégia.'
    ],
    publicNeeds: [
      'Escala e agilidade no recrutamento.',
      'Consistência e padronização do processo.',
      'Acesso a talentos e mercados especializados.'
    ],
    areasInvolved: ['RH', 'Tecnologia', 'Jurídico', 'Gestores', 'Equipe RPO'],
    toolsUsed: ['Atração e Divulgação', 'Triagem e Avaliação (ATS)', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Depende do volume e complexidade (Acordo de nível de serviço definido).',
    aboutSolution: 'Especializada em atrair, avaliar e alocar profissionais qualificados para hospitais, indústrias farmacêuticas, laboratórios e serviços correlatos, garantindo excelência operacional.'
  },

  // --- STAFFING ---
  {
    id: 'staffing-gestao-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Staffing',
    name: 'Gestão de Terceiros',
    description: 'Terceirização da contratação sem assumir gestão direta. Modalidades por tempo indeterminado ou determinado.',
    benefits: [
      'Redução da responsabilidade direta sobre gestão.',
      'Flexibilidade para demandas temporárias ou contínuas.',
      'Agilidade na contratação.'
    ],
    publicNeeds: [
      'Redução de carga administrativa do RH.',
      'Manter serviço contínuo sem vínculo direto.',
      'Atender picos de produção ou projetos.'
    ],
    areasInvolved: ['R&S', 'Admissão', 'DP', 'Jurídico', 'Customer Service'],
    toolsUsed: ['Software gestão', 'ATS', 'PowerBi', 'Admissão Digital', 'Ponto'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais até cargos especialistas.'
  },
  {
    id: 'staffing-gestao-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Staffing',
    name: 'Gestão de Temporários',
    description: 'Reforço do quadro em situações extraordinárias ou substituição de efetivos (férias, licenças).',
    benefits: [
      'Garante continuidade das atividades.',
      'Atende demandas temporárias de forma ágil.',
      'Possibilidade de contratação por até 270 dias.'
    ],
    publicNeeds: [
      'Cobertura de ausências.',
      'Reforço em períodos de pico.',
      'Redução de risco trabalhista.'
    ],
    areasInvolved: ['R&S', 'Admissão', 'DP', 'Jurídico'],
    toolsUsed: ['Software gestão', 'ATS', 'PowerBi', 'Admissão Digital'],
    laborType: 'Temporários',
    sla: 'Não se Aplica',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais até cargos especialistas.'
  },
  {
    id: 'staffing-rs',
    code: 'R&S',
    solutionPackage: 'Staffing',
    name: 'R&S',
    description: 'Processo estruturado para identificar e contratar candidatos qualificados para posições de volume ou operacionais.',
    benefits: [
      'Atrai profissionais aderentes ao perfil.',
      'Garante assertividade e reduz turnover.',
      'Otimiza tempo e recursos.'
    ],
    publicNeeds: [
      'Assertividade no perfil.',
      'Agilidade sem perder qualidade.',
      'Acesso a mais talentos.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Tecnologia', 'Jurídico', 'Gestores'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 5 a 7 dias úteis para entrega dos perfis.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais até cargos especialistas.'
  },
  {
    id: 'staffing-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Staffing',
    name: 'Célula Dedicada',
    description: 'Equipe especializada para gerenciar grandes volumes ou projetos de longa duração de staffing.',
    benefits: [
      'Apoio especializado para projetos complexos.',
      'Aumento da eficiência e produtividade.',
      'Melhoria na experiência do colaborador.'
    ],
    publicNeeds: [
      'Volume de vagas acima da capacidade interna.',
      'Necessidade de contratar rápido sem perder qualidade.',
      'Padronização e melhoria de processo.'
    ],
    areasInvolved: ['Liderança', 'Equipe R&S', 'Sourcing', 'People Analytics'],
    toolsUsed: ['ATS', 'Ferramentas de Hunting', 'PowerBi', 'CRM'],
    laborType: 'Não se Aplica',
    sla: 'Baseado em indicadores de performance e previsibilidade.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais até cargos especialistas.'
  },
  {
    id: 'staffing-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Staffing',
    name: 'Mapeamento de Mercado',
    description: 'Análise qualitativa e quantitativa da densidade de profissionais para staffing em localidades específicas.',
    benefits: [
      'Previsibilidade na estratégia de atração.',
      'Identificação de disponibilidade de talentos.',
      'Diagnóstico de capacidade de absorção.'
    ],
    publicNeeds: [
      'Entender concorrência e faixas salariais.',
      'Otimizar canais de recrutamento.',
      'Inteligência de mercado acionável.'
    ],
    areasInvolved: ['RH', 'Estratégia', 'Comercial'],
    toolsUsed: ['Plataformas Inteligência', 'ATS', 'Web Scraping'],
    laborType: 'Não se Aplica',
    sla: 'Conforme projeto.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais até cargos especialistas.'
  },
  {
    id: 'staffing-rpo',
    code: 'RPO',
    solutionPackage: 'Staffing',
    name: 'RPO',
    description: 'Terceirização do processo de R&S para staffing, atuando como extensão do RH.',
    benefits: [
      'Processos de alto nível com assertividade.',
      'Redução de custos operacionais.',
      'Velocidade e agilidade para projetos.'
    ],
    publicNeeds: [
      'Escala e agilidade.',
      'Foco estratégico do RH interno.',
      'Consistência e padronização.'
    ],
    areasInvolved: ['RH', 'Tecnologia', 'Jurídico', 'Gestores', 'Equipe RPO'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Depende do volume e complexidade.',
    aboutSolution: 'Apoia empresas na alocação ágil de profissionais para projetos temporários ou estratégicos. Atuamos desde posições operacionais até cargos especialistas.'
  },

  // --- TALENT ---
  {
    id: 'talent-estagio',
    code: 'Estágio',
    solutionPackage: 'Talent',
    name: 'Vagas pontuais de Estágio',
    description: 'Recrutamento e seleção de estagiários (ensino superior ou tecnólogo) para vagas pontuais.',
    benefits: [
      'Acesso rápido a talentos em formação.',
      'Candidatos alinhados ao perfil da vaga.',
      'Reduz tempo e esforço do RH interno.',
      'Facilita integração de jovens talentos.'
    ],
    publicNeeds: [
      'Atrair talentos qualificados e diversos.',
      'Fortalecer marca empregadora.',
      'Processo estruturado e criterioso.',
      'Agilidade e volume.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'T&D', 'Gestores'],
    toolsUsed: ['Divulgação (Gupy, CIEE, etc)', 'ATS', 'Dinâmicas'],
    laborType: 'Estágio',
    sla: '15 a 25 dias entre abertura e fechamento.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos e conecta-os às empresas de forma estruturada e estratégica.'
  },
  {
    id: 'talent-trainee',
    code: 'Trainee',
    solutionPackage: 'Talent',
    name: 'Vagas pontuais Trainee',
    description: 'Recrutamento de trainees (último ano ou recém-formados) para assumir cargos estratégicos. Inclui avaliações de aptidão e competências.',
    benefits: [
      'Identifica jovens talentos com potencial estratégico.',
      'Alinha candidatos às trilhas de desenvolvimento.',
      'Aumenta assertividade em posições-chave.',
      'Fortalece sucessão e planejamento de carreira.'
    ],
    publicNeeds: [
      'Atrair talentos qualificados.',
      'Fortalecer marca empregadora.',
      'Construir pipeline de talento estratégico.'
    ],
    areasInvolved: ['RH', 'T&D', 'Gestores'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas'],
    laborType: 'CLT Trainee',
    sla: '15 a 25 dias entre abertura e fechamento.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos e conecta-os às empresas de forma estruturada e estratégica.'
  },
  {
    id: 'talent-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Talent',
    name: 'Mapeamento de Mercado (Talent)',
    description: 'Análise de mercado focada em jovens talentos e programas de entrada.',
    benefits: [
      'Previsão de estratégia de atração de jovens.',
      'Identificação de disponibilidade de talentos.',
      'Diagnóstico de capacidade de absorção.'
    ],
    publicNeeds: [
      'Entender concorrência por jovens talentos.',
      'Otimizar canais universitários.',
      'Inteligência para programas de entrada.'
    ],
    areasInvolved: ['RH', 'Estratégia', 'Comercial'],
    toolsUsed: ['Plataformas Inteligência', 'ATS'],
    laborType: 'Não se Aplica',
    sla: 'Conforme projeto.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos e conecta-os às empresas de forma estruturada e estratégica.'
  },
  {
    id: 'talent-programas',
    code: 'Programas',
    solutionPackage: 'Talent',
    name: 'Programas de Estágio/Trainee',
    description: 'Gestão completa: atração, employer branding, triagem, avaliação e acompanhamento pós-contratação.',
    benefits: [
      'Atrai candidatos qualificados e alinhados à cultura.',
      'Fortalece a marca empregadora.',
      'Permite acompanhar desempenho e desenvolvimento.',
      'Documentação estruturada de feedbacks.'
    ],
    publicNeeds: [
      'Formar futuros talentos e lideranças.',
      'Garantir processo justo, inclusivo e diverso.',
      'Acompanhamento pós-contratação (retenção).'
    ],
    areasInvolved: ['RH', 'BP', 'Gestores', 'Diretoria', 'Marketing', 'DHO'],
    toolsUsed: ['LinkedIn, CIEE, Nube', 'Landing pages', 'ATS', 'Testes comportamentais', 'Gamificação', 'PDI'],
    laborType: 'Estágio / Trainee (CLT)',
    sla: 'Processo: 8-12 semanas. Acompanhamento: 6-12 meses.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos e conecta-os às empresas de forma estruturada e estratégica.'
  },
  {
    id: 'talent-rs',
    code: 'R&S',
    solutionPackage: 'Talent',
    name: 'R&S (Talent)',
    description: 'Processo estruturado para identificar jovens talentos alinhados às necessidades da organização.',
    benefits: [
      'Atrai profissionais aderentes à vaga.',
      'Garante assertividade.',
      'Alinha contratações à estratégia.'
    ],
    publicNeeds: [
      'Assertividade no perfil jovem.',
      'Acesso a mais talentos.',
      'Avaliação de potencial.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Gestores'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos e conecta-os às empresas de forma estruturada e estratégica.'
  },
  {
    id: 'talent-marketing',
    code: 'Marketing',
    solutionPackage: 'Talent',
    name: 'Marketing Dedicado (Talent)',
    description: 'Estratégias de marketing voltadas para atração de jovens talentos e employer branding.',
    benefits: [
      'Aumenta atratividade para estudantes.',
      'Fortalece marca empregadora.',
      'Melhora comunicação com potenciais colaboradores.'
    ],
    publicNeeds: [
      'Reforçar atração de jovens.',
      'Reverberar marca empregadora.',
      'Continuidade visual nos processos.'
    ],
    areasInvolved: ['Marketing'],
    toolsUsed: ['RDStation', 'Adobe', 'Ads', 'Gravação'],
    laborType: 'Redatora',
    sla: 'Conforme projeto.',
    aboutSolution: 'Voltada para programas e vagas pontuais de estágio e trainee, a solução identifica jovens talentos e conecta-os às empresas de forma estruturada e estratégica.'
  },

  // --- TECH RECRUITER ---
  {
    id: 'tech-gestao-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Tech Recruiter',
    name: 'Gestão de Terceiros',
    description: 'Terceirização de profissionais de tecnologia sem assumir gestão direta. Modalidades indeterminado e determinado (projetos).',
    benefits: [
      'Terceirização de TI sem gestão direta.',
      'Atende demandas contínuas com retenção de conhecimento.',
      'Ideal para projetos com prazo definido.',
      'Rapidez e assertividade na alocação.'
    ],
    publicNeeds: [
      'Redução de carga administrativa de TI.',
      'Manter serviço contínuo.',
      'Atender demandas específicas de Tech.'
    ],
    areasInvolved: ['Recrutamento', 'Admissão', 'DP', 'Jurídico'],
    toolsUsed: ['Software gestão', 'ATS', 'PowerBi', 'Admissão Digital'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental.'
  },
  {
    id: 'tech-gestao-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Tech Recruiter',
    name: 'Gestão de Temporários',
    description: 'Reforço rápido do quadro de TI em situações extraordinárias ou substituição.',
    benefits: [
      'Reforço rápido de profissionais de tecnologia.',
      'Ideal para substituição de efetivos.',
      'Garante perfil técnico e comportamental adequado.',
      'Rapidez na alocação.'
    ],
    publicNeeds: [
      'Cobertura de ausências.',
      'Reforço em picos de desenvolvimento.',
      'Agilidade de contratação.'
    ],
    areasInvolved: ['Recrutamento', 'Admissão', 'DP', 'Jurídico'],
    toolsUsed: ['Software gestão', 'ATS', 'PowerBi'],
    laborType: 'Temporários',
    sla: 'Não se Aplica',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental.'
  },
  {
    id: 'tech-rs',
    code: 'R&S',
    solutionPackage: 'Tech Recruiter',
    name: 'R&S Tech',
    description: 'Processo especializado para atrair e selecionar profissionais de tecnologia, com avaliação técnica e comportamental.',
    benefits: [
      'Atração ágil e assertiva de tech.',
      'Avaliação técnica garantindo alinhamento.',
      'Reduz tempo e esforço do cliente.',
      'Decisões de contratação mais seguras.'
    ],
    publicNeeds: [
      'Assertividade no perfil técnico.',
      'Agilidade sem perder qualidade.',
      'Avaliação técnica profunda.',
      'Confidencialidade.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Tecnologia', 'Jurídico'],
    toolsUsed: ['Divulgação Tech', 'ATS', 'Testes Técnicos', 'Dinâmicas'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis para a entrega dos perfis.',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental.'
  },
  {
    id: 'tech-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Tech Recruiter',
    name: 'Mapeamento de Mercado Tech',
    description: 'Prática estratégica integrando planejamento de talentos com recrutamento especializado em TI.',
    benefits: [
      'Decisões de contratação mais precisas.',
      'Identifica lacunas e oportunidades em tech.',
      'Visibilidade sobre densidade de profissionais.',
      'Auxilia no planejamento estratégico.'
    ],
    publicNeeds: [
      'Entender concorrência por devs.',
      'Densidade de clientes e talentos tech.',
      'Otimizar canais de recrutamento especializados.'
    ],
    areasInvolved: ['RH', 'Estratégia', 'Comercial', 'Inteligência'],
    toolsUsed: ['Plataformas Inteligência', 'ATS', 'Web Scraping'],
    laborType: 'Não se Aplica',
    sla: 'Conforme projeto.',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental.'
  },
  {
    id: 'tech-marketing',
    code: 'Marketing',
    solutionPackage: 'Tech Recruiter',
    name: 'Marketing Dedicado Tech',
    description: 'Estratégias de marketing para atrair, engajar e reter profissionais de tecnologia (Employer Branding Tech).',
    benefits: [
      'Aumenta visibilidade da marca para devs.',
      'Atrai profissionais qualificados.',
      'Engaja candidatos potenciais.',
      'Melhora qualidade das candidaturas.'
    ],
    publicNeeds: [
      'Reforçar atração tech.',
      'Reverberar marca empregadora.',
      'Conteúdo especializado.'
    ],
    areasInvolved: ['Marketing'],
    toolsUsed: ['RDStation', 'Adobe', 'Ads', 'Gravação'],
    laborType: 'Redatora',
    sla: 'Conforme projeto.',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental.'
  },
  {
    id: 'tech-hunting',
    code: 'Hunting',
    solutionPackage: 'Tech Recruiter',
    name: 'Hunting Tech',
    description: 'Busca ativa de profissionais de tecnologia qualificados para posições estratégicas.',
    benefits: [
      'Identificação rápida de profissionais qualificados.',
      'Avaliação completa de fit técnico e cultural.',
      'Redução do tempo de contratação.',
      'Apoio de consultores experts em tecnologia.'
    ],
    publicNeeds: [
      'Acesso a Talentos Tech Escassos.',
      'RH interno sem rede de contatos tech.',
      'Alto custo de turnover em projetos.'
    ],
    areasInvolved: ['Recrutamento', 'Liderança'],
    toolsUsed: ['Sistema R&S', 'Linkedin Recruiter', 'PowerBi'],
    laborType: 'Não se aplica',
    sla: 'Definir com time de seleção.',
    aboutSolution: 'Voltada ao recrutamento especializado em tecnologia, com metodologias ágeis, mapeamento de mercado e avaliação técnica e comportamental.'
  },

  // --- TRILHANDO + ---
  {
    id: 'trilhando-testes-tecnicos',
    code: 'Testes Técnicos',
    solutionPackage: 'Trilhando +',
    name: 'Testes Técnicos',
    description: 'Ferramentas para avaliar habilidades e conhecimentos técnicos (questionários, provas, testes práticos).',
    benefits: [
      'Verifica conhecimentos necessários para a função.',
      'Aumenta assertividade na seleção técnica.',
      'Reduz riscos de contratação inadequada.',
      'Comparação objetiva de candidatos.'
    ],
    publicNeeds: [
      'Confirmar conhecimentos exigidos.',
      'Avaliar proficiência em ferramentas.',
      'Reduzir risco de contratar apenas por currículo.',
      'Simular situações reais.'
    ],
    areasInvolved: ['RH Externo', 'RH Interno'],
    toolsUsed: ['Testes presenciais ou online'],
    laborType: 'Não se aplica',
    sla: 'Não se aplica',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-testes-psico',
    code: 'Testes Psicológicos',
    solutionPackage: 'Trilhando +',
    name: 'Testes Psicológicos',
    description: 'Avaliação de aspectos cognitivos e de personalidade para prever desempenho.',
    benefits: [
      'Identifica candidatos com maior potencial.',
      'Alinha perfil comportamental à cultura.',
      'Reduz riscos de incompatibilidade.',
      'Complementa avaliação técnica.'
    ],
    publicNeeds: [
      'Avaliar competências comportamentais e cognitivas.',
      'Identificar traços de personalidade.',
      'Prever comportamento sob pressão.',
      'Diminuir turnover.'
    ],
    areasInvolved: ['RH Externo', 'RH Interno', 'Psicóloga CRP ativo'],
    toolsUsed: ['Testes presenciais ou online'],
    laborType: 'Não se aplica',
    sla: 'Não se aplica',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-inventarios',
    code: 'Inventários',
    solutionPackage: 'Trilhando +',
    name: 'Inventários Comportamentais',
    description: 'Avaliação do comportamento em diferentes situações, identificando perfil, motivações e habilidades.',
    benefits: [
      'Visão completa do comportamento e competências.',
      'Ajuda a prever desempenho e integração.',
      'Decisões mais assertivas.',
      'Complementa avaliações técnicas.'
    ],
    publicNeeds: [
      'Evitar desalinhamento de personalidade.',
      'Garantir funções motivadoras.',
      'Entender dinâmicas de equipe.',
      'Identificar potencial de liderança.'
    ],
    areasInvolved: ['R&S', 'Gestão de Desempenho', 'T&D', 'RH Externo'],
    toolsUsed: ['DISC Extended', 'Testes e Inventários'],
    laborType: 'Não se Aplica',
    sla: '2 a 5 dias úteis após aplicação.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-programas',
    code: 'Programas',
    solutionPackage: 'Trilhando +',
    name: 'Programas de Estágio/Trainee (DEIP)',
    description: 'Programas estruturados com foco em Diversidade, Equidade, Inclusão e Pertencimento. Gestão completa da atração ao desenvolvimento.',
    benefits: [
      'Atração estratégica e inclusiva.',
      'Desenvolvimento de habilidades com acompanhamento.',
      'Garante oportunidades equitativas.',
      'Engajamento e retenção.'
    ],
    publicNeeds: [
      'Formar futuros talentos.',
      'Garantir processo justo e diverso.',
      'Acompanhamento pós-contratação.'
    ],
    areasInvolved: ['RH', 'BP', 'Gestores', 'Diretoria', 'Marketing', 'DHO'],
    toolsUsed: ['LinkedIn', 'Landing pages', 'ATS', 'Testes', 'Gamificação', 'PDI'],
    laborType: 'Estágio / Trainee',
    sla: 'Processo: 8-12 semanas. Acompanhamento: 6-12 meses.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-rs',
    code: 'R&S',
    solutionPackage: 'Trilhando +',
    name: 'R&S Inclusivo (DEIP)',
    description: 'Processo de recrutamento conduzido com foco total em Diversidade, Equidade, Inclusão e Pertencimento.',
    benefits: [
      'Contratações alinhadas e inclusivas.',
      'Aumenta assertividade na escolha.',
      'Experiência inclusiva promovendo DEIP.',
      'Maior engajamento.'
    ],
    publicNeeds: [
      'Assertividade no perfil.',
      'Acesso a mais talentos diversos.',
      'Processo estruturado e inclusivo.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Gestores'],
    toolsUsed: ['Divulgação Inclusiva', 'ATS', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-estagio',
    code: 'Estágio',
    solutionPackage: 'Trilhando +',
    name: 'Vagas Estágio (DEIP)',
    description: 'Seleção de estagiários com foco em DEIP, garantindo experiências inclusivas e alinhadas à cultura.',
    benefits: [
      'Seleção qualificada e diversa.',
      'Processos inclusivos (DEIP).',
      'Experiência positiva para candidatos.',
      'Eficiência na contratação.'
    ],
    publicNeeds: [
      'Atrair talentos diversos.',
      'Fortalecer marca empregadora.',
      'Processo criterioso.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Gestores'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas'],
    laborType: 'Estágio',
    sla: '15 a 30 dias.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-trainee',
    code: 'Trainee',
    solutionPackage: 'Trilhando +',
    name: 'Vagas Trainee (DEIP)',
    description: 'Seleção de trainees com foco em DEIP. Identificação de talentos diversos para cargos estratégicos.',
    benefits: [
      'Identificação de trainees qualificados.',
      'Processos inclusivos (DEIP).',
      'Avaliação completa de competências.',
      'Experiência positiva e inclusiva.'
    ],
    publicNeeds: [
      'Atrair talentos diversos.',
      'Fortalecer marca empregadora.',
      'Processo criterioso.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Gestores'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas'],
    laborType: 'CLT Trainee',
    sla: '15 a 30 dias.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Trilhando +',
    name: 'Mapeamento de Mercado (DEIP)',
    description: 'Análise de mercado focada em diversidade e inclusão para planejamento da força de trabalho.',
    benefits: [
      'Decisões de contratação precisas.',
      'Identifica densidade de talentos diversos.',
      'Apoia planejamento estratégico.',
      'Promove práticas inclusivas.'
    ],
    publicNeeds: [
      'Entender concorrência.',
      'Densidade de clientes e talentos.',
      'Otimizar canais.'
    ],
    areasInvolved: ['RH', 'Estratégia', 'Comercial', 'Inteligência'],
    toolsUsed: ['Plataformas Inteligência', 'ATS', 'Web Scraping'],
    laborType: 'Não se Aplica',
    sla: 'Conforme projeto.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-workshop',
    code: 'Workshop',
    solutionPackage: 'Trilhando +',
    name: 'Workshop',
    description: 'Ações pontuais e interativas para capacitar lideranças e equipes em temas estratégicos de DHO e DEIP.',
    benefits: [
      'Aprendizado prático imediato.',
      'Desenvolvimento de habilidades comportamentais.',
      'Fortalecimento da cultura e engajamento.',
      'Promoção de DEIP.'
    ],
    publicNeeds: [
      'Ajustar comportamentos.',
      'Engajar e sensibilizar.',
      'Gerar resultado rápido.',
      'Fortalecer Cultura.'
    ],
    areasInvolved: ['RH', 'Liderança', 'T&D', 'Comunicação', 'Tecnologia'],
    toolsUsed: ['Mentimeter', 'Kahoot', 'Miro', 'Teams/Zoom'],
    laborType: 'Não se Aplica',
    sla: '20 a 40 dias (customizado) ou 7-15 dias (prateleira).',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-trilhas',
    code: 'Trilhas',
    solutionPackage: 'Trilhando +',
    name: 'Trilhas de Aprendizagem',
    description: 'Programas contínuos estruturados para desenvolver competências ao longo do tempo.',
    benefits: [
      'Desenvolvimento contínuo e consistente.',
      'Fortalecimento da cultura.',
      'Aprendizado estruturado com aplicação prática.',
      'Promoção de DEIP.'
    ],
    publicNeeds: [
      'Desenvolvimento de competências.',
      'Evolução gradual.',
      'Engajamento e retenção.',
      'Resultados sustentáveis.'
    ],
    areasInvolved: ['RH', 'Lideranças', 'T&D', 'TI', 'Diretoria'],
    toolsUsed: ['Avaliação 360', 'Gamificação', 'LMS'],
    laborType: 'Não se Aplica',
    sla: 'Planejamento: 2-4 semanas.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-treinamento',
    code: 'Treinamento',
    solutionPackage: 'Trilhando +',
    name: 'Treinamento',
    description: 'Sessões planejadas para capacitar em gestão de pessoas, cultura e engajamento.',
    benefits: [
      'Capacitação prática em gestão.',
      'Reforço contínuo de conceitos.',
      'Desenvolvimento de competências reais.',
      'Promoção de DEIP.'
    ],
    publicNeeds: [
      'Desenvolver habilidades específicas rápido.',
      'Garantir aplicação prática.',
      'Alinhar equipe à cultura.',
      'Melhoria de resultados.'
    ],
    areasInvolved: ['RH', 'Lideranças', 'Facilitadores', 'TI'],
    toolsUsed: ['Avaliação 360', 'Gamificação', 'LMS'],
    laborType: 'Não se Aplica',
    sla: 'Planejamento: 2 semanas.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },
  {
    id: 'trilhando-censo',
    code: 'Diagnóstico',
    solutionPackage: 'Trilhando +',
    name: 'Censo / Diagnóstico',
    description: 'Mapeamento de perfil e comportamento das equipes, identificando competências, gaps e clima. Foco em dados confiáveis.',
    benefits: [
      'Identificação precisa de gaps.',
      'Insights estratégicos.',
      'Compreensão do clima e engajamento.',
      'Promoção de DEIP baseada em dados.'
    ],
    publicNeeds: [
      'Mapear população interna (demografia).',
      'Definição de metas de diversidade.',
      'Diagnóstico antes da intervenção.',
      'Clareza sobre competências.'
    ],
    areasInvolved: ['RH Externo', 'BI', 'Liderança do projeto'],
    toolsUsed: ['Survey', 'PowerBi'],
    laborType: 'Não se Aplica',
    sla: '20 a 60 dias dependendo do volume.',
    aboutSolution: 'Solução completa de DHO que integra práticas de Diversidade, Equidade, Inclusão e Pertencimento (DEIP), diagnósticos estruturados e desenvolvimento.'
  },

  // --- VAREJO PRO ---
  {
    id: 'varejo-rs',
    code: 'R&S',
    solutionPackage: 'Varejo Pro',
    name: 'R&S Varejo',
    description: 'Processo estruturado para identificar e contratar profissionais para o varejo com agilidade e volume.',
    benefits: [
      'Atrai profissionais aderentes ao perfil.',
      'Garante assertividade reduzindo turnover.',
      'Otimiza tempo e recursos.'
    ],
    publicNeeds: [
      'Assertividade no perfil.',
      'Processo estruturado.',
      'Agilidade sem perder qualidade.'
    ],
    areasInvolved: ['RH', 'T&D', 'Marketing', 'Tecnologia', 'Gestores'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Média de 7 a 10 dias úteis.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, com foco em velocidade e volume.'
  },
  {
    id: 'varejo-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Varejo Pro',
    name: 'Célula Dedicada Varejo',
    description: 'Equipe especializada para grandes volumes ou expansão no varejo.',
    benefits: [
      'Apoio especializado para projetos complexos.',
      'Aumento da eficiência.',
      'Redução de custos operacionais.'
    ],
    publicNeeds: [
      'Volume de vagas alto.',
      'Necessidade de especialização.',
      'Escalabilidade e velocidade.'
    ],
    areasInvolved: ['Liderança', 'Equipe R&S', 'Sourcing', 'People Analytics'],
    toolsUsed: ['ATS', 'Hunting', 'PowerBi', 'CRM'],
    laborType: 'Não se Aplica',
    sla: 'Baseado em performance e prazo.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, com foco em velocidade e volume.'
  },
  {
    id: 'varejo-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Varejo Pro',
    name: 'Mapeamento de Mercado Varejo',
    description: 'Análise de mercado para expansão de lojas e entendimento da mão de obra local.',
    benefits: [
      'Previsão de estratégia de atração.',
      'Identificação de disponibilidade de talentos.',
      'Diagnóstico da capacidade de absorção.'
    ],
    publicNeeds: [
      'Entender concorrência local.',
      'Densidade de clientes.',
      'Otimizar canais regionais.'
    ],
    areasInvolved: ['RH', 'Estratégia', 'Comercial'],
    toolsUsed: ['Plataformas Inteligência', 'ATS', 'Web Scraping'],
    laborType: 'Não se Aplica',
    sla: 'Conforme projeto.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, com foco em velocidade e volume.'
  },
  {
    id: 'varejo-marketing',
    code: 'Marketing Dedicado',
    solutionPackage: 'Varejo Pro',
    name: 'Marketing Dedicado Varejo',
    description: 'Estratégias de marketing para atrair volume de candidatos para o varejo.',
    benefits: [
      'Aumenta atratividade.',
      'Fortalece marca empregadora.',
      'Facilita captação em massa.'
    ],
    publicNeeds: [
      'Reforçar atração.',
      'Reverberar marca empregadora.',
      'Continuidade de Branding.'
    ],
    areasInvolved: ['Marketing'],
    toolsUsed: ['RDStation', 'Adobe', 'Ads', 'Gravação'],
    laborType: 'Redatora',
    sla: 'Conforme projeto.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, com foco em velocidade e volume.'
  },
  {
    id: 'varejo-rpo',
    code: 'RPO',
    solutionPackage: 'Varejo Pro',
    name: 'RPO Varejo',
    description: 'Terceirização do R&S para o varejo, garantindo escala e eficiência.',
    benefits: [
      'Processos seletivos de alto nível.',
      'Reduz custos operacionais.',
      'Oferece velocidade.'
    ],
    publicNeeds: [
      'Escala e agilidade.',
      'Foco estratégico do RH.',
      'Consistência.'
    ],
    areasInvolved: ['RH', 'Tecnologia', 'Jurídico', 'Gestores', 'Equipe RPO'],
    toolsUsed: ['Divulgação', 'ATS', 'Dinâmicas', 'PowerBi'],
    laborType: 'Todos os modelos se aplicam',
    sla: 'Depende do volume e complexidade.',
    aboutSolution: 'Desenvolvida para atender às demandas específicas do varejo e de empresas que enfrentam picos sazonais, com foco em velocidade e volume.'
  }
];
