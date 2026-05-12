import OpenAI from "openai";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing in server environment");
  }

  return new OpenAI({ apiKey });
};

const isQuotaError = (error) => {
  const status = error?.status;
  const code = error?.code || error?.error?.code;
  const message = String(error?.message || "").toLowerCase();

  return (
    status === 429 ||
    code === "insufficient_quota" ||
    message.includes("insufficient_quota") ||
    message.includes("exceeded your current quota")
  );
};

const buildCVFallback = (cvText, jobDescription) => {
  const words = cvText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const hasExperience = words.some((w) =>
    ["experience", "years", "worked", "led", "built"].includes(w)
  );
  const hasEducation = words.some((w) =>
    ["bachelor", "master", "degree", "university", "college"].includes(w)
  );
  const hasSkills = words.some((w) =>
    ["javascript", "python", "react", "node", "sql", "aws"].includes(w)
  );

  const baseStrengths = [
    hasExperience
      ? "Your CV shows practical experience and ownership of real work."
      : "Your CV can be improved by highlighting measurable project/work experience.",
    hasSkills
      ? "You included technical skills, which helps recruiters scan quickly."
      : "Add a dedicated skills section with tools, technologies, and proficiency level.",
    hasEducation
      ? "Your education background is present and adds context for hiring teams."
      : "Include your education/certifications section for completeness.",
  ];

  const matchLine = jobDescription
    ? "Match estimate: Moderate fit. Improve keyword alignment between your CV and the job description responsibilities."
    : "Match estimate: Add a target role section to improve relevance for specific jobs.";

  return [
    "AI quota is currently exceeded, so this is a local fallback analysis.",
    "",
    "1. Key strengths",
    `- ${baseStrengths[0]}`,
    `- ${baseStrengths[1]}`,
    "",
    "2. Areas to improve",
    `- ${baseStrengths[2]}`,
    "- Add 3-5 quantified achievements (numbers, %, impact).",
    "- Tailor your summary to the exact role title you are applying for.",
    "",
    "3. Recommendations",
    `- ${matchLine}`,
    "- Keep CV length to 1-2 pages and use clear section headings.",
    "- Ensure each role includes outcome-focused bullet points.",
    "",
    "4. Top 3 action items",
    "- Add measurable achievements to each recent role.",
    "- Align wording with target job requirements.",
    "- Add/refresh core skills and certifications section.",
  ].join("\n");
};

const buildCoverLetterFallback = ({
  jobTitle,
  companyName,
  cvHighlights,
  tone,
}) => {
  const introTone = tone === "friendly" ? "I am excited to apply" : "I am writing to apply";

  return `${introTone} for the ${jobTitle} role at ${companyName}. With experience in delivering high-impact outcomes and collaborating across teams, I am confident I can contribute immediate value.

${cvHighlights ? `My background includes ${cvHighlights}. ` : "My background includes strong problem-solving, execution, and communication skills. "}I focus on translating goals into practical results while maintaining quality and speed.

I am particularly interested in ${companyName} because of its focus on building meaningful solutions. I would welcome the opportunity to support your team by bringing ownership, adaptability, and a strong delivery mindset to the ${jobTitle} position.

Thank you for your time and consideration. I would appreciate the opportunity to discuss how my skills and experience align with your needs.

Sincerely,
[Your Name]`;
};

