export const jobs = [
  {
    company: "Google LLC",
    role: "Software Engineer",
    initials: "G",
    color: "blue",
    tags: [
      "Data Structures & Algorithms",
      "Python",
      "C++",
      "System Design",
      "Operating Systems",
      "Computer Networks",
      "Object-Oriented Design",
      "Testing",
      "Communication",
    ],
    jdSkills: [
      {
        skill_name: "Data Structures & Algorithms",
        category_code: "DSA",
        confidence: "high",
      },
      { skill_name: "Python", category_code: "COD", confidence: "high" },
      { skill_name: "C++", category_code: "COD", confidence: "high" },
      {
        skill_name: "System Design",
        category_code: "SYSD",
        confidence: "high",
      },
      {
        skill_name: "Operating Systems",
        category_code: "OS",
        confidence: "high",
      },
      {
        skill_name: "Computer Networks",
        category_code: "NETW",
        confidence: "medium",
      },
      {
        skill_name: "Object-Oriented Design",
        category_code: "OOD",
        confidence: "medium",
      },
      { skill_name: "Unit Testing", category_code: "SWE", confidence: "high" },
      {
        skill_name: "Communication",
        category_code: "COMM",
        confidence: "high",
      },
    ],
  },
  {
    company: "Google LLC",
    role: "Data Scientist",
    initials: "G",
    color: "blue",
    tags: [
      "SQL",
      "Python",
      "Machine Learning",
      "Probability & Statistics",
      "A/B Testing",
      "Communication",
    ],
    jdSkills: [
      { skill_name: "SQL", category_code: "SQL", confidence: "high" },
      { skill_name: "Python", category_code: "COD", confidence: "high" },
      {
        skill_name: "Machine Learning",
        category_code: "AI",
        confidence: "high",
      },
      {
        skill_name: "Probability & Statistics",
        category_code: "APTI",
        confidence: "high",
      },
      { skill_name: "A/B Testing", category_code: "SWE", confidence: "medium" },
      {
        skill_name: "Communication",
        category_code: "COMM",
        confidence: "high",
      },
    ],
  },
  {
    company: "Microsoft",
    role: "Software Engineer",
    initials: "M",
    color: "green",
    tags: [
      "Data Structures & Algorithms",
      "Cloud",
      "C#",
      "Python",
      "Software Engineering",
      "System Design",
      "Object-Oriented Programming",
    ],
    jdSkills: [
      {
        skill_name: "Data Structures & Algorithms",
        category_code: "DSA",
        confidence: "high",
      },
      {
        skill_name: "Azure / Cloud",
        category_code: "CLOUD",
        confidence: "high",
      },
      { skill_name: "C#", category_code: "COD", confidence: "high" },
      { skill_name: "Python", category_code: "COD", confidence: "high" },
      {
        skill_name: "CI/CD & Testing",
        category_code: "SWE",
        confidence: "high",
      },
      {
        skill_name: "Distributed Systems",
        category_code: "SYSD",
        confidence: "high",
      },
      {
        skill_name: "Object-Oriented Programming",
        category_code: "OOD",
        confidence: "medium",
      },
    ],
  },
  {
    company: "Microsoft",
    role: "Data Analyst",
    initials: "M",
    color: "green",
    tags: [
      "SQL",
      "Power BI",
      "Python",
      "Data Modeling",
      "Quantitative Aptitude",
      "Communication",
    ],
    jdSkills: [
      { skill_name: "SQL", category_code: "SQL", confidence: "high" },
      {
        skill_name: "Data Visualization",
        category_code: "AI",
        confidence: "high",
      },
      { skill_name: "Python", category_code: "COD", confidence: "high" },
      {
        skill_name: "Cloud / Azure",
        category_code: "CLOUD",
        confidence: "medium",
      },
      {
        skill_name: "Quantitative Aptitude",
        category_code: "APTI",
        confidence: "high",
      },
      {
        skill_name: "Communication",
        category_code: "COMM",
        confidence: "high",
      },
    ],
  },
  {
    company: "Oracle",
    role: "Associate Software Engineer",
    initials: "O",
    color: "purple",
    tags: [
      "Java",
      "SQL",
      "Data Structures",
      "OOP",
      "Operating Systems",
      "Quantitative Aptitude",
      "Agile",
    ],
    jdSkills: [
      { skill_name: "Java", category_code: "COD", confidence: "high" },
      { skill_name: "SQL", category_code: "SQL", confidence: "high" },
      {
        skill_name: "Data Structures",
        category_code: "DSA",
        confidence: "high",
      },
      {
        skill_name: "Object-Oriented Programming",
        category_code: "OOD",
        confidence: "high",
      },
      {
        skill_name: "Operating Systems",
        category_code: "OS",
        confidence: "medium",
      },
      {
        skill_name: "Quantitative Aptitude",
        category_code: "APTI",
        confidence: "high",
      },
      {
        skill_name: "Agile / Documentation",
        category_code: "SWE",
        confidence: "medium",
      },
    ],
  },
  {
    company: "Oracle",
    role: "Application Support Analyst",
    initials: "O",
    color: "purple",
    tags: [
      "SQL",
      "Linux",
      "Networking",
      "Troubleshooting",
      "Client Communication",
    ],
    jdSkills: [
      { skill_name: "SQL", category_code: "SQL", confidence: "high" },
      { skill_name: "Linux", category_code: "OS", confidence: "high" },
      {
        skill_name: "Computer Networks",
        category_code: "NETW",
        confidence: "high",
      },
      {
        skill_name: "Troubleshooting",
        category_code: "APTI",
        confidence: "high",
      },
      {
        skill_name: "Communication",
        category_code: "COMM",
        confidence: "high",
      },
    ],
  },
];

