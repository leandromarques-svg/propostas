

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
    aboutSolution: 'Soluções de alta gestão focadas em posições estratégicas que impactam diretamente o sucesso do negócio.',
    description: 'Busca ativa de lideranças estratégicas. Mapeamento, abordagem consultiva e análise de fit cultural para posições de alto impacto.',
    benefits: [
      'Acesso a talentos de alto desempenho fora do radar.',
      'Máxima assertividade em posições de liderança.',
      'Alinhamento profundo com a cultura e estratégia.',
      'Redução do tempo de fechamento de vagas críticas.'
    ],
    publicNeeds: [
      'Acesso a Talentos Estratégicos e Escasso.',
      'RH interno sem tempo ou rede para busca complexa.',
      'Evitar erros caros na contratação de liderança.',
      'Necessidade de fit cultural além de hard skills.'
    ],
    areasInvolved: ['Time de Recrutamento e Seleção'],
    toolsUsed: ['Sistema de Recrutamento e Seleção', 'Linkedin Recruiter', 'PowerBi'],
    laborType: 'Não se aplica',
    sla: 'O SLA dependerá da posição e seu nível estratégico.'
  },
  {
    id: 'business-assessment',
    code: 'Assessment',
    solutionPackage: 'Business',
    name: 'Assessment',
    aboutSolution: 'Soluções de alta gestão focadas em posições estratégicas que impactam diretamente o sucesso do negócio.',
    description: 'Avaliação técnica e comportamental profunda para apoiar decisões de carreira, sucessão e desenvolvimento de lideranças.',
    benefits: [
      'Clareza para decisões de movimentação e sucessão.',
      'Autoconhecimento estratégico para executivos.',
      'Identificação precisa de gaps e potências.',
      'Base sólida para planos de desenvolvimento (PDI).'
    ],
    publicNeeds: [
      'Autoconhecimento profissional e pontos fortes.',
      'Direcionamento de carreira e reposicionamento.',
      'Tomada de decisão mais segura com base em dados.',
      'Alinhamento com o mercado e competitividade.',
      'Planejamento estratégico de carreira.'
    ],
    areasInvolved: ['R&S'],
    toolsUsed: ['DISC Extended', 'Entrevista por Competência'],
    laborType: 'Não se aplica',
    sla: 'Essencial: 5-7 dias. Completo: 10-12 dias. Executivo: 12-15 dias.'
  },
  {
    id: 'business-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Business',
    name: 'Mapeamento de Mercado',
    aboutSolution: 'Soluções de alta gestão focadas em posições estratégicas que impactam diretamente o sucesso do negócio.',
    description: 'Inteligência de mercado que analisa a disponibilidade, remuneração e distribuição de talentos em setores específicos.',
    benefits: [
      'Visão clara da disponibilidade de talentos.',
      'Dados reais para calibrar remuneração e atração.',
      'Benchmarking da concorrência.',
      'Estratégia baseada em dados, não em "feeling".'
    ],
    publicNeeds: [
      'Entender o que concorrentes estão buscando.',
      'Entender densidade de clientes potenciais (segmentos).',
      'Otimizar canais de recrutamento e regiões.',
      'Inteligência de mercado para expansão comercial.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'Estratégia Corporativa', 'Comercial / Vendas', 'Inteligência de Mercado'],
    toolsUsed: ['Plataformas de Inteligência', 'ATS e Sourcing', 'Web Scraping', 'Bancos de Dados Setoriais'],
    laborType: 'Não se Aplica',
    sla: 'Mapeamento Inicial: 4 a 8 semanas.'
  },
  {
    id: 'business-rs',
    code: 'R&S',
    solutionPackage: 'Business',
    name: 'R&S Executivo',
    aboutSolution: 'Soluções de alta gestão focadas em posições estratégicas que impactam diretamente o sucesso do negócio.',
    description: 'Recrutamento especializado para média e alta gestão. Processo consultivo para garantir os melhores líderes para o seu negócio.',
    benefits: [
      'Líderes alinhados aos objetivos de negócio.',
      'Processo criterioso com foco em soft skills.',
      'Redução de turnover em cargos chave.',
      'Experiência premium para candidatos e gestores.'
    ],
    publicNeeds: [
      'Assertividade no perfil',
      'Acesso a mais talentos',
      'Avaliação técnica e comportamental profunda',
      'Confidencialidade de vagas sigilosas'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'Diretoria Executiva', 'Gestores'],
    toolsUsed: ['ATS (Gupy/Kenoby)', 'Testes comportamentais', 'Entrevistas (Zoom/Teams)', 'PowerBi'],
    laborType: 'Business / Alta Gestão',
    sla: 'Média de 7 a 10 dias úteis para entrega dos perfis.'
  },

  // --- PHARMA RECRUITER ---
  {
    id: 'pharma-gestao-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Pharma Recruiter',
    name: 'Gestão de Terceiros',
    aboutSolution: 'Especializada em atrair e alocar profissionais qualificados para o setor de saúde, farma e laboratórios.',
    description: 'Terceirização completa da gestão de profissionais de saúde e farma. Foco na operação enquanto cuidamos das pessoas.',
    benefits: [
      'Zero burocracia na gestão de profissionais.',
      'Conformidade legal e trabalhista garantida.',
      'Foco total no core business da saúde.',
      'Flexibilidade para projetos e demandas sazonais.'
    ],
    publicNeeds: [
      'Redução da carga administrativa e burocrática do RH.',
      'Manter serviço contínuo sem vínculo empregatício direto.',
      'Atender picos de produção ou projetos pontuais.'
    ],
    areasInvolved: ['Recrutamento e Seleção', 'Departamento Pessoal', 'Jurídico'],
    toolsUsed: ['Software de gestão administrativa', 'ATS', 'PowerBi', 'Controle de Ponto'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica'
  },
  {
    id: 'pharma-gestao-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Pharma Recruiter',
    name: 'Gestão de Temporários',
    aboutSolution: 'Especializada em atrair e alocar profissionais qualificados para o setor de saúde, farma e laboratórios.',
    description: 'Alocação ágil de temporários para cobrir férias, licenças ou picos de demanda em hospitais e indústrias.',
    benefits: [
      'Reposição imediata de ausências.',
      'Continuidade operacional garantida.',
      'Contratação simplificada (Lei 6.019).',
      'Possibilidade de efetivação posterior.'
    ],
    publicNeeds: [
      'Cobertura de ausências e férias.',
      'Reforço em períodos de pico.',
      'Redução de risco trabalhista.',
      'Testar o profissional antes de efetivar.'
    ],
    areasInvolved: ['Recrutamento e Seleção', 'Departamento Pessoal'],
    toolsUsed: ['Software de gestão', 'ATS', 'Admissão Digital', 'Controle de Ponto'],
    laborType: 'Temporários',
    sla: 'Não se Aplica'
  },
  {
    id: 'pharma-rs',
    code: 'R&S',
    solutionPackage: 'Pharma Recruiter',
    name: 'R&S Especializado',
    aboutSolution: 'Especializada em atrair e alocar profissionais qualificados para o setor de saúde, farma e laboratórios.',
    description: 'Seleção técnica rigorosa para cargos científicos, regulatórios e assistenciais. Entendemos a linguagem do setor.',
    benefits: [
      'Recrutadores que entendem do setor.',
      'Validação técnica e regulatória dos perfis.',
      'Assertividade em vagas de difícil preenchimento.',
      'Redução do tempo de vaga aberta.'
    ],
    publicNeeds: [
      'Assertividade no perfil técnico (farma/saúde).',
      'Agilidade sem perder qualidade regulatória.',
      'Avaliação técnica profunda.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'Gestores Técnicos'],
    toolsUsed: ['ATS', 'Testes técnicos saúde', 'Entrevistas por competência'],
    laborType: 'Especialistas e Operacional Farma',
    sla: 'Média de 7 a 10 dias úteis.'
  },
  {
    id: 'pharma-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Pharma Recruiter',
    name: 'Célula Dedicada',
    aboutSolution: 'Especializada em atrair e alocar profissionais qualificados para o setor de saúde, farma e laboratórios.',
    description: 'Squad exclusivo de recrutamento atuando dentro ou fora da sua empresa para grandes volumes e projetos complexos.',
    benefits: [
      'Equipe 100% focada na sua cultura e vagas.',
      'Escalabilidade rápida para expansões.',
      'Inteligência de dados e indicadores em tempo real.',
      'Redução drástica do custo por contratação.'
    ],
    publicNeeds: [
      'Volume de vagas acima da capacidade interna.',
      'Necessidade de especialização técnica no recrutamento.',
      'Escalabilidade para expansão ou novas plantas.',
      'Padronização de processos de seleção.'
    ],
    areasInvolved: ['Liderança da Célula', 'Equipe R&S', 'Sourcing', 'People Analytics'],
    toolsUsed: ['ATS', 'Ferramentas de Hunting', 'PowerBi', 'CRM'],
    laborType: 'Não se Aplica',
    sla: 'Definido por indicadores e previsibilidade (SLA de prazo e performance).'
  },
  {
    id: 'pharma-marketing',
    code: 'Marketing Dedicado',
    solutionPackage: 'Pharma Recruiter',
    name: 'Employer Branding',
    aboutSolution: 'Especializada em atrair e alocar profissionais qualificados para o setor de saúde, farma e laboratórios.',
    description: 'Estratégias de marketing para atrair os melhores talentos da saúde e fortalecer sua marca empregadora.',
    benefits: [
      'Destaque em um mercado competitivo.',
      'Atração passiva de melhores candidatos.',
      'Engajamento desde o primeiro contato.'
    ],
    publicNeeds: [
      'Reforçar processo de atração.',
      'Reverberar marca empregadora.',
      'Continuidade de Branding.'
    ],
    areasInvolved: ['Marketing'],
    toolsUsed: ['RDStation', 'Adobe Creative Cloud', 'LinkedIn/Meta/Google Ads'],
    laborType: 'Redatora / Designer',
    sla: 'Depende do escopo da campanha.'
  },
  {
    id: 'pharma-rpo',
    code: 'RPO',
    solutionPackage: 'Pharma Recruiter',
    name: 'RPO (Terceirização de R&S)',
    aboutSolution: 'Especializada em atrair e alocar profissionais qualificados para o setor de saúde, farma e laboratórios.',
    description: 'Assumimos todo o seu processo de recrutamento. Tecnologia, processos e pessoas para transformar seu TA.',
    benefits: [
      'Transformação digital do recrutamento.',
      'Processos padronizados e eficientes.',
      'Redução de custos fixos de RH.',
      'Foco estratégico para seu time interno.'
    ],
    publicNeeds: [
      'Escala e agilidade no recrutamento.',
      'Consistência e padronização.',
      'Redução de custos e riscos.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'Equipe RPO Externa'],
    toolsUsed: ['ATS', 'Ferramentas de Sourcing', 'PowerBi'],
    laborType: 'Todos os modelos',
    sla: 'Acordo definido entre empresa e consultoria (SLA de projeto).'
  },

  // --- STAFFING ---
  {
    id: 'staffing-gestao-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Staffing',
    name: 'Gestão de Terceiros',
    aboutSolution: 'Alocação ágil de profissionais para projetos temporários ou estratégicos, garantindo flexibilidade e escala.',
    description: 'Administração completa de contratos de terceiros. Nós cuidamos da burocracia, você foca no resultado.',
    benefits: [
      'Mitigação de riscos trabalhistas.',
      'Gestão eficiente de folha e benefícios.',
      'Atendimento dedicado ao profissional alocado.'
    ],
    publicNeeds: [
      'Redução de burocracia (folha, encargos).',
      'Manter serviço contínuo sem vínculo direto.',
      'Atender demandas de picos.'
    ],
    areasInvolved: ['R&S', 'DP', 'Jurídico'],
    toolsUsed: ['Software gestão', 'ATS', 'Ponto Eletrônico'],
    laborType: 'Terceiros',
    sla: 'Não se Aplica'
  },
  {
    id: 'staffing-gestao-temporarios',
    code: 'Gestão Temporários',
    solutionPackage: 'Staffing',
    name: 'Gestão de Temporários',
    aboutSolution: 'Alocação ágil de profissionais para projetos temporários ou estratégicos, garantindo flexibilidade e escala.',
    description: 'Solução rápida para oscilações de demanda. Contrate por projeto ou sazonalidade com segurança jurídica.',
    benefits: [
      'Flexibilidade total na força de trabalho.',
      'Agilidade para iniciar operações.',
      'Segurança jurídica na contratação temporária.'
    ],
    publicNeeds: [
      'Cobertura de ausências.',
      'Reforço em picos.',
      'Agilidade de contratação.'
    ],
    areasInvolved: ['R&S', 'DP'],
    toolsUsed: ['Software gestão', 'ATS'],
    laborType: 'Temporários',
    sla: 'Não se Aplica'
  },
  {
    id: 'staffing-rs',
    code: 'R&S',
    solutionPackage: 'Staffing',
    name: 'R&S de Volume',
    aboutSolution: 'Alocação ágil de profissionais para projetos temporários ou estratégicos, garantindo flexibilidade e escala.',
    description: 'Recrutamento massificado com qualidade. Metodologias ágeis para preencher grandes volumes de vagas operacionais.',
    benefits: [
      'Preenchimento rápido de grandes volumes.',
      'Processo otimizado para escala.',
      'Triagem eficiente com uso de tecnologia.'
    ],
    publicNeeds: [
      'Agilidade sem perder qualidade.',
      'Acesso a mais talentos.',
      'Processo estruturado.'
    ],
    areasInvolved: ['RH', 'Gestores'],
    toolsUsed: ['ATS', 'Testes massificados', 'Dinâmicas'],
    laborType: 'Todos os modelos',
    sla: 'Média de 5 a 7 dias úteis.'
  },
  {
    id: 'staffing-celula',
    code: 'Célula Dedicada',
    solutionPackage: 'Staffing',
    name: 'Célula de Staffing',
    aboutSolution: 'Alocação ágil de profissionais para projetos temporários ou estratégicos, garantindo flexibilidade e escala.',
    description: 'Estrutura exclusiva para gerenciar suas operações de staffing. Atendimento personalizado e controle total.',
    benefits: [
      'Gestão próxima e personalizada.',
      'Controle rigoroso de indicadores.',
      'Melhor retenção dos profissionais alocados.'
    ],
    publicNeeds: [
      'Volume de vagas acima da capacidade.',
      'Necessidade de contratar rápido.',
      'Padronização de processo.'
    ],
    areasInvolved: ['Liderança', 'Equipe R&S'],
    toolsUsed: ['ATS', 'PowerBi'],
    laborType: 'Não se Aplica',
    sla: 'Baseado em indicadores de performance.'
  },
  
  // --- TALENT ---
  {
    id: 'talent-estagio-pontual',
    code: 'Estágio',
    solutionPackage: 'Talent',
    name: 'Vaga de Estágio',
    aboutSolution: 'Conectando jovens talentos ao mercado. Programas e vagas de estágio/trainee estruturados e inclusivos.',
    description: 'Seleção ágil de estagiários. Encontramos estudantes com potencial e fit cultural para sua empresa.',
    benefits: [
      'Renovação de ideias com jovens talentos.',
      'Pipeline para futuras efetivações.',
      'Agilidade na triagem de estudantes.'
    ],
    publicNeeds: [
      'Atrair talentos qualificados e diversos.',
      'Fortalecer marca empregadora.',
      'Agilidade e volume.'
    ],
    areasInvolved: ['RH / Talent Acquisition', 'Gestores'],
    toolsUsed: ['Divulgação Universidades', 'ATS', 'Dinâmicas'],
    laborType: 'Estágio',
    sla: '15 a 25 dias.'
  },
  {
    id: 'talent-trainee-pontual',
    code: 'Trainee',
    solutionPackage: 'Talent',
    name: 'Vaga de Trainee',
    aboutSolution: 'Conectando jovens talentos ao mercado. Programas e vagas de estágio/trainee estruturados e inclusivos.',
    description: 'Busca de recém-formados de alto potencial. Jovens preparados para serem os futuros líderes do negócio.',
    benefits: [
      'Formação de sucessores estratégicos.',
      'Injeção de inovação e novas perspectivas.',
      'Candidatos com alta capacidade de aprendizado.'
    ],
    publicNeeds: [
      'Construir pipeline de talento estratégico.',
      'Metodologia sólida de avaliação.',
      'Inovação através de novos talentos.'
    ],
    areasInvolved: ['RH', 'Gestores'],
    toolsUsed: ['ATS', 'Business Cases', 'Dinâmicas'],
    laborType: 'Trainee (CLT)',
    sla: '15 a 25 dias.'
  },
  {
    id: 'talent-programas',
    code: 'Programas',
    solutionPackage: 'Talent',
    name: 'Programa de Estágio/Trainee',
    aboutSolution: 'Conectando jovens talentos ao mercado. Programas e vagas de estágio/trainee estruturados e inclusivos.',
    description: 'Desenho e execução completa do programa. Da atração nas universidades até a integração e desenvolvimento.',
    benefits: [
      'Experiência marcante de marca empregadora.',
      'Processo seletivo gamificado e engajador.',
      'Acompanhamento estruturado do desenvolvimento.'
    ],
    publicNeeds: [
      'Formar futuros líderes.',
      'Garantir processo justo e inclusivo (DEI).',
      'Ter acompanhamento pós-contratação.'
    ],
    areasInvolved: ['RH', 'Marketing', 'DHO'],
    toolsUsed: ['Landing Pages', 'Testes perfil', 'Gamificação', 'PDI'],
    laborType: 'Estágio / Trainee',
    sla: 'Processo: 8-12 semanas. Acompanhamento: 6-12 meses.'
  },

  // --- TECH RECRUITER ---
  {
    id: 'tech-gestao-terceiros',
    code: 'Gestão Terceiros',
    solutionPackage: 'Tech Recruiter',
    name: 'Alocação de Profissionais TI',
    aboutSolution: 'Recrutamento especializado em tecnologia. Metodologias ágeis e experts que falam a língua dos devs.',
    description: 'Terceirização de squads ou especialistas. Aceleramos seu desenvolvimento sem onerar seu headcount.',
    benefits: [
      'Scale-up rápido do time de desenvolvimento.',
      'Acesso a skills específicos (ex: AI, Data).',
      'Foco do time interno no core product.'
    ],
    publicNeeds: [
      'Habilidades especializadas por período limitado.',
      'Redução de carga administrativa de TI.',
      'Flexibilidade em projetos de desenvolvimento.'
    ],
    areasInvolved: ['TI', 'RH'],
    toolsUsed: ['ATS', 'Testes Técnicos'],
    laborType: 'Terceiros TI',
    sla: 'Não se Aplica'
  },
  {
    id: 'tech-rs',
    code: 'R&S',
    solutionPackage: 'Tech Recruiter',
    name: 'R&S Tech',
    aboutSolution: 'Recrutamento especializado em tecnologia. Metodologias ágeis e experts que falam a língua dos devs.',
    description: 'Seleção validada tecnicamente. Testes de código e avaliação por tech recruiters para garantir a entrega.',
    benefits: [
      'Candidatos tecnicamente validados.',
      'Recrutadores que entendem a stack.',
      'Maior aderência técnica e cultural.'
    ],
    publicNeeds: [
      'Assertividade no perfil técnico.',
      'Agilidade (mercado aquecido).',
      'Avaliação técnica profunda.'
    ],
    areasInvolved: ['TI', 'RH'],
    toolsUsed: ['GitHub', 'Testes de Codificação', 'Entrevistas Técnicas'],
    laborType: 'Profissionais TI',
    sla: 'Média de 7 a 10 dias úteis.'
  },
  {
    id: 'tech-hunting',
    code: 'Hunting',
    solutionPackage: 'Tech Recruiter',
    name: 'Hunting Tech Especializado',
    aboutSolution: 'Recrutamento especializado em tecnologia. Metodologias ágeis e experts que falam a língua dos devs.',
    description: 'Busca ativa para posições de nicho ou liderança técnica (CTO, Tech Lead). Encontramos quem não está procurando.',
    benefits: [
      'Acesso a profissionais passivos no mercado.',
      'Abordagem técnica e persuasiva.',
      'Preenchimento de vagas críticas e raras.'
    ],
    publicNeeds: [
      'Talentos escassos.',
      'RH interno sem rede de contatos tech.',
      'Alto custo de vaga aberta em projetos.'
    ],
    areasInvolved: ['TI', 'Liderança'],
    toolsUsed: ['Linkedin Recruiter', 'Canais Tech (StackOverflow, etc)'],
    laborType: 'Especialistas Tech',
    sla: 'Definir com time de seleção.'
  },
  {
    id: 'tech-testes',
    code: 'Testes',
    solutionPackage: 'Tech Recruiter',
    name: 'Avaliação Técnica (Tech)',
    aboutSolution: 'Recrutamento especializado em tecnologia. Metodologias ágeis e experts que falam a língua dos devs.',
    description: 'Aplicação de desafios de código e testes técnicos para validar o conhecimento real dos seus candidatos.',
    benefits: [
      'Filtro técnico imparcial e preciso.',
      'Economia de tempo dos gestores técnicos.',
      'Ranking objetivo dos melhores candidatos.'
    ],
    publicNeeds: [
      'Validar proficiência em linguagens/ferramentas.',
      'Reduzir risco de contratar quem só tem teoria.',
      'Base para planos de treinamento.'
    ],
    areasInvolved: ['RH', 'Gestores Técnicos'],
    toolsUsed: ['Plataformas de teste (HackerRank, etc)'],
    laborType: 'Não se aplica',
    sla: 'Não se aplica'
  },

  // --- TRILHANDO+ ---
  {
    id: 'trilhando-psico',
    code: 'Testes',
    solutionPackage: 'Trilhando +',
    name: 'Avaliação Psicológica',
    aboutSolution: 'Soluções de DHO focadas em Diversidade, Inclusão e Desenvolvimento Organizacional.',
    description: 'Mapeamento profundo de perfil. Laudos psicológicos para apoiar contratações e movimentações seguras.',
    benefits: [
      'Segurança na tomada de decisão.',
      'Previsibilidade de comportamento.',
      'Laudos completos e detalhados.'
    ],
    publicNeeds: [
      'Avaliar competências comportamentais.',
      'Medir habilidades cognitivas (raciocínio, atenção).',
      'Prever comportamento sob pressão.'
    ],
    areasInvolved: ['RH', 'Psicólogos'],
    toolsUsed: ['Testes psicológicos padronizados'],
    laborType: 'Não se aplica',
    sla: 'Não se aplica'
  },
  {
    id: 'trilhando-inventario',
    code: 'Inventários',
    solutionPackage: 'Trilhando +',
    name: 'Mapeamento Comportamental',
    aboutSolution: 'Soluções de DHO focadas em Diversidade, Inclusão e Desenvolvimento Organizacional.',
    description: 'Análise de perfil comportamental (DISC/MBTI) para autoconhecimento, team building e liderança.',
    benefits: [
      'Melhoria na comunicação do time.',
      'Autoconhecimento para colaboradores.',
      'Gestão de conflitos mais eficaz.'
    ],
    publicNeeds: [
      'Evitar desalinhamento de personalidade.',
      'Entender dinâmica de equipe.',
      'Identificar potencial de liderança.'
    ],
    areasInvolved: ['RH', 'Gestão'],
    toolsUsed: ['DISC', 'MBTI', 'Hogan'],
    laborType: 'Não se aplica',
    sla: '2 a 5 dias úteis após aplicação.'
  },
  {
    id: 'trilhando-workshop',
    code: 'Workshop',
    solutionPackage: 'Trilhando +',
    name: 'Workshops e Treinamentos',
    aboutSolution: 'Soluções de DHO focadas em Diversidade, Inclusão e Desenvolvimento Organizacional.',
    description: 'Experiências de aprendizagem dinâmicas. Temas: Liderança, DEI, Comunicação e Cultura.',
    benefits: [
      'Engajamento imediato das equipes.',
      'Aprendizado prático e aplicável.',
      'Sensibilização para temas importantes.'
    ],
    publicNeeds: [
      'Ajustar comportamentos ou gaps.',
      'Sensibilizar times.',
      'Mobilizar em momentos estratégicos.'
    ],
    areasInvolved: ['RH', 'Liderança', 'T&D'],
    toolsUsed: ['Miro', 'Mentimeter', 'Dinâmicas'],
    laborType: 'Não se Aplica',
    sla: '20 a 40 dias (ciclo completo).'
  },
  {
    id: 'trilhando-trilhas',
    code: 'Trilhas',
    solutionPackage: 'Trilhando +',
    name: 'Trilhas de Desenvolvimento',
    aboutSolution: 'Soluções de DHO focadas em Diversidade, Inclusão e Desenvolvimento Organizacional.',
    description: 'Jornadas de desenvolvimento contínuo. Programas estruturados para elevar o nível da sua equipe.',
    benefits: [
      'Desenvolvimento consistente a longo prazo.',
      'Mudança real de mindset e cultura.',
      'Formação robusta de lideranças.'
    ],
    publicNeeds: [
      'Desenvolvimento de competências essenciais.',
      'Engajamento e retenção.',
      'Alinhamento à cultura.'
    ],
    areasInvolved: ['T&D', 'Lideranças'],
    toolsUsed: ['LMS', 'Gamificação', 'Feedback 360'],
    laborType: 'Não se Aplica',
    sla: 'Planejamento: 2-4 semanas.'
  },
  {
    id: 'trilhando-censo',
    code: 'Diagnóstico',
    solutionPackage: 'Trilhando +',
    name: 'Censo e Diagnóstico de DEI',
    aboutSolution: 'Soluções de DHO focadas em Diversidade, Inclusão e Desenvolvimento Organizacional.',
    description: 'Radiografia da sua organização. Dados demográficos e de percepção para guiar sua estratégia de diversidade.',
    benefits: [
      'Dados reais para metas de ESG.',
      'Mapeamento de gaps de representatividade.',
      'Plano de ação baseado em evidências.'
    ],
    publicNeeds: [
      'Mapear demografia interna (Censo).',
      'Definir metas de diversidade.',
      'Mapear insatisfações ocultas.'
    ],
    areasInvolved: ['RH', 'BI'],
    toolsUsed: ['Survey', 'PowerBi'],
    laborType: 'Não se Aplica',
    sla: '20 a 60 dias dependendo do volume.'
  },

  // --- VAREJO PRO ---
  {
    id: 'varejo-rs',
    code: 'R&S',
    solutionPackage: 'Varejo Pro',
    name: 'R&S de Varejo (Volume)',
    aboutSolution: 'Soluções para o dinamismo do varejo. Velocidade, escala e cobertura geográfica.',
    description: 'Recrutamento massivo para lojas. Agilidade máxima para garantir que sua operação não pare.',
    benefits: [
      'Loja sempre com equipe completa.',
      'Processo simplificado e veloz.',
      'Capilaridade para atender redes.'
    ],
    publicNeeds: [
      'Turnover alto.',
      'Necessidade de reposição imediata.',
      'Capilaridade geográfica.'
    ],
    areasInvolved: ['Gerentes Regionais', 'RH Operacional'],
    toolsUsed: ['Triagem com IA', 'Agendamento automático'],
    laborType: 'Operacional Varejo',
    sla: '7 a 10 dias úteis.'
  },
  {
    id: 'varejo-mapeamento',
    code: 'Mapeamento',
    solutionPackage: 'Varejo Pro',
    name: 'Inteligência Regional',
    aboutSolution: 'Soluções para o dinamismo do varejo. Velocidade, escala e cobertura geográfica.',
    description: 'Mapeamento de praças e faixas salariais. Saiba onde abrir lojas e quanto pagar em cada região.',
    benefits: [
      'Abertura de lojas mais assertiva.',
      'Competitividade salarial regional.',
      'Planejamento de expansão seguro.'
    ],
    publicNeeds: [
      'Entender concorrência local.',
      'Densidade de mão de obra disponível.',
      'Inteligência para expansão.'
    ],
    areasInvolved: ['Expansão', 'RH'],
    toolsUsed: ['Geolocalização', 'Dados de mercado'],
    laborType: 'Não se Aplica',
    sla: 'Conforme projeto.'
  }
];