const buildFormDraftFallback = ({
  jobTitle,
  companyName,
  jobDescription,
  responsibilities,
  skills,
  candidateName,
  candidateEmail,
  candidatePhone,
  coverLetter,
  message,
}) => {
  const roleContext = [jobTitle, companyName].filter(Boolean).join(" at ");
  const responsibilityLine = responsibilities
    ? `The role emphasizes ${responsibilities}. `
    : "";
  const skillLine = skills ? `Relevant skills to highlight include ${skills}. ` : "";

  const coverLetterDraft = coverLetter?.trim()
    ? coverLetter.trim()
    : `Dear Hiring Team${companyName ? ` at ${companyName}` : ""},

I am writing to express my interest in the ${jobTitle || "open"} role${
      companyName ? ` at ${companyName}` : ""
    }. ${jobDescription ? `${jobDescription.trim().slice(0, 220)}. ` : ""}${responsibilityLine}${skillLine}I would welcome the opportunity to contribute with a strong work ethic, clear communication, and a results-focused mindset.

Thank you for your consideration. I look forward to the opportunity to discuss how I can add value to your team.

Sincerely,
${candidateName || "[Your Name]"}`;

  const messageDraft = message?.trim()
    ? message.trim()
    : `${candidateName ? `My name is ${candidateName}. ` : ""}${
        candidateEmail ? `You can reach me at ${candidateEmail}. ` : ""
      }${candidatePhone ? `My contact number is ${candidatePhone}. ` : ""}I am reaching out about the ${roleContext || "role"}. ${
        jobDescription ? "The opportunity looks like a strong fit based on the posted requirements. " : ""
      }Please let me know the next steps and any additional information you need from me.`;

  return {
    coverLetter: coverLetterDraft,
    message: messageDraft,
    suggestedName: candidateName || "",
    suggestedEmail: candidateEmail || "",
    suggestedPhone: candidatePhone || "",
  };
};

const buildJobDescriptionFallback = ({
  jobTitle,
  companyName,
  department,
  seniority,
  keyResponsibilities,
}) => {
  return `Job Title: ${jobTitle}
Company: ${companyName}
${department ? `Department: ${department}\n` : ""}${seniority ? `Level: ${seniority}\n` : ""}
Job Description:
${companyName} is seeking a ${jobTitle} to drive execution, collaboration, and business impact through high-quality delivery.

Requirements:
- Demonstrated professional experience relevant to the ${jobTitle} role.
- Strong communication, problem-solving, and time management skills.
- Ability to work collaboratively and handle changing priorities.
${keyResponsibilities ? `- Additional focus areas: ${keyResponsibilities}\n` : ""}

Duties:
- Deliver core outcomes for the ${jobTitle} function and track progress against goals.
- Collaborate with cross-functional teams to define priorities and timelines.
- Maintain quality standards, documentation, and communication with stakeholders.
- Identify process improvements and contribute to operational excellence.

Qualifications:
- Relevant professional experience in a similar role.
- Strong communication and problem-solving skills.
- Ability to prioritize work in a fast-paced environment.
- Proficiency with standard tools used in the role.

`;
};

const buildJobPostDraftFallback = ({
  title,
  company,
  location,
  category,
  employmentType,
  salaryRange,
  experienceLevel,
  description,
  responsibilities,
  skills,
  tags,
}) => {
  const headline = title || "Open Role";
  const employer = company || "the company";
  const roleLocation = location || "Remote / Hybrid";
  const roleCategory = category || "General";
  const roleType = employmentType || "Full time";
  const roleSalary = salaryRange || "Negotiable";
  const roleExperience = experienceLevel || "Mid-level";

  const descriptionText = description?.trim()
    ? description.trim()
    : `We are hiring a ${headline} to support key business outcomes for ${employer}. This role is based in ${roleLocation} and requires a proactive, collaborative professional who can deliver measurable results.`;

  const responsibilityList = responsibilities?.trim()
    ? responsibilities
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [
        `Own day-to-day delivery for the ${headline} function`,
        "Collaborate with cross-functional stakeholders to meet deadlines",
        "Maintain quality, documentation, and clear communication",
        "Identify process improvements and execute on them",
      ];

  const skillsList = skills?.trim()
    ? skills
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [
        "Strong communication",
        "Problem solving",
        "Ownership and accountability",
        "Relevant technical or domain expertise",
      ];

  const tagList = tags?.trim()
    ? tags
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [roleCategory, roleType, roleLocation].filter(Boolean);

  return {
    title: headline,
    company: employer,
    location: roleLocation,
    category: roleCategory,
    employmentType: roleType,
    salaryRange: roleSalary,
    experienceLevel: roleExperience,
    description: descriptionText,
    responsibilities: responsibilityList.join(", "),
    skills: skillsList.join(", "),
    tags: tagList.join(", "),
  };
};

