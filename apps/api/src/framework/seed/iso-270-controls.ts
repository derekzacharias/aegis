import { ControlDefinition, ControlMappingSeed } from '../framework.types';

type IsoDomain =
  | 'Organizational Controls'
  | 'People Controls'
  | 'Physical Controls'
  | 'Technological Controls';

type IsoControlSeed = {
  clause: string;
  title: string;
  domain: IsoDomain;
  focus: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  keywords: string[];
};

const isoControlSeeds: IsoControlSeed[] = [
  {
    clause: 'A.5.1',
    title: 'Policies for information security',
    domain: 'Organizational Controls',
    focus: 'define, approve, communicate, and review information security policies that reflect business and regulatory expectations',
    priority: 'P0',
    keywords: ['policy', 'governance', 'direction']
  },
  {
    clause: 'A.5.2',
    title: 'Information security roles and responsibilities',
    domain: 'Organizational Controls',
    focus: 'assign and document information security responsibilities across leadership, control owners, and support roles',
    priority: 'P0',
    keywords: ['roles', 'responsibilities', 'ownership']
  },
  {
    clause: 'A.5.3',
    title: 'Segregation of duties',
    domain: 'Organizational Controls',
    focus: 'segregate conflicting duties and establish compensating controls to prevent fraud, error, or abuse',
    priority: 'P1',
    keywords: ['segregation', 'conflict', 'duties']
  },
  {
    clause: 'A.5.4',
    title: 'Management responsibilities',
    domain: 'Organizational Controls',
    focus: 'ensure managers actively support information security, demonstrate leadership, and enforce control expectations',
    priority: 'P1',
    keywords: ['management', 'leadership', 'accountability']
  },
  {
    clause: 'A.5.5',
    title: 'Contact with authorities',
    domain: 'Organizational Controls',
    focus: 'maintain procedures for timely engagement with law enforcement, regulators, and supervisory bodies',
    priority: 'P2',
    keywords: ['authorities', 'notifications', 'compliance']
  },
  {
    clause: 'A.5.6',
    title: 'Contact with special interest groups',
    domain: 'Organizational Controls',
    focus: 'participate in trusted communities to share threat, vulnerability, and best practice information',
    priority: 'P2',
    keywords: ['information sharing', 'communities', 'threats']
  },
  {
    clause: 'A.5.7',
    title: 'Threat intelligence',
    domain: 'Organizational Controls',
    focus: 'collect, analyse, and act on internal and external threat intelligence relevant to the organization',
    priority: 'P1',
    keywords: ['threats', 'intelligence', 'analysis']
  },
  {
    clause: 'A.5.8',
    title: 'Information security in project management',
    domain: 'Organizational Controls',
    focus: 'embed information security requirements, risk reviews, and acceptance criteria into project delivery',
    priority: 'P1',
    keywords: ['projects', 'risk assessment', 'lifecycle']
  },
  {
    clause: 'A.5.9',
    title: 'Inventory of information and other associated assets',
    domain: 'Organizational Controls',
    focus: 'maintain an accurate inventory of assets, owners, and classification to support risk decisions',
    priority: 'P1',
    keywords: ['asset inventory', 'ownership', 'classification']
  },
  {
    clause: 'A.5.10',
    title: 'Acceptable use of information and other associated assets',
    domain: 'Organizational Controls',
    focus: 'define acceptable use rules for information and assets and communicate them to users',
    priority: 'P1',
    keywords: ['acceptable use', 'policy', 'user guidance']
  },
  {
    clause: 'A.5.11',
    title: 'Return of assets',
    domain: 'Organizational Controls',
    focus: 'recover organization assets when access is revoked or engagement ends',
    priority: 'P2',
    keywords: ['asset return', 'offboarding', 'inventory']
  },
  {
    clause: 'A.5.12',
    title: 'Classification of information',
    domain: 'Organizational Controls',
    focus: 'classify information based on value, sensitivity, and criticality',
    priority: 'P0',
    keywords: ['classification', 'sensitivity', 'data lifecycle']
  },
  {
    clause: 'A.5.13',
    title: 'Labelling of information',
    domain: 'Organizational Controls',
    focus: 'label information in line with the classification scheme to support handling and protection',
    priority: 'P2',
    keywords: ['labelling', 'classification', 'handling']
  },
  {
    clause: 'A.5.14',
    title: 'Information transfer',
    domain: 'Organizational Controls',
    focus: 'control the transfer of information through defined channels, safeguards, and agreements',
    priority: 'P1',
    keywords: ['transfer', 'encryption', 'agreements']
  },
  {
    clause: 'A.5.15',
    title: 'Access control',
    domain: 'Organizational Controls',
    focus: 'establish access control rules aligned to business and information protection requirements',
    priority: 'P0',
    keywords: ['access control', 'policy', 'least privilege']
  },
  {
    clause: 'A.5.16',
    title: 'Identity management',
    domain: 'Organizational Controls',
    focus: 'govern digital identities throughout onboarding, lifecycle changes, and termination',
    priority: 'P0',
    keywords: ['identity', 'provisioning', 'governance']
  },
  {
    clause: 'A.5.17',
    title: 'Authentication information',
    domain: 'Organizational Controls',
    focus: 'protect authentication secrets through strength requirements, lifecycle management, and secure storage',
    priority: 'P0',
    keywords: ['authentication', 'credentials', 'passwords']
  },
  {
    clause: 'A.5.18',
    title: 'Access rights',
    domain: 'Organizational Controls',
    focus: 'grant, review, and revoke access rights based on authorisation and least privilege principles',
    priority: 'P0',
    keywords: ['access rights', 'entitlements', 'recertification']
  },
  {
    clause: 'A.5.19',
    title: 'Information security in supplier relationships',
    domain: 'Organizational Controls',
    focus: 'integrate information security requirements and risk evaluation across supplier lifecycles',
    priority: 'P1',
    keywords: ['supplier', 'third party', 'risk management']
  },
  {
    clause: 'A.5.20',
    title: 'Addressing information security within supplier agreements',
    domain: 'Organizational Controls',
    focus: 'include enforceable information security, privacy, and incident obligations within supplier contracts',
    priority: 'P1',
    keywords: ['contracts', 'suppliers', 'obligations']
  },
  {
    clause: 'A.5.21',
    title: 'Managing information security in the ICT supply chain',
    domain: 'Organizational Controls',
    focus: 'evaluate and monitor ICT supply chain risk, including subservice providers and dependencies',
    priority: 'P1',
    keywords: ['supply chain', 'ICT', 'dependency']
  },
  {
    clause: 'A.5.22',
    title: 'Monitoring, review and change management of supplier services',
    domain: 'Organizational Controls',
    focus: 'review supplier performance, security metrics, and change notifications',
    priority: 'P2',
    keywords: ['supplier', 'monitoring', 'change management']
  },
  {
    clause: 'A.5.23',
    title: 'Information security for use of cloud services',
    domain: 'Organizational Controls',
    focus: 'govern cloud service adoption, shared responsibility, and exit strategies',
    priority: 'P0',
    keywords: ['cloud', 'shared responsibility', 'lifecycle']
  },
  {
    clause: 'A.5.24',
    title: 'Information security incident management planning and preparation',
    domain: 'Organizational Controls',
    focus: 'prepare incident response plans, roles, and communication workflows',
    priority: 'P0',
    keywords: ['incidents', 'response planning', 'communication']
  },
  {
    clause: 'A.5.25',
    title: 'Assessment and decision on information security events',
    domain: 'Organizational Controls',
    focus: 'triage events, determine severity, and escalate when thresholds are met',
    priority: 'P1',
    keywords: ['event triage', 'escalation', 'detection']
  },
  {
    clause: 'A.5.26',
    title: 'Response to information security incidents',
    domain: 'Organizational Controls',
    focus: 'execute containment, eradication, and recovery activities for information security incidents',
    priority: 'P0',
    keywords: ['incident response', 'containment', 'recovery']
  },
  {
    clause: 'A.5.27',
    title: 'Learning from information security incidents',
    domain: 'Organizational Controls',
    focus: 'perform post-incident reviews and capture improvement actions',
    priority: 'P1',
    keywords: ['lessons learned', 'continuous improvement', 'post-incident']
  },
  {
    clause: 'A.5.28',
    title: 'Collection of evidence',
    domain: 'Organizational Controls',
    focus: 'collect and preserve evidence to support investigations and legal proceedings',
    priority: 'P2',
    keywords: ['evidence', 'forensics', 'chain of custody']
  },
  {
    clause: 'A.5.29',
    title: 'Information security during disruptive events',
    domain: 'Organizational Controls',
    focus: 'maintain information security capabilities while managing disruptive events',
    priority: 'P1',
    keywords: ['resilience', 'disruption', 'incident coordination']
  },
  {
    clause: 'A.5.30',
    title: 'ICT readiness for business continuity',
    domain: 'Organizational Controls',
    focus: 'plan and test ICT capabilities that underpin business continuity and recovery',
    priority: 'P0',
    keywords: ['business continuity', 'resilience', 'testing']
  },
  {
    clause: 'A.5.31',
    title: 'Legal, statutory, regulatory and contractual requirements',
    domain: 'Organizational Controls',
    focus: 'identify, document, and monitor compliance obligations relevant to information security',
    priority: 'P0',
    keywords: ['compliance', 'regulation', 'obligations']
  },
  {
    clause: 'A.5.32',
    title: 'Intellectual property rights',
    domain: 'Organizational Controls',
    focus: 'protect intellectual property in line with legal and contractual requirements',
    priority: 'P2',
    keywords: ['intellectual property', 'licensing', 'compliance']
  },
  {
    clause: 'A.5.33',
    title: 'Protection of records',
    domain: 'Organizational Controls',
    focus: 'retain and protect records to meet legal, regulatory, and operational needs',
    priority: 'P1',
    keywords: ['records', 'retention', 'integrity']
  },
  {
    clause: 'A.5.34',
    title: 'Privacy and protection of personally identifiable information (PII)',
    domain: 'Organizational Controls',
    focus: 'apply privacy principles and safeguards to PII throughout its lifecycle',
    priority: 'P0',
    keywords: ['privacy', 'PII', 'data protection']
  },
  {
    clause: 'A.5.35',
    title: 'Independent review of information security',
    domain: 'Organizational Controls',
    focus: 'schedule independent reviews of the information security management system and controls',
    priority: 'P1',
    keywords: ['audit', 'independent review', 'assurance']
  },
  {
    clause: 'A.5.36',
    title: 'Compliance with policies and standards for information security',
    domain: 'Organizational Controls',
    focus: 'monitor adherence to security policies and standards and address deviations',
    priority: 'P1',
    keywords: ['compliance', 'policy', 'enforcement']
  },
  {
    clause: 'A.5.37',
    title: 'Documented operating procedures',
    domain: 'Organizational Controls',
    focus: 'maintain current operating procedures for critical activities and systems',
    priority: 'P2',
    keywords: ['procedures', 'documentation', 'operations']
  },
  {
    clause: 'A.6.1',
    title: 'Screening',
    domain: 'People Controls',
    focus: 'perform background screening aligned to role risk prior to employment or engagement',
    priority: 'P1',
    keywords: ['screening', 'background checks', 'onboarding']
  },
  {
    clause: 'A.6.2',
    title: 'Terms and conditions of employment',
    domain: 'People Controls',
    focus: 'embed security, confidentiality, and acceptable use obligations in employment agreements',
    priority: 'P1',
    keywords: ['employment contracts', 'obligations', 'security clauses']
  },
  {
    clause: 'A.6.3',
    title: 'Information security awareness, education and training',
    domain: 'People Controls',
    focus: 'deliver and track awareness, role-based training, and ongoing education',
    priority: 'P0',
    keywords: ['awareness', 'training', 'culture']
  },
  {
    clause: 'A.6.4',
    title: 'Disciplinary process',
    domain: 'People Controls',
    focus: 'define disciplinary processes for breaches of information security policies',
    priority: 'P2',
    keywords: ['disciplinary', 'policy violation', 'enforcement']
  },
  {
    clause: 'A.6.5',
    title: 'Responsibilities after termination or change of employment',
    domain: 'People Controls',
    focus: 'communicate and enforce continuing obligations following role changes or termination',
    priority: 'P2',
    keywords: ['offboarding', 'responsibilities', 'continuing obligations']
  },
  {
    clause: 'A.6.6',
    title: 'Confidentiality or non-disclosure agreements',
    domain: 'People Controls',
    focus: 'use NDAs that reflect legal and contractual confidentiality requirements',
    priority: 'P1',
    keywords: ['NDA', 'confidentiality', 'agreements']
  },
  {
    clause: 'A.6.7',
    title: 'Remote working',
    domain: 'People Controls',
    focus: 'govern remote working practices, secure environments, and user responsibilities',
    priority: 'P1',
    keywords: ['remote work', 'telework', 'security requirements']
  },
  {
    clause: 'A.6.8',
    title: 'Information security event reporting by users',
    domain: 'People Controls',
    focus: 'enable and encourage personnel to report suspected security events quickly',
    priority: 'P1',
    keywords: ['event reporting', 'awareness', 'communication']
  },
  {
    clause: 'A.7.1',
    title: 'Physical security perimeters',
    domain: 'Physical Controls',
    focus: 'define and protect secure areas with layered physical perimeters',
    priority: 'P1',
    keywords: ['perimeter', 'secure areas', 'boundaries']
  },
  {
    clause: 'A.7.2',
    title: 'Physical entry',
    domain: 'Physical Controls',
    focus: 'control and monitor physical entry points to secure areas',
    priority: 'P1',
    keywords: ['entry control', 'badging', 'monitoring']
  },
  {
    clause: 'A.7.3',
    title: 'Securing offices, rooms and facilities',
    domain: 'Physical Controls',
    focus: 'protect offices, rooms, and facilities against unauthorised access or damage',
    priority: 'P2',
    keywords: ['facilities', 'locks', 'physical security']
  },
  {
    clause: 'A.7.4',
    title: 'Physical security monitoring',
    domain: 'Physical Controls',
    focus: 'monitor secure areas using guards, alarms, or surveillance',
    priority: 'P2',
    keywords: ['monitoring', 'surveillance', 'detection']
  },
  {
    clause: 'A.7.5',
    title: 'Protecting against physical and environmental threats',
    domain: 'Physical Controls',
    focus: 'implement safeguards against fire, flood, seismic, and other environmental hazards',
    priority: 'P1',
    keywords: ['environmental', 'fire', 'resilience']
  },
  {
    clause: 'A.7.6',
    title: 'Working in secure areas',
    domain: 'Physical Controls',
    focus: 'control activities within secure areas, including escorting and supervision',
    priority: 'P2',
    keywords: ['secure areas', 'procedures', 'access']
  },
  {
    clause: 'A.7.7',
    title: 'Visitor access management',
    domain: 'Physical Controls',
    focus: 'manage visitors through registration, supervision, and access restrictions',
    priority: 'P2',
    keywords: ['visitors', 'registration', 'escort']
  },
  {
    clause: 'A.7.8',
    title: 'Clear desk and clear screen',
    domain: 'Physical Controls',
    focus: 'enforce clear desk and clear screen practices to protect sensitive information',
    priority: 'P2',
    keywords: ['clear desk', 'clean screen', 'visual security']
  },
  {
    clause: 'A.7.9',
    title: 'Physical media handling',
    domain: 'Physical Controls',
    focus: 'control the protection, storage, transfer, and disposal of physical media',
    priority: 'P2',
    keywords: ['media handling', 'storage', 'transport']
  },
  {
    clause: 'A.7.10',
    title: 'Equipment siting and protection',
    domain: 'Physical Controls',
    focus: 'site and protect equipment to reduce risks from environmental and physical threats',
    priority: 'P2',
    keywords: ['equipment', 'placement', 'protection']
  },
  {
    clause: 'A.7.11',
    title: 'Supporting utility services',
    domain: 'Physical Controls',
    focus: 'provide resilient power, cooling, and other utilities required for information systems',
    priority: 'P1',
    keywords: ['utilities', 'power', 'cooling']
  },
  {
    clause: 'A.7.12',
    title: 'Cabling security',
    domain: 'Physical Controls',
    focus: 'protect power and network cabling from interception or damage',
    priority: 'P2',
    keywords: ['cabling', 'tamper', 'protection']
  },
  {
    clause: 'A.7.13',
    title: 'Equipment maintenance',
    domain: 'Physical Controls',
    focus: 'maintain equipment securely, including controls for vendor access and maintenance records',
    priority: 'P2',
    keywords: ['maintenance', 'service', 'records']
  },
  {
    clause: 'A.7.14',
    title: 'Secure disposal or re-use of equipment',
    domain: 'Physical Controls',
    focus: 'erase or destroy data and remove assets securely before disposal or reuse',
    priority: 'P1',
    keywords: ['disposal', 'sanitization', 'asset lifecycle']
  },
  {
    clause: 'A.8.1',
    title: 'User endpoint devices',
    domain: 'Technological Controls',
    focus: 'secure endpoint devices through configuration, monitoring, and lifecycle management',
    priority: 'P0',
    keywords: ['endpoints', 'hardening', 'device management']
  },
  {
    clause: 'A.8.2',
    title: 'Privileged access rights',
    domain: 'Technological Controls',
    focus: 'limit and monitor privileged access and enforce approvals for elevation',
    priority: 'P0',
    keywords: ['privileged access', 'admin', 'least privilege']
  },
  {
    clause: 'A.8.3',
    title: 'Information access restriction',
    domain: 'Technological Controls',
    focus: 'restrict access to information based on need-to-know and data classification',
    priority: 'P0',
    keywords: ['access restriction', 'need to know', 'authorization']
  },
  {
    clause: 'A.8.4',
    title: 'Access to source code',
    domain: 'Technological Controls',
    focus: 'control and monitor access to source code repositories and tooling',
    priority: 'P1',
    keywords: ['source code', 'repositories', 'access control']
  },
  {
    clause: 'A.8.5',
    title: 'Secure authentication',
    domain: 'Technological Controls',
    focus: 'enforce strong, risk-based authentication across systems and services',
    priority: 'P0',
    keywords: ['authentication', 'MFA', 'credentials']
  },
  {
    clause: 'A.8.6',
    title: 'Capacity management',
    domain: 'Technological Controls',
    focus: 'monitor resource capacity and plan for growth to maintain performance and availability',
    priority: 'P2',
    keywords: ['capacity', 'monitoring', 'planning']
  },
  {
    clause: 'A.8.7',
    title: 'Protection against malware',
    domain: 'Technological Controls',
    focus: 'deploy layered malware defenses, updates, and user safeguards',
    priority: 'P0',
    keywords: ['malware', 'antivirus', 'malicious code']
  },
  {
    clause: 'A.8.8',
    title: 'Management of technical vulnerabilities',
    domain: 'Technological Controls',
    focus: 'discover, prioritise, and remediate technical vulnerabilities in a timely manner',
    priority: 'P0',
    keywords: ['vulnerabilities', 'patching', 'remediation']
  },
  {
    clause: 'A.8.9',
    title: 'Configuration management',
    domain: 'Technological Controls',
    focus: 'establish secure configurations, baselines, and change tracking for systems',
    priority: 'P0',
    keywords: ['configuration', 'baselines', 'change control']
  },
  {
    clause: 'A.8.10',
    title: 'Information deletion',
    domain: 'Technological Controls',
    focus: 'ensure information is deleted securely when no longer required',
    priority: 'P1',
    keywords: ['deletion', 'sanitization', 'data lifecycle']
  },
  {
    clause: 'A.8.11',
    title: 'Data masking',
    domain: 'Technological Controls',
    focus: 'apply masking or obfuscation to limit exposure of sensitive data',
    priority: 'P1',
    keywords: ['masking', 'tokenization', 'privacy']
  },
  {
    clause: 'A.8.12',
    title: 'Data leakage prevention',
    domain: 'Technological Controls',
    focus: 'detect and prevent unauthorised disclosure of sensitive information',
    priority: 'P1',
    keywords: ['DLP', 'exfiltration', 'monitoring']
  },
  {
    clause: 'A.8.13',
    title: 'Information backup',
    domain: 'Technological Controls',
    focus: 'perform reliable backups and test restoration of information and systems',
    priority: 'P0',
    keywords: ['backup', 'recovery', 'testing']
  },
  {
    clause: 'A.8.14',
    title: 'Redundancy of information processing facilities',
    domain: 'Technological Controls',
    focus: 'design redundant infrastructure to meet availability requirements',
    priority: 'P1',
    keywords: ['redundancy', 'availability', 'resilience']
  },
  {
    clause: 'A.8.15',
    title: 'Logging',
    domain: 'Technological Controls',
    focus: 'record security-relevant events with sufficient detail for investigations',
    priority: 'P0',
    keywords: ['logging', 'audit trails', 'telemetry']
  },
  {
    clause: 'A.8.16',
    title: 'Monitoring activities',
    domain: 'Technological Controls',
    focus: 'monitor system and network activity to detect anomalous behaviour',
    priority: 'P0',
    keywords: ['monitoring', 'detection', 'analytics']
  },
  {
    clause: 'A.8.17',
    title: 'Clock synchronization',
    domain: 'Technological Controls',
    focus: 'use synchronized time sources to ensure log and event accuracy',
    priority: 'P2',
    keywords: ['time sync', 'NTP', 'logging']
  },
  {
    clause: 'A.8.18',
    title: 'Use of privileged utility programs',
    domain: 'Technological Controls',
    focus: 'control and monitor privileged utilities that can bypass security controls',
    priority: 'P1',
    keywords: ['privileged tools', 'administration', 'monitoring']
  },
  {
    clause: 'A.8.19',
    title: 'Installation of new software on operational systems',
    domain: 'Technological Controls',
    focus: 'manage software installation through approval and change control',
    priority: 'P1',
    keywords: ['software installation', 'change control', 'operations']
  },
  {
    clause: 'A.8.20',
    title: 'Network controls',
    domain: 'Technological Controls',
    focus: 'design and operate secure network architectures and services',
    priority: 'P0',
    keywords: ['networking', 'architecture', 'firewalls']
  },
  {
    clause: 'A.8.21',
    title: 'Security of network services',
    domain: 'Technological Controls',
    focus: 'ensure network services meet security requirements and are monitored for effectiveness',
    priority: 'P1',
    keywords: ['network services', 'SLAs', 'monitoring']
  },
  {
    clause: 'A.8.22',
    title: 'Segregation of networks',
    domain: 'Technological Controls',
    focus: 'segregate networks to isolate systems based on risk and trust levels',
    priority: 'P0',
    keywords: ['segmentation', 'zones', 'isolation']
  },
  {
    clause: 'A.8.23',
    title: 'Web filtering',
    domain: 'Technological Controls',
    focus: 'control access to web content to reduce malware, phishing, and data loss risks',
    priority: 'P2',
    keywords: ['web filtering', 'content control', 'proxy']
  },
  {
    clause: 'A.8.24',
    title: 'Use of cryptography',
    domain: 'Technological Controls',
    focus: 'apply cryptography based on risk, legal, and contractual needs',
    priority: 'P0',
    keywords: ['cryptography', 'encryption', 'standards']
  },
  {
    clause: 'A.8.25',
    title: 'Key management',
    domain: 'Technological Controls',
    focus: 'manage cryptographic keys across generation, distribution, storage, and destruction',
    priority: 'P0',
    keywords: ['key management', 'encryption', 'lifecycle']
  },
  {
    clause: 'A.8.26',
    title: 'Secure development life cycle',
    domain: 'Technological Controls',
    focus: 'embed security activities across the development life cycle',
    priority: 'P0',
    keywords: ['SDLC', 'secure development', 'process']
  },
  {
    clause: 'A.8.27',
    title: 'Application security requirements',
    domain: 'Technological Controls',
    focus: 'define security requirements for applications and services',
    priority: 'P0',
    keywords: ['requirements', 'applications', 'design']
  },
  {
    clause: 'A.8.28',
    title: 'Secure system architecture and engineering principles',
    domain: 'Technological Controls',
    focus: 'apply security architecture and engineering principles to systems',
    priority: 'P0',
    keywords: ['architecture', 'engineering', 'design principles']
  },
  {
    clause: 'A.8.29',
    title: 'Secure coding',
    domain: 'Technological Controls',
    focus: 'use secure coding standards, reviews, and tooling to prevent vulnerabilities',
    priority: 'P0',
    keywords: ['secure coding', 'code review', 'static analysis']
  },
  {
    clause: 'A.8.30',
    title: 'Security testing in development and acceptance',
    domain: 'Technological Controls',
    focus: 'conduct security testing during development and before acceptance into production',
    priority: 'P0',
    keywords: ['security testing', 'QA', 'validation']
  },
  {
    clause: 'A.8.31',
    title: 'Separation of development, test and production environments',
    domain: 'Technological Controls',
    focus: 'segregate environments and enforce controls on promotion paths',
    priority: 'P1',
    keywords: ['environment separation', 'change control', 'SDLC']
  },
  {
    clause: 'A.8.32',
    title: 'Change management',
    domain: 'Technological Controls',
    focus: 'manage changes to systems and services using formal approval and rollback processes',
    priority: 'P0',
    keywords: ['change management', 'CAB', 'process']
  },
  {
    clause: 'A.8.33',
    title: 'Test data',
    domain: 'Technological Controls',
    focus: 'control the protection and anonymisation of test data',
    priority: 'P2',
    keywords: ['test data', 'anonymisation', 'privacy']
  },
  {
    clause: 'A.8.34',
    title: 'Protection of information in application services',
    domain: 'Technological Controls',
    focus: 'protect information processed by application services, including transactional flows and interfaces',
    priority: 'P1',
    keywords: ['application services', 'transactions', 'integrity']
  }
];