export const candidates = [
  {
    id: "candidate-ananya",
    name: "Ananya Rao",
    email: "ananya.rao@example.com",
    role: "Senior Cloud & Full-Stack Engineer",
    education: "B.Tech in Computer Science",
    university: "BITS Pilani",
    year: "2021",
    skills: [
      {
        skill_name: "React.js",
        category_code: "COD",
        level: 8,
        confidence: "high",
        evidence: "Built multi-tenant enterprise dashboards.",
      },
      {
        skill_name: "Node.js / Express",
        category_code: "COD",
        level: 8,
        confidence: "high",
        evidence: "Engineered scalable REST microservices.",
      },
      {
        skill_name: "AWS & Docker",
        category_code: "CLOUD",
        level: 7,
        confidence: "medium",
        evidence: "Containerized deployment fleet on ECS.",
      },
      {
        skill_name: "PostgreSQL",
        category_code: "SQL",
        level: 7,
        confidence: "high",
        evidence: "Optimized complex analytical queries.",
      },
      {
        skill_name: "System Design",
        category_code: "SYSD",
        level: 6,
        confidence: "medium",
        evidence: "Inferred from architectural RFC lead.",
      },
    ],
    experience: [
      {
        role: "Software Engineer",
        company: "Zeta Platforms",
        duration: "2022 - Present",
        details: "Scaled web application services to 200k daily active users.",
      },
    ],
    projects: [
      {
        title: "Real-time Collaboration Canvas",
        description:
          "WebSocket-based live whiteboard with CRDT conflict resolution.",
      },
    ],
  },
  {
    id: "candidate-karthik",
    name: "Karthik Subramaniam",
    email: "karthik.s@example.com",
    role: "Backend & Distributed Systems Engineer",
    education: "B.E. in Information Technology",
    university: "NIT Trichy",
    year: "2020",
    skills: [
      {
        skill_name: "Golang & Concurrency",
        category_code: "COD",
        level: 9,
        confidence: "high",
        evidence: "Architected consensus storage engine in Go.",
      },
      {
        skill_name: "Data Structures & Algorithms",
        category_code: "DSA",
        level: 8,
        confidence: "high",
        evidence: "Production Raft state machine implementation.",
      },
      {
        skill_name: "Apache Kafka",
        category_code: "SYSD",
        level: 8,
        confidence: "high",
        evidence: "Constructed streaming event bus handling 2.4B events/day.",
      },
      {
        skill_name: "Kubernetes Ops",
        category_code: "CLOUD",
        level: 7,
        confidence: "medium",
        evidence: "Administered 400+ bare metal cluster nodes.",
      },
      {
        skill_name: "Linux Systems",
        category_code: "OS",
        level: 8,
        confidence: "high",
        evidence: "Low-level socket profiling and memory vacuum tuning.",
      },
    ],
    experience: [
      {
        role: "Staff Systems Engineer",
        company: "ScaleOps Labs",
        duration: "2022 - Present",
        details:
          "Led core infrastructure guild and multi-region consensus protocol.",
      },
    ],
    projects: [
      {
        title: "Raft Distributed Key-Value Store",
        description:
          "Consensus-backed persistent key-value store with sub-4ms p99 latency.",
      },
    ],
  },
  {
    id: "candidate-priya",
    name: "Priya Menon",
    email: "priya.menon@example.com",
    role: "Data Scientist & ML Engineer",
    education: "M.S. in Data Science",
    university: "IISc Bangalore",
    year: "2021",
    skills: [
      {
        skill_name: "Python & PyTorch",
        category_code: "COD",
        level: 9,
        confidence: "high",
        evidence: "Fine-tuned transformer models for domain adaptation.",
      },
      {
        skill_name: "Machine Learning & NLP",
        category_code: "AI",
        level: 9,
        confidence: "high",
        evidence:
          "Published research on semantic tokenization in biomedical text.",
      },
      {
        skill_name: "SQL & Data Warehousing",
        category_code: "SQL",
        level: 8,
        confidence: "high",
        evidence: "Engineered feature extraction pipelines in BigQuery.",
      },
      {
        skill_name: "Probability & Statistics",
        category_code: "APTI",
        level: 8,
        confidence: "high",
        evidence:
          "Rigorous statistical hypothesis testing for clinical cohorts.",
      },
    ],
    experience: [
      {
        role: "Senior Data Scientist",
        company: "BioCognition AI",
        duration: "2021 - Present",
        details: "Delivered predictive diagnostic models with 96% ROC-AUC.",
      },
    ],
    projects: [
      {
        title: "Clinical Entity Extractor",
        description:
          "Biomedical NER and relation extraction pipeline using HuggingFace.",
      },
    ],
  },
  {
    id: "candidate-rohan",
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    role: "Site Reliability & Cloud Security Engineer",
    education: "B.Tech in Computer Engineering",
    university: "IIT Kharagpur",
    year: "2022",
    skills: [
      {
        skill_name: "Kubernetes & Terraform",
        category_code: "CLOUD",
        level: 8,
        confidence: "high",
        evidence: "Infrastructure as Code multi-cloud cluster provisioning.",
      },
      {
        skill_name: "Network Security & Zero Trust",
        category_code: "NETW",
        level: 8,
        confidence: "high",
        evidence:
          "Enforced mTLS and service mesh policies across 80 microservices.",
      },
      {
        skill_name: "Python Automation",
        category_code: "COD",
        level: 7,
        confidence: "medium",
        evidence: "Automated incident response runbooks and health probes.",
      },
      {
        skill_name: "Observability (Prometheus/Grafana)",
        category_code: "SWE",
        level: 8,
        confidence: "high",
        evidence:
          "Designed SLI/SLO dashboards and latency alerting thresholds.",
      },
    ],
    experience: [
      {
        role: "DevOps Engineer",
        company: "CloudScale Infra",
        duration: "2022 - Present",
        details:
          "Maintained 99.99% service availability across 3 global regions.",
      },
    ],
    projects: [
      {
        title: "Zero Trust Service Mesh Deployment",
        description:
          "Automated mTLS and perimeter verification for Kubernetes deployments.",
      },
    ],
  },
];