export const analyzeCV = async (req, res) => {
  try {
    const { cvText, jobDescription } = req.body;

    if (!cvText) {
      return res.status(400).json({ error: "CV text is required" });
    }

    // If OpenAI key is missing or left as a placeholder, return a local fallback analysis
    if (!process.env.OPENAI_API_KEY || String(process.env.OPENAI_API_KEY).includes('REDACTED')) {
      console.warn("OPENAI_API_KEY not set or placeholder detected — returning local fallback analysis.");
      return res.json({
        success: true,
        fallback: true,
        analysis: buildCVFallback(cvText, jobDescription),
      });
    }

    const openai = getOpenAIClient();

    const prompt = jobDescription
      ? `Analyze this CV in the context of the following job description and provide insights:

Job Description:
${jobDescription}

CV Content:
${cvText}

Please provide:
1. Key strengths relative to the job
2. Gaps or areas to improve
3. Specific recommendations for this role
4. Match percentage (0-100%)
5. Top 3 action items to strengthen the application`
      : `Analyze this CV and provide comprehensive feedback:

CV Content:
${cvText}

Please provide:
1. Key strengths
2. Areas for improvement
3. Missing sections or information
4. Specific recommendations to strengthen the CV
5. Top 3 action items for improvement`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const analysis = response.choices[0].message.content;

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("CV Analysis Error:", error);

    if (isQuotaError(error)) {
      return res.json({
        success: true,
        fallback: true,
        analysis: buildCVFallback(req.body?.cvText || "", req.body?.jobDescription || ""),
      });
    }

    res.status(500).json({
      error: error.message || "Failed to analyze CV",
    });
  }
};

// Reusable programmatic CV analysis helper (returns analysis string)
export const analyzeCVContent = async (cvText, jobDescription) => {
  if (!cvText) {
    throw new Error("CV text is required");
  }

  if (!process.env.OPENAI_API_KEY || String(process.env.OPENAI_API_KEY).includes('REDACTED')) {
    return buildCVFallback(cvText, jobDescription);
  }

  const openai = getOpenAIClient();

  const prompt = jobDescription
    ? `Analyze this CV in the context of the following job description and provide insights:

Job Description:
${jobDescription}

CV Content:
${cvText}

Please provide:
1. Key strengths relative to the job
2. Gaps or areas to improve
3. Specific recommendations for this role
4. Match percentage (0-100%)
5. Top 3 action items to strengthen the application`
    : `Analyze this CV and provide comprehensive feedback:

CV Content:
${cvText}

Please provide:
1. Key strengths
2. Areas for improvement
3. Missing sections or information
4. Specific recommendations to strengthen the CV
5. Top 3 action items for improvement`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

export const generateCoverLetter = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    const { jobTitle, companyName, jobDescription, cvHighlights, tone } =
      req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({
        error: "Job title and company name are required",
      });
    }

    const prompt = `Write a professional cover letter with the following details:

Job Title: ${jobTitle}
Company Name: ${companyName}
${jobDescription ? `Job Description:\n${jobDescription}\n` : ""}${
        cvHighlights
          ? `Key Qualifications from CV:\n${cvHighlights}\n`
          : ""
      }Tone: ${tone || "professional"}

Please write a compelling cover letter that:
1. Opens with strong attention-grabber
2. Shows knowledge of the company
3. Highlights relevant skills and experience
4. Demonstrates cultural fit
5. Ends with a call-to-action
6. Is about 250-350 words

Format the output as a complete, ready-to-use cover letter.`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const coverLetter = response.choices[0].message.content;

    res.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error("Cover Letter Generation Error:", error);

    if (isQuotaError(error)) {
      return res.json({
        success: true,
        fallback: true,
        coverLetter: buildCoverLetterFallback({
          jobTitle: req.body?.jobTitle || "the role",
          companyName: req.body?.companyName || "the company",
          cvHighlights: req.body?.cvHighlights || "",
          tone: req.body?.tone || "professional",
        }),
      });
    }

    res.status(500).json({
      error: error.message || "Failed to generate cover letter",
    });
  }
};