const toControlId = (framework: 'iso-27001-2022' | 'iso-27002-2022', clause: string) =>
  `${framework}-${clause.replace(/\./g, '-').toLowerCase()}`;

const toDomainTag = (domain: IsoDomain) => domain.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const buildDescription = (seed: IsoControlSeed, variant: '27001' | '27002'): string => {
  const action =
    seed.focus.charAt(0).toUpperCase() + seed.focus.slice(1);
  if (variant === '27001') {
    return `${action} to meet the objectives of ISO/IEC 27001 Annex A ${seed.clause} and demonstrate effective control of the risk.`;
  }
  return `${action}, offering implementation detail, operating practices, and evidence considerations aligned to ISO/IEC 27002 ${seed.clause}.`;
};

export const iso27001Controls: ControlDefinition[] = isoControlSeeds.map((seed) => ({
  id: toControlId('iso-27001-2022', seed.clause),
  frameworkId: 'iso-27001-2022',
  kind: 'base',
  family: seed.domain,
  title: seed.title,
  description: buildDescription(seed, '27001'),
  priority: seed.priority,
  keywords: seed.keywords,
  tags: ['iso27001', 'annex-a', toDomainTag(seed.domain)],
  metadata: {
    clause: seed.clause,
    domain: seed.domain,
    annex: 'Annex A',
    source: 'ISO/IEC 27001:2022',
    focus: seed.focus
  }
}));

