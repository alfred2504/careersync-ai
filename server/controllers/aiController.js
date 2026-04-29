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
Job Summary:
${companyName} is seeking a ${jobTitle} to drive execution, collaboration, and business impact through high-quality delivery.

Key Responsibilities:
- Deliver core outcomes for the ${jobTitle} function and track progress against goals.
- Collaborate with cross-functional teams to define priorities and timelines.
- Maintain quality standards, documentation, and communication with stakeholders.
- Identify process improvements and contribute to operational excellence.
${keyResponsibilities ? `- Additional focus areas: ${keyResponsibilities}\n` : ""}
Required Qualifications:
- Relevant professional experience in a similar role.
- Strong communication and problem-solving skills.
- Ability to prioritize work in a fast-paced environment.
- Proficiency with standard tools used in the role.

Preferred Qualifications:
- Experience in high-growth or cross-functional environments.
- Demonstrated ownership and measurable results.
- Domain knowledge relevant to ${companyName}'s business.

What We Offer:
- Collaborative and growth-oriented team culture.
- Competitive compensation and development opportunities.
- Meaningful work with visible impact.`;
};

export const analyzeCV = async (req, res) => {
  try {
    const openai = getOpenAIClient();
    const { cvText, jobDescription } = req.body;

    if (!cvText) {
      return res.status(400).json({ error: "CV text is required" });
    }

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
    const openai = getOpenAIClient();
    const { jobTitle, companyName, department, seniority, keyResponsibilities } =
      req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({
        error: "Job title and company name are required",
      });
    }

    const prompt = `Create a comprehensive job description for the following position:

Job Title: ${jobTitle}
Company Name: ${companyName}
${department ? `Department: ${department}` : ""}
${seniority ? `Seniority Level: ${seniority}` : ""}
${
  keyResponsibilities
    ? `Key Responsibilities:\n${keyResponsibilities}`
    : ""
}

Please generate a professional job description including:

1. **Job Summary** (2-3 sentences)
   - Brief overview of the role and impact

2. **Key Responsibilities** (5-7 bullet points)
   - Main duties and day-to-day activities

3. **Required Qualifications** (4-6 bullet points)
   - Must-have skills and experience

4. **Preferred Qualifications** (3-5 bullet points)
   - Nice-to-have skills and experience

5. **Skills & Competencies** (5-7 areas)
   - Technical and soft skills required

6. **What We Offer** (3-4 bullet points)
   - Benefits and opportunities

Format as a complete, ready-to-post job description.`;

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