export const generateJobDescription = async (req, res) => {
  try {
    const { jobTitle, companyName, department, seniority, keyResponsibilities } =
      req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({
        error: "Job title and company name are required",
      });
    }

    if (!process.env.OPENAI_API_KEY || String(process.env.OPENAI_API_KEY).includes("REDACTED")) {
      return res.json({
        success: true,
        fallback: true,
        jobDescription: buildJobDescriptionFallback({
          jobTitle,
          companyName,
          department: department || "",
          seniority: seniority || "",
          keyResponsibilities: keyResponsibilities || "",
        }),
      });
    }

    const openai = getOpenAIClient();

    const prompt = `Create a job description for the following position and format it with these exact sections only:

1. Job Description
2. Requirements
3. Duties
4. Qualifications

Job Title: ${jobTitle}
Company Name: ${companyName}
${department ? `Department: ${department}` : ""}
${seniority ? `Seniority Level: ${seniority}` : ""}
${
  keyResponsibilities
    ? `Key Responsibilities:\n${keyResponsibilities}`
    : ""
}

Please write the output as:

Job Description:
- 2 to 3 sentences describing the role and purpose.

Requirements:
- 4 to 6 bullet points covering skills, experience, and expectations.

Duties:
- 5 to 7 bullet points covering day-to-day responsibilities.

Qualifications:
- 4 to 6 bullet points covering must-have and preferred qualifications.

Do not include any other sections.`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const jobDescription = response.choices[0].message.content;

    res.json({
      success: true,
      jobDescription,
    });
  } catch (error) {
    console.error("Job Description Generation Error:", error);

    if (isQuotaError(error)) {
      return res.json({
        success: true,
        fallback: true,
        jobDescription: buildJobDescriptionFallback({
          jobTitle: req.body?.jobTitle || "Job Role",
          companyName: req.body?.companyName || "Company",
          department: req.body?.department || "",
          seniority: req.body?.seniority || "",
          keyResponsibilities: req.body?.keyResponsibilities || "",
        }),
      });
    }

    res.status(500).json({
      error: error.message || "Failed to generate job description",
    });
  }
};

export const draftFormText = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    const {
      jobTitle,
      companyName,
      jobDescription,
      responsibilities,
      skills,
      candidateName,
      candidateEmail,
      candidatePhone,
      coverLetter,
      message,
    } = req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({
        error: "Job title and company name are required",
      });
    }

    const prompt = `You are drafting text for a job application page.

Return a JSON object with these keys exactly:
- coverLetter
- message
- suggestedName
- suggestedEmail
- suggestedPhone

Rules:
- Make the cover letter professional, specific, and ready to send.
- Make the message concise and suitable for an employer contact form.
- Preserve the candidate's existing contact details when provided.
- If existing draft text is provided, improve it instead of replacing useful details.

Job Title: ${jobTitle}
Company Name: ${companyName}
${jobDescription ? `Job Description: ${jobDescription}\n` : ""}
${responsibilities ? `Responsibilities: ${responsibilities}\n` : ""}
${skills ? `Skills: ${skills}\n` : ""}
${candidateName ? `Candidate Name: ${candidateName}\n` : ""}
${candidateEmail ? `Candidate Email: ${candidateEmail}\n` : ""}
${candidatePhone ? `Candidate Phone: ${candidatePhone}\n` : ""}
${coverLetter ? `Current Cover Letter Draft: ${coverLetter}\n` : ""}
${message ? `Current Message Draft: ${message}\n` : ""}`;

    if (!process.env.OPENAI_API_KEY || String(process.env.OPENAI_API_KEY).includes("REDACTED")) {
      return res.json({
        success: true,
        fallback: true,
        drafts: buildFormDraftFallback({
          jobTitle,
          companyName,
          jobDescription: jobDescription || "",
          responsibilities: responsibilities || "",
          skills: skills || "",
          candidateName: candidateName || "",
          candidateEmail: candidateEmail || "",
          candidatePhone: candidatePhone || "",
          coverLetter: coverLetter || "",
          message: message || "",
        }),
      });
    }

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
      temperature: 0.6,
    });

    const content = response.choices[0].message.content || "{}";
    let drafts;

    try {
      drafts = JSON.parse(content);
    } catch {
      drafts = buildFormDraftFallback({
        jobTitle,
        companyName,
        jobDescription: jobDescription || "",
        responsibilities: responsibilities || "",
        skills: skills || "",
        candidateName: candidateName || "",
        candidateEmail: candidateEmail || "",
        candidatePhone: candidatePhone || "",
        coverLetter: coverLetter || "",
        message: message || "",
      });
    }

    res.json({
      success: true,
      drafts,
    });
  } catch (error) {
    console.error("Form Draft Generation Error:", error);

    if (isQuotaError(error)) {
      return res.json({
        success: true,
        fallback: true,
        drafts: buildFormDraftFallback({
          jobTitle: req.body?.jobTitle || "the role",
          companyName: req.body?.companyName || "the company",
          jobDescription: req.body?.jobDescription || "",
          responsibilities: req.body?.responsibilities || "",
          skills: req.body?.skills || "",
          candidateName: req.body?.candidateName || "",
          candidateEmail: req.body?.candidateEmail || "",
          candidatePhone: req.body?.candidatePhone || "",
          coverLetter: req.body?.coverLetter || "",
          message: req.body?.message || "",
        }),
      });
    }

    res.status(500).json({
      error: error.message || "Failed to draft form text",
    });
  }
};

