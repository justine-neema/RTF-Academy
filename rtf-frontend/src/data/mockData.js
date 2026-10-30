// Mock data shaped to match RTF Academy API Endpoint Specification (Phase 2).
// Swap these for real fetch() calls to the Django backend once it's live —
// the shapes here already match the documented response bodies.

export const COURSES = [
  {
    id: 1,
    title: 'Digital Literacy',
    subtitle: 'Digital Literacy For Young Youth',
    description:
      'This foundational course equips refugee youth with essential digital skills — computers, internet, email, and productivity tools.',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80',
    duration_hours: 12,
    level: 'Beginner',
    enrollment_count: 145,
    featured: true,
    outcomes: [
      'Operate a computer independently',
      'Navigate the internet safely',
      'Communicate via email professionally',
      'Use basic productivity tools',
    ],
    modules: [
      {
        id: 101,
        title: 'Computer Basics',
        order: 1,
        lessons: [
          { id: 1001, title: 'Introduction to Computers', type: 'video', duration_minutes: 15 },
          { id: 1002, title: 'Hardware vs Software', type: 'video', duration_minutes: 12 },
          { id: 1003, title: 'Module Quiz', type: 'quiz', duration_minutes: 10 },
        ],
      },
      {
        id: 102,
        title: 'Internet Skills',
        order: 2,
        lessons: [
          { id: 1004, title: 'Browsing Safely', type: 'video', duration_minutes: 14 },
          { id: 1005, title: 'Search Techniques', type: 'video', duration_minutes: 10 },
        ],
      },
      {
        id: 103,
        title: 'Online Safety',
        order: 3,
        locked: true,
        lessons: [
          { id: 1006, title: 'Protecting Personal Information', type: 'video', duration_minutes: 10 },
        ],
      },
      {
        id: 104,
        title: 'Email & Communication',
        order: 4,
        locked: true,
        lessons: [
          { id: 1007, title: 'Writing Professional Emails', type: 'video', duration_minutes: 12 },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'English Language Essentials',
    subtitle: 'English Language Essentials',
    description:
      'This course equips learners with essential English communication skills for academic, professional, and everyday contexts. It focuses on developing competence in listening, speaking, reading, writing, grammar, and vocabulary through interactive lessons and practical activities.',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    duration_hours: 15,
    level: 'Beginner',
    enrollment_count: 120,
    featured: true,
    outcomes: [
      'Communicate confidently in English',
      'Understand core grammar structures',
      'Write clear paragraphs and emails',
      'Read and interpret short texts',
    ],
    modules: [
      {
        id: 201,
        title: 'Introduction to English Communication',
        order: 1,
        lessons: [
          {
            id: 2001,
            title: 'Importance of English Communication',
            type: 'video',
            duration_minutes: 12,
            video_url: 'https://youtu.be/PcDut8zfAsk?si=9YLfOqqV9eeopNns',
            description: 'Introduction to Communication, Benefits of Learning English, and Self-Assessment Activity',
          },
          {
            id: 2002,
            title: 'Parts of Speech',
            type: 'video',
            duration_minutes: 14,
            video_url: 'https://youtu.be/SceDmiBEESI?si=gOWt87NAbrBYn5eW',
            description: 'Learn about Nouns, Pronouns, Verbs, Adjectives, and Adverbs with practice exercises',
          },
        ],
      },
      {
        id: 202,
        title: 'Grammar Essentials',
        order: 2,
        lessons: [
          {
            id: 2003,
            title: 'Sentence Structure and Tenses',
            type: 'video',
            duration_minutes: 16,
            video_url: 'https://youtu.be/QXVzmzhxWWc?si=hdXZJh-YRP0NQLbl',
            description: 'Master proper sentence structure, verb tenses, subject-verb agreement, punctuation and capitalization',
          },
          {
            id: 2004,
            title: 'Grammar Practice Quiz',
            type: 'quiz',
            duration_minutes: 15,
          },
        ],
      },
      {
        id: 203,
        title: 'Reading Skills',
        order: 3,
        lessons: [
          {
            id: 2005,
            title: 'Reading Strategies and Comprehension',
            type: 'video',
            duration_minutes: 13,
            video_url: 'https://youtube.com/shorts/zPXlnqVYwsE?si=PU61F0uaBRk1haQ_',
            description: 'Learn reading strategies, identify main ideas, make inferences, and improve reading comprehension',
          },
          {
            id: 2006,
            title: 'Reading Comprehension Exercise',
            type: 'quiz',
            duration_minutes: 15,
          },
        ],
      },
      {
        id: 204,
        title: 'Writing Skills',
        order: 4,
        lessons: [
          {
            id: 2007,
            title: 'Paragraph and Essay Writing',
            type: 'video',
            duration_minutes: 18,
            video_url: 'https://youtu.be/UiHoNctRxQE?si=mP9tFCvosPG9wYtb',
            description: 'Learn paragraph writing, essay writing, business emails, and report writing with editing tips',
          },
          {
            id: 2008,
            title: 'Writing Assignment',
            type: 'quiz',
            duration_minutes: 30,
          },
        ],
      },
      {
        id: 205,
        title: 'Speaking and Listening',
        order: 5,
        lessons: [
          {
            id: 2009,
            title: 'Speaking and Listening Skills',
            type: 'video',
            duration_minutes: 15,
            video_url: 'https://youtu.be/O5rkrLzASHI?si=gj7m3P41UlaWsYJN',
            description: 'Develop confidence in speaking, public speaking, presentation skills, and active listening techniques',
          },
          {
            id: 2010,
            title: 'Final Assessment',
            type: 'quiz',
            duration_minutes: 20,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Entrepreneurship',
    subtitle: 'Entrepreneurship & Financial Literacy',
    description:
      'Develop entrepreneurial thinking and financial management skills to identify opportunities, start businesses, and manage finances.',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    duration_hours: 15,
    level: 'Beginner',
    enrollment_count: 198,
    featured: true,
    outcomes: [
      'Identify viable business ideas',
      'Apply SWOT analysis to a business idea',
      'Build a personal budget and savings plan',
      'Set SMART personal and business goals',
    ],
    modules: [
      { id: 301, title: 'Entrepreneurship Fundamentals', order: 1, lessons: [] },
      { id: 302, title: 'Career & Entrepreneurial Pathways', order: 2, lessons: [] },
      { id: 303, title: 'Financial Literacy', order: 3, lessons: [] },
      { id: 304, title: 'Setting Personal Goals', order: 4, lessons: [] },
      { id: 305, title: 'Business Ideas & Opportunities', order: 5, lessons: [] },
    ],
  },
]

// Module-level quiz mirroring GET /assessments/module/{module_id}
export const SAMPLE_ASSESSMENT = {
  assessment_id: 201,
  module_id: 101,
  title: 'Computer Basics Quiz',
  time_limit_minutes: 10,
  attempts_allowed: 3,
  passing_threshold: 70,
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      text: 'What is an operating system?',
      options: [
        'A type of keyboard',
        'Software that manages hardware',
        'A brand of computer',
      ],
    },
    {
      id: 'q2',
      type: 'multiple_choice',
      text: 'Which of these is an input device?',
      options: ['Monitor', 'Printer', 'Mouse'],
    },
    {
      id: 'q3',
      type: 'true_false',
      text: 'A computer can function without any software.',
      options: ['True', 'False'],
    },
  ],
}

// English Language Essentials - Module Assessments
export const ENGLISH_MODULE_1_ASSESSMENT = {
  assessment_id: 201,
  module_id: 201,
  title: 'Introduction to English Communication Quiz',
  time_limit_minutes: 15,
  attempts_allowed: 3,
  passing_threshold: 70,
  questions: [
    {
      id: 'e1_q1',
      type: 'multiple_choice',
      text: 'What is the main purpose of communication?',
      options: [
        'To entertain people',
        'To share ideas and information',
        'To write stories',
        'To learn mathematics',
      ],
    },
    {
      id: 'e1_q2',
      type: 'multiple_choice',
      text: 'Which language is widely used for international communication?',
      options: ['French', 'English', 'Swahili', 'Arabic'],
    },
    {
      id: 'e1_q3',
      type: 'multiple_choice',
      text: 'Which of the following is a benefit of learning English?',
      options: [
        'Better job opportunities',
        'Improved communication',
        'Access to global information',
        'All of the above',
      ],
    },
    {
      id: 'e1_q4',
      type: 'multiple_choice',
      text: 'Communication helps people:',
      options: [
        'Build relationships',
        'Solve problems',
        'Share ideas',
        'All of the above',
      ],
    },
    {
      id: 'e1_q5',
      type: 'multiple_choice',
      text: 'Why is English important in education?',
      options: [
        'It is the language of many textbooks and research materials',
        'It replaces all other languages',
        'It is only used in schools',
        'It is only spoken in one country',
      ],
    },
  ],
}

export const ENGLISH_MODULE_2_ASSESSMENT = {
  assessment_id: 202,
  module_id: 202,
  title: 'Grammar Essentials Quiz',
  time_limit_minutes: 15,
  attempts_allowed: 3,
  passing_threshold: 70,
  questions: [
    {
      id: 'e2_q1',
      type: 'multiple_choice',
      text: 'Which sentence is correct?',
      options: [
        'She go to school',
        'She goes to school',
        'She is going to school',
        'She went to school',
      ],
    },
    {
      id: 'e2_q2',
      type: 'multiple_choice',
      text: 'Which punctuation ends a question?',
      options: ['.', ',', '?', '!'],
    },
    {
      id: 'e2_q3',
      type: 'multiple_choice',
      text: 'Which sentence uses capitalization correctly?',
      options: [
        'i live in Rwanda',
        'I live in Rwanda',
        'I live in rwanda',
        'i Live in Rwanda',
      ],
    },
    {
      id: 'e2_q4',
      type: 'multiple_choice',
      text: 'The students _____ studying.',
      options: ['is', 'are', 'was', 'am'],
    },
    {
      id: 'e2_q5',
      type: 'multiple_choice',
      text: 'Which sentence is complete?',
      options: [
        'Running fast',
        'The children played football',
        'After school',
        'Because it rained',
      ],
    },
  ],
}

export const ENGLISH_MODULE_3_ASSESSMENT = {
  assessment_id: 203,
  module_id: 203,
  title: 'Reading Skills Quiz',
  time_limit_minutes: 15,
  attempts_allowed: 3,
  passing_threshold: 70,
  questions: [
    {
      id: 'e3_q1',
      type: 'multiple_choice',
      text: 'What is the main idea?',
      options: [
        'The title of the passage',
        'The central point or theme of the text',
        'The first sentence',
        'All the details in the text',
      ],
    },
    {
      id: 'e3_q2',
      type: 'multiple_choice',
      text: 'What are supporting details?',
      options: [
        'Information that supports the main idea',
        'The conclusion',
        'The introduction',
        'Examples and facts that develop the main idea',
      ],
    },
    {
      id: 'e3_q3',
      type: 'multiple_choice',
      text: 'What does "inference" mean?',
      options: [
        'A direct statement in the text',
        'A conclusion based on evidence and reasoning',
        'The topic of the text',
        'A question about the text',
      ],
    },
    {
      id: 'e3_q4',
      type: 'multiple_choice',
      text: 'Which reading strategy helps you understand unfamiliar words?',
      options: [
        'Skimming',
        'Scanning',
        'Using context clues',
        'Speed reading',
      ],
    },
    {
      id: 'e3_q5',
      type: 'multiple_choice',
      text: 'What is context?',
      options: [
        'The word definition',
        'The surrounding words and phrases that help clarify meaning',
        'The title of the text',
        'The author information',
      ],
    },
  ],
}

export const ENGLISH_MODULE_4_ASSESSMENT = {
  assessment_id: 204,
  module_id: 204,
  title: 'Writing Skills Quiz',
  time_limit_minutes: 20,
  attempts_allowed: 3,
  passing_threshold: 70,
  questions: [
    {
      id: 'e4_q1',
      type: 'multiple_choice',
      text: 'What is the main part of a paragraph?',
      options: [
        'Introduction',
        'Body',
        'Conclusion',
        'Topic sentence',
      ],
    },
    {
      id: 'e4_q2',
      type: 'multiple_choice',
      text: 'What is the purpose of a topic sentence?',
      options: [
        'To end the paragraph',
        'To introduce the main idea of the paragraph',
        'To provide evidence',
        'To conclude the essay',
      ],
    },
    {
      id: 'e4_q3',
      type: 'multiple_choice',
      text: 'What should you do when proofreading?',
      options: [
        'Check for grammar, spelling, and punctuation errors',
        'Rewrite the entire text',
        'Change the main ideas',
        'Add new paragraphs',
      ],
    },
    {
      id: 'e4_q4',
      type: 'multiple_choice',
      text: 'How many paragraphs should a basic essay have?',
      options: ['Two', 'Three', 'Five', 'Seven'],
    },
    {
      id: 'e4_q5',
      type: 'multiple_choice',
      text: 'What is the structure of a business email?',
      options: [
        'Greeting, Body, Closing Signature',
        'Title, Body, Conclusion',
        'Introduction, Evidence, Summary',
        'Salutation, Content, Sign-off',
      ],
    },
  ],
}

export const ENGLISH_MODULE_5_ASSESSMENT = {
  assessment_id: 205,
  module_id: 205,
  title: 'Speaking and Listening Final Assessment',
  time_limit_minutes: 20,
  attempts_allowed: 2,
  passing_threshold: 70,
  questions: [
    {
      id: 'e5_q1',
      type: 'multiple_choice',
      text: 'What is active listening?',
      options: [
        'Just hearing what someone says',
        'Fully concentrating and understanding what the speaker is saying',
        'Thinking about what you will say next',
        'Ignoring distractions',
      ],
    },
    {
      id: 'e5_q2',
      type: 'multiple_choice',
      text: 'Which is an important element of public speaking?',
      options: [
        'Speaking very fast',
        'Eye contact and confidence',
        'Reading directly from notes',
        'Avoiding audience interaction',
      ],
    },
    {
      id: 'e5_q3',
      type: 'multiple_choice',
      text: 'What should you do before giving a presentation?',
      options: [
        'Practice multiple times',
        'Memorize everything word for word',
        'Speak very quickly',
        'Avoid eye contact',
      ],
    },
    {
      id: 'e5_q4',
      type: 'multiple_choice',
      text: 'Why is pronunciation important in speaking?',
      options: [
        'It sounds nice',
        'It helps the listener understand you better',
        'It is not important',
        'It makes you talk faster',
      ],
    },
    {
      id: 'e5_q5',
      type: 'multiple_choice',
      text: 'What does fluency mean?',
      options: [
        'Speaking without making mistakes',
        'Speaking very loudly',
        'Speaking smoothly and naturally without long pauses',
        'Speaking the same in all languages',
      ],
    },
  ],
}


export const ADMIN_STATS = {
  total_users: 247,
  total_users_growth: '+18%',
  active_courses: 3,
  average_completion_rate: 72,
  average_completion_growth: '+5%',
  certificates_issued: 89,
  certificates_growth: '+12',
  monthly_enrollments: [
    { month: 'Jan', enrollments: 32 },
    { month: 'Feb', enrollments: 41 },
    { month: 'Mar', enrollments: 38 },
    { month: 'Apr', enrollments: 47 },
    { month: 'May', enrollments: 52 },
    { month: 'Jun', enrollments: 44 },
  ],
  course_performance: [
    { title: 'Digital Literacy', completion: 80 },
    { title: 'English Language', completion: 60 },
  ],
  recent_activity: [
    { name: 'Brian Nziza', course: 'Digital Literacy', progress: 85, status: 'Complete' },
    { name: 'Keza Julia', course: 'Science', progress: 75, status: 'Failed' },
    { name: 'Kevin Nziza', course: 'Digital Literacy', progress: 60, status: 'In Progress' },
    { name: 'Beza Feza', course: 'Social studies', progress: 81, status: 'Failed' },
  ],
}