export const iso27002Controls: ControlDefinition[] = isoControlSeeds.map((seed) => ({
  id: toControlId('iso-27002-2022', seed.clause),
  frameworkId: 'iso-27002-2022',
  kind: 'base',
  family: seed.domain,
  title: seed.title,
  description: buildDescription(seed, '27002'),
  priority: seed.priority,
  keywords: [...seed.keywords, 'guidance'],
  tags: ['iso27002', 'annex-a', toDomainTag(seed.domain)],
  metadata: {
    clause: seed.clause,
    domain: seed.domain,
    annex: 'Annex A',
    source: 'ISO/IEC 27002:2022',
    focus: seed.focus,
    guidance: true
  }
}));

export const isoCrosswalkMappings: ControlMappingSeed[] = isoControlSeeds.map((seed) => ({
  sourceControlId: toControlId('iso-27001-2022', seed.clause),
  targetControlId: toControlId('iso-27002-2022', seed.clause),
  confidence: 0.98,
  tags: ['iso27001', 'iso27002', toDomainTag(seed.domain)],
  origin: 'SEED',
  rationale: `ISO/IEC 27002 ${seed.clause} expands on ISO/IEC 27001 Annex A ${seed.clause} with implementation guidance and illustrative measures.`
}));

export const ISO_CONTROL_COUNT = isoControlSeeds.length;