export const draftJobPost = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    const {
      title,
      company,
      location,
      category,
      employmentType,
      salaryRange,
      experienceLevel,
      description,
      responsibilities,
      skills,
      tags,
    } = req.body;

    if (!title || !company || !location) {
      return res.status(400).json({
        error: "Job title, company, and location are required",
      });
    }

    const prompt = `You are drafting an internal job posting form.

Return a JSON object with these keys exactly:
- title
- company
- location
- category
- employmentType
- salaryRange
- experienceLevel
- description
- responsibilities
- skills
- tags

Rules:
- Improve or complete the fields based on the provided inputs.
- Use concise comma-separated strings for responsibilities, skills, and tags.
- Make the description ready to publish.

Job Title: ${title}
Company: ${company}
Location: ${location}
${category ? `Category: ${category}\n` : ""}
${employmentType ? `Employment Type: ${employmentType}\n` : ""}
${salaryRange ? `Salary Range: ${salaryRange}\n` : ""}
${experienceLevel ? `Experience Level: ${experienceLevel}\n` : ""}
${description ? `Current Description: ${description}\n` : ""}
${responsibilities ? `Current Responsibilities: ${responsibilities}\n` : ""}
${skills ? `Current Skills: ${skills}\n` : ""}
${tags ? `Current Tags: ${tags}\n` : ""}`;

    if (!process.env.OPENAI_API_KEY || String(process.env.OPENAI_API_KEY).includes("REDACTED")) {
      return res.json({
        success: true,
        fallback: true,
        draft: buildJobPostDraftFallback({
          title,
          company,
          location,
          category: category || "",
          employmentType: employmentType || "",
          salaryRange: salaryRange || "",
          experienceLevel: experienceLevel || "",
          description: description || "",
          responsibilities: responsibilities || "",
          skills: skills || "",
          tags: tags || "",
        }),
      });
    }

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1200,
      temperature: 0.6,
    });

    const content = response.choices[0].message.content || "{}";
    let draft;

    try {
      draft = JSON.parse(content);
    } catch {
      draft = buildJobPostDraftFallback({
        title,
        company,
        location,
        category: category || "",
        employmentType: employmentType || "",
        salaryRange: salaryRange || "",
        experienceLevel: experienceLevel || "",
        description: description || "",
        responsibilities: responsibilities || "",
        skills: skills || "",
        tags: tags || "",
      });
    }

    res.json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error("Job Post Draft Generation Error:", error);

    if (isQuotaError(error)) {
      return res.json({
        success: true,
        fallback: true,
        draft: buildJobPostDraftFallback({
          title: req.body?.title || "Job Title",
          company: req.body?.company || "Company",
          location: req.body?.location || "Location",
          category: req.body?.category || "",
          employmentType: req.body?.employmentType || "",
          salaryRange: req.body?.salaryRange || "",
          experienceLevel: req.body?.experienceLevel || "",
          description: req.body?.description || "",
          responsibilities: req.body?.responsibilities || "",
          skills: req.body?.skills || "",
          tags: req.body?.tags || "",
        }),
      });
    }

    res.status(500).json({
      error: error.message || "Failed to draft job post",
    });
  }
};
